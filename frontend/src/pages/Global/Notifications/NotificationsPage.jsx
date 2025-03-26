import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileCheck, FileX, File, Info, Calendar, Check, Undo, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
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

// Composant pour afficher une icône en fonction du type de notification
const NotificationIcon = ({ type, className }) => {
  switch (type) {
    case 'document_approved':
      return <FileCheck className={cn("h-5 w-5 text-green-500", className)} />;
    case 'document_rejected':
      return <FileX className={cn("h-5 w-5 text-red-500", className)} />;
    case 'document_uploaded':
      return <File className={cn("h-5 w-5 text-blue-500", className)} />;
    case 'system':
      return <Info className={cn("h-5 w-5 text-gray-500", className)} />;
    case 'announcement':
      return <Calendar className={cn("h-5 w-5 text-purple-500", className)} />;
    default:
      return <Bell className={cn("h-5 w-5 text-gray-500", className)} />;
  }
};

// Composant pour une notification individuelle
const NotificationItem = ({ notification, onRead }) => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  
  const formattedDate = format(new Date(notification.createdAt), 'dd MMM yyyy, HH:mm', { locale: fr });
  const relativeTime = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr });
  
  const handleClick = async () => {
    try {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
      }
      if (notification.targetUrl) {
        navigate(notification.targetUrl);
      }
      if (onRead) {
        onRead(notification);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };
  
  return (
    <Card 
      className={cn(
        "cursor-pointer mb-3 transition-shadow hover:shadow-md",
        !notification.isRead ? "border-l-4 border-l-blue-500 dark:border-l-blue-400" : ""
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
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
                !notification.isRead ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
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
  
  // Fonction pour charger les notifications
  const loadNotifications = async (page = 1, includeRead = true) => {
    setLoading(true);
    try {
      const result = await notificationService.getNotifications(
        page, 
        pagination.limit, 
        includeRead,
        true
      );
      setNotifications(result.notifications || []);
      setPagination({
        page: page,
        limit: pagination.limit,
        total: result.pagination?.total || 0,
        pages: result.pagination?.pages || 1
      });
      setError(null);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Erreur lors du chargement des notifications. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les notifications au chargement de la page
  useEffect(() => {
    const includeRead = activeTab === 'all';
    loadNotifications(1, includeRead);
  }, [activeTab]);
  
  // Gérer le changement de page
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      const includeRead = activeTab === 'all';
      loadNotifications(newPage, includeRead);
    }
  };
  
  // Gérer le marquage de toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Mise à jour de l'UI sans recharger
      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true,
        readAt: new Date().toISOString()
      })));
      
      // Si on est sur l'onglet "non lues", recharger pour les retirer
      if (activeTab === 'unread') {
        loadNotifications(1, false);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      setError('Erreur lors du marquage des notifications comme lues.');
    }
  };
  
  // Gestion des onglets
  const handleTabChange = (value) => {
    setActiveTab(value);
  };
  
  // Rendu des notifications ou des états alternatifs
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
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <Button 
            onClick={() => loadNotifications(pagination.page, activeTab === 'all')}
            variant="outline"
            className="mt-4"
          >
            <Undo className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      );
    }
    
    if (notifications.length === 0) {
      return <EmptyNotifications />;
    }
    
    return (
      <div className="space-y-3">
        {notifications.map(notification => (
          <NotificationItem 
            key={notification.id} 
            notification={notification} 
            onRead={() => {
              // Rafraîchir la liste si on est dans l'onglet non lues
              if (activeTab === 'unread') {
                loadNotifications(pagination.page, false);
              }
            }} 
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
          {activeTab === 'unread' && pagination.total > 0 && (
            <div className="ml-2 flex items-center">
              <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {pagination.total}
              </div>
            </div>
          )}
        </div>
        
        {pagination.total > 0 && (
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
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Non lues
            {activeTab !== 'unread' && pagination.total > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {pagination.total > 99 ? '99+' : pagination.total}
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
      
      {/* Pagination */}
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