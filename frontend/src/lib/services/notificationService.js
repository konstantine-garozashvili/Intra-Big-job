import apiService from './apiService';
import { authService } from './authService';
import { toast } from 'sonner';

/**
 * Service for managing user notifications
 */
class NotificationService {
  constructor() {
    // Initialiser le cache avec des valeurs vides
    this.cache = {
      notifications: {
        notifications: [], // Tableau vide initial pour les notifications
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1
        },
        unread_count: 0
      },
      unreadCount: 0, // Compteur à zéro initialement
      lastFetch: null,
      fetchPromise: null
    };
    this.subscribers = [];
    this.pollingInterval = null;
    this.pollingDelay = 60000; // 1 minute
  }

  /**
   * Get notifications with optional pagination
   */
  async getNotifications(page = 1, limit = 10, includeRead = true, refresh = false) {
    try {
      // If we have a fetch in progress, wait for it
      if (this.cache.fetchPromise) {
        await this.cache.fetchPromise;
      }

      // Return cache if available and not forcing refresh
      if (!refresh && this.cache.notifications && this.cache.lastFetch) {
        const now = new Date();
        const cacheAge = now - this.cache.lastFetch;
        
        // Use cache if it's less than 30 seconds old
        if (cacheAge < 30000) {
          return this.cache.notifications;
        }
      }

      try {
        // Essayez d'abord d'utiliser l'API réelle
        this.cache.fetchPromise = apiService.get(`/api/notifications?page=${page}&limit=${limit}&include_read=${includeRead}`);
        const response = await this.cache.fetchPromise;
        
        // Si la réponse est réussie, utilisez les données réelles
        this.cache.notifications = response.data;
        this.cache.unreadCount = response.data.unread_count || 0;
        this.cache.lastFetch = new Date();
        
        // Notify subscribers
        this.notifySubscribers();
        
        // Clear the fetch promise
        this.cache.fetchPromise = null;
        
        return response.data;
      } catch (error) {
        // Si l'API échoue, utilisez les données mockées
        console.log("Using cached notifications data due to API error");
        
        // Assurez-vous que les notifications du cache sont utilisées si disponibles
        if (this.cache.notifications && this.cache.notifications.notifications && 
            this.cache.notifications.notifications.length > 0) {
          return this.cache.notifications;
        }
        
        // Créer un cache vide sans notification de test
        const emptyData = {
          notifications: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 1
          },
          unread_count: 0
        };
        
        // Cache the empty results
        this.cache.notifications = emptyData;
        this.cache.unreadCount = 0;
        this.cache.lastFetch = new Date();
        
        // Notify subscribers
        this.notifySubscribers();
        
        // Clear the fetch promise
        this.cache.fetchPromise = null;
        
        return emptyData;
      }
    } catch (error) {
      this.cache.fetchPromise = null;
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get the current unread notification count
   */
  async getUnreadCount(refresh = false) {
    try {
      // Return from cache if available and not refreshing
      if (!refresh && this.cache.lastFetch) {
        const now = new Date();
        const cacheAge = now - this.cache.lastFetch;
        
        // Use cache if it's less than 30 seconds old
        if (cacheAge < 30000) {
          return this.cache.unreadCount;
        }
      }

      try {
        // Essayez d'abord d'utiliser l'API réelle
        const response = await apiService.get('/api/notifications/unread-count');
        this.cache.unreadCount = response.data.count || 0;
        this.cache.lastFetch = new Date();
        
        // Notify subscribers
        this.notifySubscribers();
        
        return this.cache.unreadCount;
      } catch (error) {
        // Si l'accès à l'API échoue, utilisez le comptage des notifications non lues dans le cache
        let unreadCount = 0;
        
        if (this.cache.notifications && this.cache.notifications.notifications) {
          unreadCount = this.cache.notifications.notifications.filter(n => !n.isRead).length;
        }
        
        this.cache.unreadCount = unreadCount;
        this.cache.lastFetch = new Date();
        
        // Notify subscribers
        this.notifySubscribers();
        
        return unreadCount;
      }
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0; // Toujours retourner 0 par défaut en cas d'erreur
    }
  }

  /**
   * Mark notification as read locally in cache
   */
  markNotificationAsReadLocally(notificationId) {
    if (!this.cache.notifications || !this.cache.notifications.notifications) {
      return false;
    }
    
    const notification = this.cache.notifications.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date().toISOString();
      this.cache.unreadCount = Math.max(0, this.cache.unreadCount - 1);
      this.notifySubscribers();
      return true;
    }
    
    return false;
  }

  /**
   * Mark all notifications as read locally in cache
   */
  markAllNotificationsAsReadLocally() {
    if (!this.cache.notifications || !this.cache.notifications.notifications) {
      return false;
    }
    
    let changed = false;
    this.cache.notifications.notifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        changed = true;
      }
    });
    
    if (changed) {
      this.cache.unreadCount = 0;
      this.notifySubscribers();
    }
    
    return changed;
  }

  /**
   * Start polling for new notifications
   */
  startPolling() {
    if (this.pollingInterval) {
      this.stopPolling();
    }
    
    // Set up polling interval
    this.pollingInterval = setInterval(async () => {
      if (authService.isLoggedIn()) {
        try {
          await this.getUnreadCount(true);
        } catch (error) {
          console.warn('Error during notification polling:', error);
        }
      } else {
        this.stopPolling();
      }
    }, this.pollingDelay);
    
    // Fetch initial data
    if (authService.isLoggedIn()) {
      this.getUnreadCount(true).catch(console.error);
    }
  }

  /**
   * Stop polling for new notifications
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.warn('Notification subscriber must be a function');
      return;
    }
    
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of changes
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback({
          unreadCount: this.cache.unreadCount,
          notifications: this.cache.notifications?.notifications || []
        });
      } catch (error) {
        console.error('Error in notification subscriber:', error);
      }
    });
  }

  /**
   * Reset cache
   */
  resetCache() {
    // Réinitialiser le cache avec des valeurs vides
    this.cache = {
      notifications: {
        notifications: [], // Tableau vide pour les notifications
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1
        },
        unread_count: 0
      },
      unreadCount: 0, // Compteur à zéro
      lastFetch: null,
      fetchPromise: null
    };
    
    // Informer les abonnés que le cache a été réinitialisé
    this.notifySubscribers();
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId) {
    try {
      try {
        // Essayez d'utiliser l'API réelle
        const response = await apiService.post(`/api/notifications/${notificationId}/mark-read`);
        
        // Update cache
        this.cache.unreadCount = response.data.unread_count || 0;
        
        // Update notification in cache if available
        if (this.cache.notifications && this.cache.notifications.notifications) {
          const notification = this.cache.notifications.notifications.find(n => n.id === notificationId);
          if (notification) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          }
        }
        
        // Notify subscribers
        this.notifySubscribers();
        
        return response.data;
      } catch (error) {
        // Si l'API échoue, utilisez le marquage local
        console.log("Using local notification marking due to API error");
        
        // Marquer la notification comme lue localement
        this.markNotificationAsReadLocally(notificationId);
        
        // Simule une réponse API
        return {
          success: true,
          notification: this.cache.notifications?.notifications?.find(n => n.id === notificationId) || null,
          unread_count: this.cache.unreadCount
        };
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // En cas d'erreur complète, essayez quand même de marquer localement
      this.markNotificationAsReadLocally(notificationId);
      return {
        success: false,
        error: error.message,
        unread_count: this.cache.unreadCount
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      try {
        // Essayez d'utiliser l'API réelle
        const response = await apiService.post('/api/notifications/mark-read');
        
        // Update cache
        this.cache.unreadCount = 0;
        
        // Update notifications in cache if available
        if (this.cache.notifications && this.cache.notifications.notifications) {
          this.cache.notifications.notifications.forEach(notification => {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          });
        }
        
        // Notify subscribers
        this.notifySubscribers();
        
        return response.data;
      } catch (error) {
        // Si l'API échoue, utilisez le marquage local
        console.log("Using local notification marking due to API error");
        
        // Marquer toutes les notifications comme lues localement
        this.markAllNotificationsAsReadLocally();
        
        // Simule une réponse API
        return {
          success: true,
          updated: this.cache.notifications?.notifications?.length || 0,
          unread_count: 0
        };
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // En cas d'erreur complète, essayez quand même de marquer localement
      this.markAllNotificationsAsReadLocally();
      return {
        success: false,
        error: error.message,
        unread_count: this.cache.unreadCount
      };
    }
  }
}

export const notificationService = new NotificationService(); 