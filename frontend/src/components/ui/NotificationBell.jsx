import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../lib/hooks/useNotifications';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';
import { useAuth } from '@/contexts/AuthContext';

// Fonction utilitaire pour formatter la date
const formatTimestamp = (timestamp) => {
  try {
    // Si c'est un objet Firestore Timestamp
    if (timestamp && typeof timestamp.toDate === 'function') {
      return format(timestamp.toDate(), 'PPp', { locale: fr });
    }
    // Si c'est une date JavaScript
    else if (timestamp instanceof Date) {
      return format(timestamp, 'PPp', { locale: fr });
    }
    // Si c'est un timestamp en millisecondes
    else if (typeof timestamp === 'number') {
      return format(new Date(timestamp), 'PPp', { locale: fr });
    }
    // Si c'est une chaîne ISO
    else if (typeof timestamp === 'string') {
      return format(new Date(timestamp), 'PPp', { locale: fr });
    }
    return 'Date inconnue';
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return 'Date incorrecte';
  }
};

export const NotificationBell = () => {
  const { user } = useAuth();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  console.log('NotificationBell - User object from auth context:', user);
  console.log('NotificationBell - Rendering with:', {
    notificationsCount: notifications?.length,
    unreadCount,
    loading
  });

  if (loading) {
    console.log('NotificationBell - Still loading');
    return null;
  }

  const handleNotificationClick = (notificationId) => {
    console.log('NotificationBell - Notification clicked:', notificationId);
    markAsRead(notificationId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative p-2 rounded-full hover:bg-white/10 transition-colors mr-2"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6 text-gray-200 hover:text-white transition-colors" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 mt-2 p-0 overflow-hidden border border-gray-200 shadow-lg rounded-lg bg-white"
        sideOffset={5}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => {
                console.log('NotificationBell - Marking all as read');
                markAllAsRead();
              }}
              className="text-sm text-[#528eb2] hover:text-[#02284f] transition-colors"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Aucune notification
            </div>
          ) : (
            notifications.map((notification) => {
              console.log('NotificationBell - Rendering notification:', notification);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-[#528eb2]/10' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 