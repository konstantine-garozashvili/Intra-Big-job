import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, X, Calendar, File, FileCheck, FileX, Info, Clock, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { notificationService } from '@/lib/services/notificationService';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import NotificationBadge from './NotificationBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const NotificationIcon = ({ type }) => {
  // Adapter les types de notification Mercure
  switch (type) {
    case 'DOCUMENT_APPROVED':
    case 'document_approved':
      return <FileCheck className="h-4 w-4 text-green-500" />;
    case 'DOCUMENT_REJECTED':
    case 'document_rejected':
      return <FileX className="h-4 w-4 text-red-500" />;
    case 'DOCUMENT_UPLOADED':
    case 'document_uploaded':
    case 'CV_UPLOADED':
      return <File className="h-4 w-4 text-blue-500" />;
    case 'DOCUMENT_DELETED':
    case 'document_deleted':
      return <Trash2 className="h-4 w-4 text-red-500" />;
    case 'system':
      return <Info className="h-4 w-4 text-gray-500" />;
    case 'announcement':
      return <Calendar className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const NotificationItem = ({ notification, onRead }) => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  
  const handleClick = async () => {
    try {
      // Marquer comme lu avant la navigation
      if (!notification.isRead && !notification.readAt) {
        if (notification.id) {
          await notificationService.markAsRead(notification.id);
        } else {
          // Si c'est une notification Mercure sans ID standard, la marquer comme lue localement
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
      }
      
      // Toujours naviguer vers la page de notifications
      navigate('/notifications');
      
      // Appeler le callback après la navigation
      if (onRead) {
        onRead(notification);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };
  
  return (
    <DropdownMenuItem
      className={cn(
        "flex flex-col items-start py-3 px-4 gap-1 border-b last:border-b-0 dark:border-gray-700 cursor-pointer",
        (!notification.isRead && !notification.readAt) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      <div className="flex items-center w-full">
        <span className="mr-2">
          <NotificationIcon type={notification.type} />
        </span>
        <span className="font-medium flex-grow truncate">
          {notification.title}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
          {formatDistanceToNow(new Date(notification.createdAt), { 
            addSuffix: true, 
            locale: fr 
          })}
        </span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 pl-6">
        {notification.message}
      </div>
      
      {isHovering && (
        <div className="pl-6 text-xs text-blue-600 dark:text-blue-400 mt-1">
          Cliquer pour voir toutes les notifications
        </div>
      )}
    </DropdownMenuItem>
  );
};

const EmptyNotifications = () => (
  <div className="px-4 py-8 text-center">
    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Pas de notification</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
      Vous n'avez aucune notification pour le moment
    </p>
  </div>
);

const NotificationSkeleton = () => (
  <div className="px-4 py-3 border-b last:border-b-0 dark:border-gray-700">
    <div className="flex items-center w-full">
      <Skeleton className="h-4 w-4 rounded-full mr-2" />
      <Skeleton className="h-4 flex-grow" />
      <Skeleton className="h-3 w-16 ml-2" />
    </div>
    <div className="pl-6 mt-1">
      <Skeleton className="h-3 w-full mt-1" />
      <Skeleton className="h-3 w-3/4 mt-1" />
    </div>
  </div>
);

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Initialiser la connexion Mercure au montage
  useEffect(() => {
    // Initialiser Mercure lorsque le composant est monté
    notificationService.initMercure();
    
    // Nettoyer la connexion lorsque le composant est démonté
    return () => {
      notificationService.closeMercureConnection();
    };
  }, []);
  
  // Fonction pour charger les notifications
  const loadNotifications = useCallback(async () => {
    if (open) {
      setLoading(true);
      try {
        // Avec Mercure, nous pouvons directement utiliser le cache sans forcer de rafraîchissement
        if (notificationService.cache.notifications) {
          // Filtrer les notifications pour n'en prendre que 5
          const cachedNotifs = notificationService.cache.notifications.notifications || [];
          const sortedNotifs = [...cachedNotifs].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          ).slice(0, 5);
          
          setNotifications(sortedNotifs);
          setUnreadCount(
            cachedNotifs.filter(n => !n.isRead && !n.readAt).length
          );
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
  }, [open]);
  
  // Charger les notifications quand le menu est ouvert
  useEffect(() => {
    loadNotifications();
  }, [open, loadNotifications]);
  
  // S'abonner aux changements de notifications
  useEffect(() => {
    const unsubscribe = notificationService.subscribe(data => {
      if (!open) {
        // Mettre à jour uniquement le compteur si le menu est fermé
        setUnreadCount(data.unreadCount);
      } else {
        // Si le menu est ouvert, mettre à jour les notifications également
        if (data.notifications && Array.isArray(data.notifications)) {
          // Filtrer pour n'afficher que les 5 dernières
          const sortedNotifs = [...data.notifications]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          
          setNotifications(sortedNotifs);
          setUnreadCount(data.unreadCount);
        }
      }
    });
    
    // Nettoyage lors du démontage
    return () => unsubscribe();
  }, [open]);
  
  // Gérer la fermeture du menu
  const handleOpenChange = useCallback((isOpen) => {
    setOpen(isOpen);
    
    // Si le menu se ferme, recharger le compteur de notifications
    if (!isOpen) {
      notificationService.getUnreadCount(true)
        .catch(err => console.warn('Failed to refresh notification count:', err));
    }
  }, []);
  
  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      
      // Forcer le rechargement des notifications
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };
  
  const handleNotificationRead = useCallback(async (notification) => {
    // Le menu sera fermé car on navigue ailleurs
    setOpen(false);
    
    // Forcer le rechargement du compteur
    try {
      await notificationService.getUnreadCount(true);
    } catch (error) {
      console.warn('Failed to refresh notification count:', error);
    }
  }, []);
  
  const navigate = useNavigate();
  
  const goToAllNotifications = (e) => {
    e.stopPropagation();
    setOpen(false);
    navigate('/notifications');
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative rounded-full w-10 h-10 p-0 bg-transparent text-gray-200 hover:bg-[#02284f]/80 hover:text-white mr-2 dark:text-[#78b9dd] dark:hover:bg-[#78b9dd]/20"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <NotificationBadge onClick={(e) => {
            e.stopPropagation();  // Empêcher la propagation pour éviter de déclencher le Trigger
            handleOpenChange(true); // Ouvrir manuellement le menu
          }} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 max-h-[80vh] overflow-hidden"
        sideOffset={5}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#02284f] to-[#03386b] p-3 text-white dark:from-[#01111e] dark:to-[#001f3d] dark:border-b dark:border-[#78b9dd]/20">
          <div className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            <h3 className="font-medium text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-red-500 rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-white/20 text-white"
                      onClick={handleMarkAllAsRead}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Tout marquer comme lu</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        
        {/* Notification List */}
        <div className="overflow-y-auto max-h-[350px]">
          {loading ? (
            <>
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </>
          ) : notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <NotificationItem 
                key={notification.id || `mercure-notification-${index}`} 
                notification={notification} 
                onRead={handleNotificationRead}
              />
            ))
          ) : (
            <EmptyNotifications />
          )}
        </div>
        
        {/* Footer */}
        <div className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700">
          <Button 
            variant="ghost" 
            className="w-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            onClick={goToAllNotifications}
          >
            Voir toutes les notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown; 