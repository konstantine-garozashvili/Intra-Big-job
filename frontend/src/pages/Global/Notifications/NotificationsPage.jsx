import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileCheck, FileX, File, Info, Calendar, Check, Undo, ChevronLeft, ChevronRight, Filter, Trash } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { notificationService } from '@/lib/services/notificationService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import NotificationBadge from '@/components/NotificationBadge';
import { toast } from 'sonner';
import MockModeBanner from '@/components/MockModeBanner';

// Composant pour afficher une icône en fonction du type de notification
const NotificationIcon = ({ type, className }) => {
  // Adapter les types pour les notifications Mercure
  switch (type) {
    case 'DOCUMENT_APPROVED':
    case 'document_approved':
      return <FileCheck className={cn("h-5 w-5 text-green-500", className)} />;
    case 'DOCUMENT_REJECTED':
    case 'document_rejected':
      return <FileX className={cn("h-5 w-5 text-red-500", className)} />;
    case 'DOCUMENT_UPLOADED':
    case 'document_uploaded':
    case 'CV_UPLOADED':
      return <File className={cn("h-5 w-5 text-blue-500", className)} />;
    case 'DOCUMENT_DELETED':
    case 'document_deleted':
      return <Trash className={cn("h-5 w-5 text-red-500", className)} />;
    case 'system':
      return <Info className={cn("h-5 w-5 text-gray-500", className)} />;
    case 'announcement':
      return <Calendar className={cn("h-5 w-5 text-purple-500", className)} />;
    default:
      return <Bell className={cn("h-5 w-5 text-gray-500", className)} />;
  }
};

// Composant pour une notification individuelle
const NotificationItem = ({ notification, onRead, onClick }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const formattedDate = format(new Date(notification.createdAt), 'dd MMM yyyy, HH:mm', { locale: fr });
  const relativeTime = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr });
  
  // Vérifier si la notification est lue (compatible avec le format Mercure)
  const isNotificationRead = notification.readAt || notification.isRead;
  
  return (
    <Card 
      className={cn(
        "cursor-pointer mb-3 transition-shadow hover:shadow-md",
        !isNotificationRead ? "border-l-4 border-l-blue-500 dark:border-l-blue-400" : ""
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onClick(notification)}
    >
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            <NotificationIcon type={notification.type} />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className={cn(
                "text-base font-medium",
                !isNotificationRead ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
              )}>
                {notification.title}
              </h3>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {relativeTime}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {formattedDate}
                </span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {notification.message}
            </p>
            
            {isHovering && notification.targetUrl && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                Cliquer pour voir les détails
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant de squelette pour le chargement
const NotificationSkeleton = () => (
  <Card className="mb-3">
    <CardContent className="p-4">
      <div className="flex items-start">
        <Skeleton className="h-5 w-5 rounded-full mr-3 mt-1" />
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-40" />
            <div className="flex flex-col items-end">
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Composant pour aucune notification
const EmptyNotifications = () => (
  <div className="text-center p-8">
    <Bell className="h-10 w-10 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Pas de notification</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
      Vous n'avez aucune notification pour le moment. Les notifications apparaîtront ici lorsque vous recevrez des mises à jour importantes.
    </p>
  </div>
);

// Page principale des notifications
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [activeTab, setActiveTab] = useState('all');
  const hasFetchedRef = useRef(false);
  const navigate = useNavigate();
  
  // État pour suivre si nous sommes en mode simulé
  const [isSimulatedMode, setIsSimulatedMode] = useState(false);
  
  const loadNotifications = async (page = 1, includeRead = true) => {
    if (loading && hasFetchedRef.current) return;
    
    setLoading(true);
    try {
      const cachedNotifications = notificationService.cache.notifications.notifications || [];
      
      const filteredNotifications = includeRead 
        ? cachedNotifications 
        : cachedNotifications.filter(n => !n.isRead && !n.readAt);
      
      const sortedNotifications = [...filteredNotifications].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      const total = sortedNotifications.length;
      const pages = Math.max(1, Math.ceil(total / pagination.limit));
      const startIndex = (page - 1) * pagination.limit;
      const paginatedNotifications = sortedNotifications.slice(
        startIndex, 
        startIndex + pagination.limit
      );
      
      setNotifications(paginatedNotifications);
      setPagination({
        page: page,
        limit: pagination.limit,
        total: total,
        pages: pages,
      });
      
      const unreadCount = cachedNotifications.filter(n => !n.isRead && !n.readAt).length;
      
      setIsSimulatedMode(notificationService.useMockBackend);
      
      setError(null);
      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Error loading notifications:', error);
      
      if (notifications.length === 0) {
        setError('Erreur lors du chargement des notifications. Veuillez réessayer.');
      }
      
      setIsSimulatedMode(notificationService.useMockBackend);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const includeRead = activeTab === 'all';
    loadNotifications(1, includeRead);
  }, [activeTab]);
  
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(data => {
      const includeRead = activeTab === 'all';
      loadNotifications(pagination.page, includeRead);
    });
    
    return () => unsubscribe();
  }, [activeTab, pagination.page]);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      const includeRead = activeTab === 'all';
      loadNotifications(newPage, includeRead);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      notificationService.markAllNotificationsAsReadLocally();
      
      setNotifications(notifications.map(notification => ({
        ...notification,
        readAt: new Date().toISOString(),
        isRead: true
      })));
      
      if (activeTab === 'unread') {
        loadNotifications(1, false);
      }
      
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Error marking all as read:', error);
      setError('Erreur lors du marquage des notifications comme lues.');
    }
  };
  
  const handleTabChange = (value) => {
    setActiveTab(value);
  };
  
  const createTestNotification = async (type = 'document', targetUrl = '/dashboard') => {
    try {
      await notificationService.createTestNotification(type, targetUrl);
      toast.success(`Notification de test (${type}) créée avec succès`);
      
      notificationService.resetCache();
      hasFetchedRef.current = false;
      
      setTimeout(() => {
        loadNotifications(1, activeTab === 'all');
      }, 100);
    } catch (error) {
      console.error('Error creating test notification:', error);
      toast.error(`Erreur lors de la création de la notification: ${error.message || 'Erreur inconnue'}`);
    }
  };
  
  const handleClick = async (notification) => {
    try {
      if (!notification.readAt && !notification.isRead) {
        const updatedNotifications = notifications.map(n => 
          n.id === notification.id ? { ...n, readAt: new Date().toISOString(), isRead: true } : n
        );
        setNotifications(updatedNotifications);
        
        notificationService.markNotificationAsReadLocally(notification.id);
      }
      
      if (notification.targetUrl && notification.targetUrl.startsWith('/')) {
        navigate(notification.targetUrl);
      } else {
        console.warn('Invalid targetUrl in notification:', notification.targetUrl);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (notification.targetUrl && notification.targetUrl.startsWith('/')) {
        navigate(notification.targetUrl);
      }
    }
  };
  
  const unreadCount = notifications.filter(n => !n.readAt && !n.isRead).length;
  
  const renderNotifications = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center p-8">
          <p className={isSimulatedMode ? "text-blue-500" : "text-red-500"}>
            {isSimulatedMode 
              ? "Le serveur n'est pas disponible. Les données sont simulées localement." 
              : error}
          </p>
          
          {!isSimulatedMode && (
            <Button 
              onClick={() => loadNotifications(pagination.page, activeTab === 'all')}
              variant="outline"
              className="mt-4"
            >
              <Undo className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
          
          {isSimulatedMode && (
            <Button 
              onClick={() => createTestNotification()}
              variant="outline"
              className="mt-4"
            >
              <Bell className="h-4 w-4 mr-2" />
              Créer une notification de test
            </Button>
          )}
        </div>
      );
    }
    
    if (notifications.length === 0) {
      return <EmptyNotifications />;
    }
    
    return (
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <NotificationItem 
            key={notification.id || `notification-${index}`} 
            notification={notification} 
            onRead={() => {
              if (activeTab === 'unread') {
                setTimeout(() => {
                  loadNotifications(pagination.page, false);
                }, 300);
              }
            }} 
            onClick={handleClick}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="container max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {activeTab === 'unread' && unreadCount > 0 && (
            <div className="ml-2 flex items-center">
              <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {unreadCount}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center"
            >
              <Check className="h-4 w-4 mr-2" />
              <span>Tout marquer comme lu</span>
            </Button>
          )}
          
          {isSimulatedMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span>Créer notification test</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => createTestNotification('document_uploaded', '/documents')}>
                  Document déposé
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createTestNotification('document_approved', '/documents')}>
                  Document approuvé
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createTestNotification('document_rejected', '/documents')}>
                  Document rejeté
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => createTestNotification('system', '/dashboard')}>
                  Message système
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => createTestNotification('announcement', '/events')}>
                  Annonce
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {isSimulatedMode && <MockModeBanner />}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Non lues
            {activeTab !== 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="pt-2">
          {renderNotifications()}
        </TabsContent>
        
        <TabsContent value="unread" className="pt-2">
          {renderNotifications()}
        </TabsContent>
      </Tabs>
      
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {pagination.page} sur {pagination.pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage; 