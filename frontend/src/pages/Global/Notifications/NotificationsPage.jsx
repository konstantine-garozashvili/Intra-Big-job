import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, FileCheck, FileX, File, Info, Calendar, Check, Undo, ChevronLeft, Filter, Trash, Settings } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

// Configuration des badges de type
const notificationTypeConfig = {
  ROLE_UPDATE: {
    label: 'Mise à jour de rôle',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: <Info className="h-4 w-4" />
  },
  SYSTEM: {
    label: 'Système',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    icon: <Bell className="h-4 w-4" />
  },
  INFO: {
    label: 'Information',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: <Info className="h-4 w-4" />
  },
  WARNING: {
    label: 'Avertissement',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: <Info className="h-4 w-4" />
  },
  ALERT: {
    label: 'Alerte',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: <Info className="h-4 w-4" />
  },
  DOCUMENT_APPROVED: {
    label: 'Document approuvé',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: <FileCheck className="h-4 w-4" />
  },
  DOCUMENT_REJECTED: {
    label: 'Document rejeté',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: <FileX className="h-4 w-4" />
  },
  DOCUMENT_UPLOADED: {
    label: 'Document téléchargé',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: <File className="h-4 w-4" />
  }
};

// Page principale des notifications
const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState(null);

  // Fonction pour obtenir les notifications filtrées
  const getFilteredNotifications = () => {
    if (!notifications) return [];
    
    let filtered = [...notifications];
    
    // Filtrer par statut de lecture
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }
    
    // Filtrer par type
    if (filter) {
      filtered = filtered.filter(n => n.type === filter);
    }
    
    return filtered;
  };
  
  const filteredNotifications = getFilteredNotifications();
  
  // Fonction pour gérer le clic sur une notification
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Si la notification a un lien de redirection, y naviguer
    if (notification.targetUrl) {
      navigate(notification.targetUrl);
    }
  };
  
  // Rendu du squelette de chargement
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array(5).fill(0).map((_, i) => (
        <Card key={i} className="mb-3">
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
      ))}
  </div>
);

  // Rendu des notifications
  const renderNotifications = () => {
    if (loading) {
      return renderSkeleton();
    }
    
    if (filteredNotifications.length === 0) {
      return (
        <div className="text-center p-8">
          <Bell className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Pas de notification</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            {activeTab === 'all' 
              ? "Vous n'avez aucune notification pour le moment."
              : "Vous n'avez aucune notification non lue pour le moment."}
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id}
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              !notification.read ? "border-l-4 border-l-blue-500 dark:border-l-blue-400" : ""
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {notificationTypeConfig[notification.type]?.icon || <Bell className="h-5 w-5 text-gray-500" />}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-base font-medium ${
                      !notification.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {notification.title}
                    </h3>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {notification.message}
                  </p>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className={
                      notificationTypeConfig[notification.type]?.color || 
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }>
                      {notificationTypeConfig[notification.type]?.label || notification.type || "Notification"}
                    </Badge>
                    
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto text-xs py-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Marquer comme lu
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Rendu principal
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/dashboard" className="mr-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:dark:text-blue-300">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            Notifications
            {unreadCount > 0 && activeTab !== 'unread' && (
              <Badge className="ml-2 bg-red-500 text-white">
                {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
              </Badge>
            )}
          </h1>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/settings/notifications">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Paramètres</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Gérer vos préférences de notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="unread">
              Non lues {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {Object.entries(notificationTypeConfig).map(([type, config]) => (
            <Badge 
              key={type}
              className={`cursor-pointer ${
                filter === type 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setFilter(filter === type ? null : type)}
            >
              {config.label}
            </Badge>
          ))}
          
          {filter && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs h-7"
              onClick={() => setFilter(null)}
            >
              Réinitialiser
            </Button>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => {
              markAllAsRead();
              toast.success('Toutes les notifications ont été marquées comme lues');
            }}
          >
            <Check className="h-4 w-4 mr-2" />
            Tout marquer comme lu
          </Button>
        )}
      </div>
      
      {renderNotifications()}
    </div>
  );
};

export default NotificationsPage; 