import React, { useState } from 'react';
import { Bell, ArrowRight, Settings, CheckCheck, Clock, FileCheck, FileX, File, Trash } from 'lucide-react';
import { useNotifications } from '../../lib/hooks/useNotifications';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from './dropdown-menu';
import { Button } from './button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Badge } from './badge';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/services/firebase';

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

// Fonction utilitaire pour obtenir le temps relatif
const getRelativeTime = (timestamp) => {
  try {
    if (!timestamp) return '';
    
    // Convertir le timestamp en Date si nécessaire
    let date;
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return '';
    }
    
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  } catch (error) {
    console.error('Erreur lors du calcul du temps relatif:', error);
    return '';
  }
};

// Configuration des types de notifications pour l'affichage
const notificationTypeConfig = {
  ROLE_UPDATE: {
    color: 'bg-blue-100 text-blue-800',
    icon: <Settings className="h-4 w-4 text-blue-600" />
  },
  INFO_UPDATE: {
    color: 'bg-teal-100 text-teal-800',
    icon: <User className="h-4 w-4 text-teal-600" />
  },
  SYSTEM: {
    color: 'bg-purple-100 text-purple-800',
    icon: <Bell className="h-4 w-4 text-purple-600" />
  },
  INFO: {
    color: 'bg-green-100 text-green-800',
    icon: <Bell className="h-4 w-4 text-green-600" />
  },
  WARNING: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Bell className="h-4 w-4 text-yellow-600" />
  },
  ALERT: {
    color: 'bg-red-100 text-red-800',
    icon: <Bell className="h-4 w-4 text-red-600" />
  },
  // Ajout des types de notification pour les documents
  DOCUMENT_APPROVED: {
    color: 'bg-green-100 text-green-800',
    icon: <FileCheck className="h-4 w-4 text-green-600" />
  },
  DOCUMENT_REJECTED: {
    color: 'bg-red-100 text-red-800',
    icon: <FileX className="h-4 w-4 text-red-600" />
  },
  DOCUMENT_UPLOADED: {
    color: 'bg-blue-100 text-blue-800',
    icon: <File className="h-4 w-4 text-blue-600" />
  },
  DOCUMENT_DELETED: {
    color: 'bg-red-100 text-red-800',
    icon: <Trash className="h-4 w-4 text-red-600" />
  },
  DOCUMENT_UPDATED: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <File className="h-4 w-4 text-yellow-600" />
  }
};

export const NotificationBell = () => {
  const { user } = useAuth();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isHovering, setIsHovering] = useState(false);

  console.log('NotificationBell - User object from auth context:', user);
  console.log('NotificationBell - userId from localStorage:', localStorage.getItem('userId'));
  console.log('NotificationBell - Rendering with:', {
    notificationsCount: notifications?.length,
    unreadCount,
    loading
  });

  // Journaliser les types de notifications reçus
  if (notifications?.length > 0) {
    console.log('NotificationBell - Notification types received:', notifications.map(n => n.type));
    console.log('NotificationBell - First notification details:', notifications[0]);
  } else {
    console.log('NotificationBell - No notifications available');
  }

  if (loading) {
    console.log('NotificationBell - Still loading');
    return null;
  }

  const handleNotificationClick = (notificationId) => {
    console.log('NotificationBell - Notification clicked:', notificationId);
    markAsRead(notificationId);
  };

  // Determine if user is a student or guest
  const isStudent = user?.roles?.includes('ROLE_STUDENT');
  const isGuest = user?.roles?.includes('ROLE_GUEST');
  console.log('NotificationBell - User roles detected:', { isStudent, isGuest });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative p-2 rounded-full hover:bg-white/10 transition-colors mr-2 group"
          aria-label="Notifications"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <motion.div
            animate={isHovering ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Bell className="h-5 w-5 text-gray-200 group-hover:text-white transition-colors" />
          </motion.div>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 mt-2 p-0 overflow-hidden border border-gray-200 shadow-lg rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
        sideOffset={5}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white dark:bg-red-600">
                {unreadCount}
              </Badge>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                onClick={() => {
                  console.log('NotificationBell - Marking all as read');
                  markAllAsRead();
                }}
                variant="ghost"
                size="sm"
                className="text-xs flex items-center gap-1 text-[#528eb2] hover:text-[#02284f] transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Tout marquer comme lu</span>
              </Button>
            )}
            {process.env.NODE_ENV === 'development' && (
              <Button
                onClick={async () => {
                  try {
                    console.log('NotificationBell - Creating test notification');
                    let userId = user?.id;
                    
                    // Get user ID from various sources
                    if (!userId) {
                      if (localStorage.getItem('user')) {
                        try {
                          const localUser = JSON.parse(localStorage.getItem('user'));
                          userId = localUser?.id;
                        } catch (e) {
                          console.error('Error parsing user from localStorage:', e);
                        }
                      }
                      
                      if (!userId) {
                        userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
                      }
                    }
                    
                    if (!userId) {
                      console.error('NotificationBell - No user ID found for test notification');
                      return;
                    }
                    
                    // Convert to string to ensure compatibility
                    userId = String(userId);
                    
                    console.log(`NotificationBell - Creating test notification for user ID: ${userId}`);
                    
                    const testNotification = {
                      recipientId: userId,
                      title: `Test notification for ${isStudent ? 'student' : isGuest ? 'guest' : 'user'}`,
                      message: `Ceci est une notification de test pour l'ID: ${userId}`,
                      type: 'DOCUMENT_UPLOADED', // Test avec type document spécifique
                      timestamp: new Date(),
                      read: false,
                      targetUrl: '/documents'
                    };
                    
                    console.log('NotificationBell - Adding test notification:', testNotification);
                    const docRef = await addDoc(collection(db, 'notifications'), testNotification);
                    console.log(`NotificationBell - Test notification added with ID: ${docRef.id}`);
                    
                    // Vérifier et afficher les rôles de l'utilisateur
                    if (user?.roles) {
                      console.log('NotificationBell - User roles:', user.roles);
                    } else {
                      console.log('NotificationBell - No roles found in user object');
                    }
                  } catch (error) {
                    console.error('NotificationBell - Error creating test notification:', error);
                  }
                }}
                variant="ghost"
                size="sm"
                className="text-xs p-1.5"
              >
                <Bell className="h-4 w-4 text-blue-500" />
              </Button>
            )}
            <Link to="/settings/notifications">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs p-1.5"
              >
                <Settings className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <Bell className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune notification</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Les notifications apparaîtront ici
              </p>
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => {
              console.log('NotificationBell - Rendering notification:', notification);
              const typeConfig = notificationTypeConfig[notification.type] || {
                color: 'bg-gray-100 text-gray-600',
                icon: <Bell className="h-4 w-4 text-gray-500" />
              };
              const relativeTime = getRelativeTime(notification.timestamp);
              
              // Journaliser chaque notification rendue
              console.log('NotificationBell - Notification type config:', {
                type: notification.type,
                hasConfig: !!notificationTypeConfig[notification.type],
                usingConfig: typeConfig
              });
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    !notification.read ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        typeConfig.color || 'bg-gray-100 text-gray-600'
                      }`}>
                        {typeConfig.icon || <Bell className="h-4 w-4" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`font-medium text-sm ${
                          !notification.read 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center">
                          {!notification.read ? (
                            <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
                          ) : (
                            <Clock className="h-3 w-3 text-gray-400 mr-2" />
                          )}
                          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {relativeTime}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs h-6 px-2 text-blue-600 dark:text-blue-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <CheckCheck className="h-3 w-3 mr-1" />
                          Marquer comme lue
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {notifications.length > 5 && (
          <div className="p-2 text-center border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {notifications.length - 5} notifications supplémentaires
            </p>
          </div>
        )}
        
        <DropdownMenuSeparator />
        
        <Link to="/notifications" className="block">
          <DropdownMenuItem className="cursor-pointer flex justify-center items-center p-3 text-[#528eb2] hover:text-[#02284f] dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            <span>Voir toutes les notifications</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 