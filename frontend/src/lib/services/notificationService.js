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
    this.mercureEventSource = null; // Source d'événements Mercure
    this.mercureUrl = null; // URL du hub Mercure
    this.mercureTopics = []; // Topics auxquels on est abonné
    this.mercureReconnectTimer = null; // Timer pour les reconnexions Mercure
  }

  /**
   * Initialise la connexion Mercure pour les notifications en temps réel
   */
  async initMercure() {
    try {
      // Si nous sommes déjà connectés, ne rien faire
      if (this.mercureEventSource && this.mercureEventSource.readyState === 1) {
        console.log('Mercure connection already established');
        return true;
      }
      
      // Récupérer les informations du hub Mercure depuis l'API
      let mercureUrl;
      try {
        // Essayer d'abord avec la variable d'environnement
        mercureUrl = import.meta.env.VITE_HUB_URL;
        
        if (!mercureUrl) {
          // Si pas dans les variables d'environnement, demander à l'API
          const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
          const response = await fetch(`${baseUrl}/mercure-info`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get Mercure info: ${response.status}`);
          }
          
          const data = await response.json();
          mercureUrl = data.mercure_public_url;
        }
      } catch (error) {
        console.error('Error getting Mercure URL:', error);
        this.useMockBackend = true;
        return false;
      }
      
      if (!mercureUrl) {
        console.error('Failed to get Mercure hub URL');
        this.useMockBackend = true;
        return false;
      }
      
      // Récupérer l'utilisateur courant
      const user = authService.getCurrentUser();
      
      if (!user || !user.id) {
        console.log('No authenticated user, skipping Mercure subscription');
        this.useMockBackend = true;
        return false;
      }
      
      // Stocker l'URL du hub Mercure
      this.mercureUrl = mercureUrl;
      
      // Construire les topics auxquels s'abonner
      this.mercureTopics = [
        `https://example.com/users/${user.id}`, // Topic spécifique à l'utilisateur
        'https://example.com/documents' // Topic général pour les documents (si l'utilisateur y a accès)
      ];
      
      // Si l'utilisateur est admin, ajouter le topic admin
      if (user.roles && (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SUPER_ADMIN'))) {
        this.mercureTopics.push('https://example.com/admin/documents');
      }
      
      // Créer l'URL du hub avec les topics
      const url = new URL(this.mercureUrl);
      this.mercureTopics.forEach(topic => {
        url.searchParams.append('topic', topic);
      });
      
      // Fermer toute connexion existante
      this.closeMercureConnection();
      
      // Créer la nouvelle connexion EventSource
      this.mercureEventSource = new EventSource(url, { withCredentials: true });
      
      // Configurer les gestionnaires d'événements
      this.mercureEventSource.onopen = () => {
        console.log('Mercure connection established');
        clearTimeout(this.mercureReconnectTimer);
        this.useMockBackend = false;
      };
      
      this.mercureEventSource.onerror = (err) => {
        console.error('Mercure connection error:', err);
        this.handleMercureConnectionError();
      };
      
      this.mercureEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMercureMessage(data);
        } catch (error) {
          console.error('Error handling Mercure message:', error);
        }
      };
      
      return true;
    } catch (error) {
      console.error('Error initializing Mercure:', error);
      this.useMockBackend = true;
      return false;
    }
  }
  
  /**
   * Gère une erreur de connexion Mercure et programme une reconnexion
   */
  handleMercureConnectionError() {
    // Fermer la connexion actuelle
    this.closeMercureConnection();
    
    // Attendre 5 secondes avant de réessayer
    clearTimeout(this.mercureReconnectTimer);
    this.mercureReconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect to Mercure...');
      this.initMercure();
    }, 5000);
  }
  
  /**
   * Ferme la connexion Mercure
   */
  closeMercureConnection() {
    if (this.mercureEventSource) {
      this.mercureEventSource.close();
      this.mercureEventSource = null;
    }
  }
  
  /**
   * Gère les messages reçus via Mercure
   */
  handleMercureMessage(data) {
    console.log('Received Mercure notification:', data);
    
    // Traiter selon le type de notification
    if (data.type) {
      switch (data.type) {
        case 'document_added':
          this.handleDocumentAddedNotification(data);
          break;
        case 'document_status_changed':
          this.handleDocumentStatusChangedNotification(data);
          break;
        case 'cv_uploaded':
          this.handleCvUploadedNotification(data);
          break;
        case 'document_deleted':
          this.handleDocumentDeletedNotification(data);
          break;
        default:
          this.handleGenericNotification(data);
          break;
      }
    } else {
      // Si pas de type spécifié, traiter comme notification générique
      this.handleGenericNotification(data);
    }
    
    // Incrémenter le compteur de notifications non lues
    this.cache.unreadCount++;
    
    // Notifier les abonnés
    this.notifySubscribers();
  }
  
  /**
   * Gère les notifications d'ajout de document
   */
  handleDocumentAddedNotification(data) {
    // Créer une notification formatée
    const notification = {
      id: `mercure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'DOCUMENT_UPLOADED',
      title: 'Nouveau document ajouté',
      message: `Un nouveau document "${data.documentName}" a été ajouté par ${data.addedBy}`,
      data: data,
      targetUrl: `/documents/${data.documentId}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    // Ajouter à notre cache local
    if (this.cache.notifications && this.cache.notifications.notifications) {
      this.cache.notifications.notifications.unshift(notification);
    }
    
    // Afficher une notification toast
    toast.success(notification.message, {
      action: {
        label: 'Voir',
        onClick: () => {
          window.location.href = notification.targetUrl;
        }
      }
    });
  }
  
  /**
   * Gère les notifications de changement de statut de document
   */
  handleDocumentStatusChangedNotification(data) {
    // Déterminer le type et le titre selon le statut
    let type = 'DOCUMENT_STATUS_CHANGED';
    let title = 'Document mis à jour';
    let message = `Le statut du document "${data.documentName}" a changé`;
    
    if (data.newStatus === 'APPROVED') {
      type = 'DOCUMENT_APPROVED';
      title = 'Document approuvé';
      message = `Votre document "${data.documentName}" a été approuvé`;
    } else if (data.newStatus === 'REJECTED') {
      type = 'DOCUMENT_REJECTED';
      title = 'Document refusé';
      message = `Votre document "${data.documentName}" a été refusé`;
      
      if (data.comment) {
        message += ` : ${data.comment}`;
      }
    }
    
    // Créer une notification formatée
    const notification = {
      id: `mercure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      title: title,
      message: message,
      data: data,
      targetUrl: `/documents/${data.documentId}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    // Ajouter à notre cache local
    if (this.cache.notifications && this.cache.notifications.notifications) {
      this.cache.notifications.notifications.unshift(notification);
    }
    
    // Afficher une notification toast
    if (data.newStatus === 'APPROVED') {
      toast.success(notification.message, {
        action: {
          label: 'Voir',
          onClick: () => {
            window.location.href = notification.targetUrl;
          }
        }
      });
    } else if (data.newStatus === 'REJECTED') {
      toast.error(notification.message, {
        action: {
          label: 'Voir',
          onClick: () => {
            window.location.href = notification.targetUrl;
          }
        }
      });
    } else {
      toast.info(notification.message, {
        action: {
          label: 'Voir',
          onClick: () => {
            window.location.href = notification.targetUrl;
          }
        }
      });
    }
  }
  
  /**
   * Gère les notifications d'upload de CV
   */
  handleCvUploadedNotification(data) {
    // Créer une notification formatée
    const notification = {
      id: `mercure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'CV_UPLOADED',
      title: 'CV téléchargé',
      message: data.message || `Votre CV "${data.documentName}" a été téléchargé avec succès`,
      data: data,
      targetUrl: `/documents/${data.documentId}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    // Ajouter à notre cache local
    if (this.cache.notifications && this.cache.notifications.notifications) {
      this.cache.notifications.notifications.unshift(notification);
    }
    
    // Afficher une notification toast
    toast.success(notification.message, {
      action: {
        label: 'Voir',
        onClick: () => {
          window.location.href = notification.targetUrl;
        }
      }
    });
  }
  
  /**
   * Gère les notifications de suppression de document
   */
  handleDocumentDeletedNotification(data) {
    // Créer une notification formatée
    const notification = {
      id: `mercure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'DOCUMENT_DELETED',
      title: 'Document supprimé',
      message: `Le document "${data.documentName}" a été supprimé`,
      data: data,
      targetUrl: `/documents`, // Rediriger vers la liste des documents
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    // Ajouter à notre cache local
    if (this.cache.notifications && this.cache.notifications.notifications) {
      this.cache.notifications.notifications.unshift(notification);
    }
    
    // Incrémenter le compteur de notifications non lues
    if (this.cache.unreadCount !== undefined) {
      this.cache.unreadCount += 1;
    }
    
    // Notifier les abonnés du changement
    this.notifySubscribers();
    
    // Afficher une notification toast
    toast.info(notification.message, {
      action: {
        label: 'Voir tous',
        onClick: () => {
          window.location.href = notification.targetUrl;
        }
      }
    });
  }
  
  /**
   * Gère les notifications génériques
   */
  handleGenericNotification(data) {
    // Extraire les informations de base
    const title = data.title || 'Nouvelle notification';
    const message = data.message || 'Vous avez reçu une nouvelle notification';
    const targetUrl = data.targetUrl || '/dashboard';
    
    // Créer une notification formatée
    const notification = {
      id: `mercure-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type || 'GENERIC',
      title: title,
      message: message,
      data: data,
      targetUrl: targetUrl,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    // Ajouter à notre cache local
    if (this.cache.notifications && this.cache.notifications.notifications) {
      this.cache.notifications.notifications.unshift(notification);
    }
    
    // Afficher une notification toast
    toast.info(notification.message, {
      action: {
        label: 'Voir',
        onClick: () => {
          window.location.href = notification.targetUrl;
        }
      }
    });
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
          currentCount = this.cache.notifications.notifications.filter(n => !n.readAt && !n.isRead).length;
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

      // Calculer le nombre à partir du cache local, car l'API n'existe plus
      let unreadCount = 0;
      
      if (this.cache.notifications && this.cache.notifications.notifications) {
        unreadCount = this.cache.notifications.notifications.filter(n => !n.readAt && !n.isRead).length;
      }
      
      this.cache.unreadCount = unreadCount;
      this.cache.lastFetch = new Date();
      
      // Notify subscribers
      this.notifySubscribers();
      
      return unreadCount;
    } catch (error) {
      console.error('Error calculating unread notification count:', error);
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
      clearInterval(this.pollingInterval);
    }
    
    // Initier Mercure si disponible
    this.initMercure();
    
    // Ensuite démarrer le polling comme fallback
    this.pollingInterval = setInterval(() => {
      this.getUnreadCount(true).catch(error => {
        console.error('Error in notification polling:', error);
      });
    }, this.pollingDelay);
  }

  /**
   * Stop polling for new notifications
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    // Fermer la connexion Mercure
    this.closeMercureConnection();
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