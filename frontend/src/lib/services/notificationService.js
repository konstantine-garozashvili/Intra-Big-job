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
    this.useMockBackend = false; // Added for the new getNotifications method
  }

  /**
   * Get notifications with optional pagination
   */
  async getNotifications(page = 1, limit = 10, includeRead = true, refresh = false) {
    try {
      // Si le backend n'est pas disponible, utiliser les données simulées
      if (this.useMockBackend) {
        console.log('Using mock notifications data (backend unavailable)');
        
        // Simuler un léger délai pour l'expérience utilisateur
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (this.cache.notifications && this.cache.notifications.notifications) {
          // Filtrer les notifications selon les paramètres
          let notifications = [...this.cache.notifications.notifications];
          
          // Filtrer selon includeRead
          if (!includeRead) {
            notifications = notifications.filter(n => !n.isRead);
          }
          
          // Trier par date décroissante
          notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          // Calculer la pagination
          const total = notifications.length;
          const pages = Math.max(1, Math.ceil(total / limit));
          const startIndex = (page - 1) * limit;
          const paginatedNotifications = notifications.slice(startIndex, startIndex + limit);
          
          // Créer un objet de réponse simulée
          const result = {
            notifications: paginatedNotifications,
            pagination: {
              total: total,
              page: page,
              limit: limit,
              pages: pages
            },
            unread_count: notifications.filter(n => !n.isRead).length
          };
          
          // Mettre à jour le cache
          this.cache.notifications = result;
          this.cache.unreadCount = result.unread_count;
          this.cache.lastFetch = new Date();
          
          // Notifier les abonnés
          this.notifySubscribers();
          
          return result;
        }
      }
      
      // If we have a fetch in progress, wait for it
      if (this.cache.fetchPromise) {
        try {
          await this.cache.fetchPromise;
        } catch (error) {
          // Ignorer l'erreur ici car on va vérifier le cache après
          console.log("Waiting for fetch promise failed, checking cache next");
        }
      }

      // Return cache if available and not forcing refresh
      // Utiliser toujours le cache si disponible, même s'il est ancien
      // Cela évite d'afficher des erreurs inutiles à l'utilisateur
      if (!refresh && this.cache.notifications && this.cache.notifications.notifications) {
        console.log("Using cached notifications data (immediate response)");
        return this.cache.notifications;
      }

      try {
        // Essayez d'abord d'utiliser l'API réelle
        console.log("Fetching fresh notifications data from API");
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
        // Si l'API échoue, utilisez les données du cache
        console.log("Using cached notifications data due to API error");
        
        // Vérifier si nous avons des données en cache que nous pouvons utiliser
        if (this.cache.notifications && this.cache.notifications.notifications) {
          // Si nous avons des données en cache, les utiliser au lieu d'échouer
          console.log("Returning cached notification data due to API error");
          
          // Clear the fetch promise
          this.cache.fetchPromise = null;
          
          return this.cache.notifications;
        }
        
        // Créer un cache vide sans notification
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
      
      // En cas d'erreur, retournez le cache existant au lieu d'échouer
      if (this.cache.notifications && this.cache.notifications.notifications) {
        console.log("Returning cached notification data in catch block");
        return this.cache.notifications;
      }
      
      // Si pas de cache, retournez un objet vide
      return {
        notifications: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1
        },
        unread_count: 0
      };
    }
  }

  /**
   * Get the current unread notification count
   */
  async getUnreadCount(refresh = false) {
    try {
      // Si nous forçons un rafraîchissement, notifions immédiatement les abonnés
      // avec le compteur actuel pour une interface réactive
      if (refresh) {
        // Calculer le compteur actuel basé sur les notifications en cache
        let currentCount = 0;
        if (this.cache.notifications && this.cache.notifications.notifications) {
          currentCount = this.cache.notifications.notifications.filter(n => !n.readAt).length;
          // Mettre à jour le cache immédiatement
          this.cache.unreadCount = currentCount;
          // Notifier les abonnés immédiatement avec le compteur à jour
          this.notifySubscribers();
        }
      }
      
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
        // Si l'accès à l'API échoue, calculez le nombre de notifications non lues dans le cache
        // en utilisant la propriété readAt de manière cohérente
        let unreadCount = 0;
        
        if (this.cache.notifications && this.cache.notifications.notifications) {
          unreadCount = this.cache.notifications.notifications.filter(n => !n.readAt).length;
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
    if (notification && !notification.readAt) {
      // Marquer comme lu de manière cohérente - utiliser readAt
      notification.readAt = new Date().toISOString();
      
      // Pour maintenir la compatibilité avec le code existant
      notification.isRead = true;
      
      // Mettre à jour le compteur
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
      if (!notification.readAt) {
        // Marquer comme lu de manière cohérente - utiliser readAt
        notification.readAt = new Date().toISOString();
        
        // Pour maintenir la compatibilité avec le code existant
        notification.isRead = true;
        
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
        
        // Update cache unread count immediately
        this.cache.unreadCount = response.data.unread_count || 0;
        
        // Update notification in cache if available
        if (this.cache.notifications && this.cache.notifications.notifications) {
          // Mettre à jour la notification spécifique
          const notification = this.cache.notifications.notifications.find(n => n.id === notificationId);
          if (notification && !notification.readAt) {
            // Marquer comme lu de manière cohérente - utiliser readAt
            notification.readAt = new Date().toISOString();
            
            // Pour maintenir la compatibilité avec le code existant
            notification.isRead = true;
            
            // Mettre à jour le compteur dans l'objet de réponse
            if (this.cache.notifications.unread_count !== undefined) {
              this.cache.notifications.unread_count = Math.max(0, this.cache.notifications.unread_count - 1);
            }
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
        
        // Update cache - Set unread count to zero immediately
        this.cache.unreadCount = 0;
        
        // Update notifications in cache if available
        if (this.cache.notifications && this.cache.notifications.notifications) {
          this.cache.notifications.notifications.forEach(notification => {
            // Marquer comme lu de manière cohérente - utiliser readAt
            notification.readAt = new Date().toISOString();
            
            // Pour maintenir la compatibilité avec le code existant
            notification.isRead = true;
          });
          
          // Mettre à jour le compteur dans l'objet de réponse
          if (this.cache.notifications.unread_count !== undefined) {
            this.cache.notifications.unread_count = 0;
          }
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

  /**
   * Create a test notification when backend is not available
   * @param {string} type - Type of notification (document, system, etc.)
   * @param {string} targetUrl - Target URL to navigate to when notification is clicked
   */
  async createTestNotification(type = 'document', targetUrl = '/dashboard') {
    try {
      // D'abord essayer d'utiliser l'API réelle si disponible
      try {
        const response = await apiService.post('/api/notifications/test', { type, targetUrl });
        
        // Si la réponse est réussie, rafraîchir les données
        await this.getNotifications(1, 10, true, true);
        
        return response.data;
      } catch (error) {
        console.log("API not available, creating local test notification");
        
        // Basculer en mode simulation si l'API n'est pas disponible
        this.useMockBackend = true;

        // Créer une notification locale simulée
        const now = new Date();
        const newNotification = {
          id: `local-${now.getTime()}`,
          title: `Test Notification (${type})`,
          message: `Ceci est une notification de test de type "${type}" créée localement`,
          type: type,
          targetUrl: targetUrl,
          createdAt: now.toISOString(),
          readAt: null,
          isRead: false
        };
        
        // Ajouter la notification au cache
        if (!this.cache.notifications.notifications) {
          this.cache.notifications.notifications = [];
        }
        
        this.cache.notifications.notifications.unshift(newNotification);
        this.cache.unreadCount += 1;
        
        // Si nous avons des informations de pagination, mettre à jour
        if (this.cache.notifications.pagination) {
          this.cache.notifications.pagination.total += 1;
        }
        
        // Notifier les abonnés
        this.notifySubscribers();
        
        return {
          success: true,
          notification: newNotification
        };
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const notificationService = new NotificationService(); 