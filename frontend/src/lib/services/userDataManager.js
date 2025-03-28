import apiService from './apiService';
import { getQueryClient } from './queryClient';
import { getSessionId } from './authService';

// Cache pour les données utilisateur
const userDataCache = {
  data: null,
  timestamp: 0,
  isLoading: false,
  loadingPromise: null,
  requestCount: 0,
  pendingRequests: new Map(),
  // Optimisé pour les performances : 2 minutes de fraîcheur des données
  freshnessDuration: 2 * 60 * 1000,
  // Durée maximale de conservation des données (20 minutes)
  maxAgeDuration: 20 * 60 * 1000,
  // État pour les erreurs consécutives 
  consecutiveErrors: 0,
  // Limite d'erreurs avant blocage temporaire des requêtes
  errorThreshold: 3,
  // Dernier temps de blocage
  lastCircuitBreak: 0,
  // Durée du blocage (15 secondes par défaut)
  circuitBreakDuration: 15 * 1000,
  // Événements pour notifier les changements
  events: new EventTarget(),
  // ID de l'opération courante pour éviter les appels en doublon
  currentOperationId: null,
  // Délai pour considérer les opérations comme distinctes (en ms)
  operationDebounceTime: 100,
  // Date de la dernière opération
  lastOperationTime: 0,
  // Map de déduplication pour traquer les requêtes identiques durant le même cycle
  deduplicationMap: new Map(),
  
  // Méthode pour invalider le cache
  invalidate() {
    this.data = null;
    this.timestamp = 0;
  },
  
  // Méthode pour récupérer des données du cache
  get(routeKey) {
    // Pour l'instant, ne retourne que la donnée principale du cache
    // Ce code pourrait être étendu pour gérer différentes routes
    if (routeKey === '/api/me' || !routeKey) {
      return this.data;
    }
    
    // Cas pour les différentes routes d'API
    if (routeKey.includes('/profile/')) {
      // Pour les requêtes de profil, on peut retourner les mêmes données
      return this.data;
    }
    
    // Retourne null pour les routes non reconnues
    return null;
  }
};

// Événements personnalisés
export const USER_DATA_EVENTS = {
  LOADED: 'userData:loaded',
  LOADING: 'userData:loading',
  ERROR: 'userData:error',
  UPDATED: 'userData:updated',
  INVALIDATED: 'userData:invalidated',
  UPDATING: 'userData:updating'
};

// Ajouter un mécanisme de contrôle de fréquence des émissions d'événements
const eventThrottleState = {
  lastEventTime: 0,
  pendingEvents: new Map(),
  throttleInterval: 1000 // Intervalle minimum entre les événements (1 seconde)
};

// Système de coordination des requêtes pour éviter les requêtes dupliquées
const requestRegistry = {
  // Map pour stocker les requêtes en cours par route
  activeRequests: new Map(),
  // Map pour stocker les composants qui utilisent chaque route
  routeUsers: new Map(),
  // Map des routes en cours de traitement
  processingRoutes: new Map(),
  // Délai de contrôle des requêtes
  requestDebounceTime: 3000, // 3 secondes (augmenté de 2 à 3 secondes)
  // Dernières requêtes par route
  lastRequestTime: new Map(),
  // Compteur pour éviter les boucles infinies
  requestCountPerRoute: new Map(),
  // Limite du nombre de requêtes par intervalle
  requestThreshold: 5,
  // Période pour considérer le compteur de requêtes (10 secondes)
  requestCountResetTime: 10000,
  
  // Enregistrer un composant utilisateur d'une route
  registerRouteUser(route, componentId) {
    if (!this.routeUsers.has(route)) {
      this.routeUsers.set(route, new Set());
    }
    this.routeUsers.get(route).add(componentId);
  },
  
  // Désenregistrer un composant
  unregisterRouteUser(route, componentId) {
    if (this.routeUsers.has(route)) {
      this.routeUsers.get(route).delete(componentId);
      if (this.routeUsers.get(route).size === 0) {
        this.routeUsers.delete(route);
      }
    }
  },
  
  // Vérifier si une route est utilisée par plusieurs composants
  isRouteShared(route) {
    return this.routeUsers.has(route) && this.routeUsers.get(route).size > 1;
  },
  
  // Marque une route comme étant en cours de traitement
  markRouteAsProcessing(route) {
    if (this.processingRoutes.has(route)) {
      return false;
    }
    this.processingRoutes.set(route, Date.now());
    return true;
  },
  
  // Marque une route comme n'étant plus en cours de traitement
  markRouteAsNotProcessing(route) {
    this.processingRoutes.delete(route);
  },
  
  // Vérifie si une route est en cours de traitement
  isRouteProcessing(route) {
    if (!this.processingRoutes.has(route)) {
      return false;
    }
    
    // Si la route est en traitement depuis plus de 10 secondes, on considère qu'elle n'est plus en traitement
    const processingTime = Date.now() - this.processingRoutes.get(route);
    if (processingTime > 10000) {
      this.markRouteAsNotProcessing(route);
      return false;
    }
    
    return true;
  },
  
  // Vérifier si une requête peut être exécutée ou s'il faut attendre
  shouldThrottleRequest(route) {
    // Special handling for /api/me - NEVER throttle this critical endpoint
    if (route.includes('/api/me')) {
      return false;
    }
    
    const now = Date.now();
    
    // Skip throttling for most critical user data routes, but apply special throttling for /profile/consolidated
    if (route.includes('/profile') || route.includes('/user-roles') || route.includes('/user')) {
      // Special handling for /profile/consolidated which can cause excessive requests
      if (route === '/profile/consolidated') {
        // Check if we've made too many requests to this endpoint
        if (!this.requestCountPerRoute.has(route)) {
          this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
        } else {
          const routeInfo = this.requestCountPerRoute.get(route);
          
          // Reset counter if needed
          if (now - routeInfo.timestamp > this.requestCountResetTime) {
            this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
          } else {
            routeInfo.count++;
            
            // Apply throttling if more than 3 requests in the time period
            if (routeInfo.count > 3) {
              console.warn(`Too many requests (${routeInfo.count}) for /profile/consolidated in a short period. Throttling.`);
              return true;
            }
          }
        }
        
        // Check time since last request for this specific endpoint
        if (this.lastRequestTime.has(route)) {
          const lastTime = this.lastRequestTime.get(route);
          const timeSinceLastRequest = now - lastTime;
          
          // Throttle if less than 2 seconds since last request
          if (timeSinceLastRequest < 2000) {
            console.warn(`Request to /profile/consolidated too soon after previous request (${timeSinceLastRequest}ms). Throttling.`);
            return true;
          }
        }
        
        this.lastRequestTime.set(route, now);
        return false;
      }
      
      // For other profile/user routes, still track but don't throttle
      if (!this.requestCountPerRoute.has(route)) {
        this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
      } else {
        const routeInfo = this.requestCountPerRoute.get(route);
        // Just reset the counter if needed
        if (now - routeInfo.timestamp > this.requestCountResetTime) {
          this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
        } else {
          routeInfo.count++;
          // Log but don't throttle
          if (routeInfo.count > this.requestThreshold) {
            console.info(`High request count (${routeInfo.count}) for critical route ${route}, but not throttling.`);
          }
        }
      }
      
      // Update last request time but don't throttle
      this.lastRequestTime.set(route, now);
      return false;
    }
    
    // Regular throttling for non-critical routes
    if (!this.requestCountPerRoute.has(route)) {
      this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
    } else {
      const routeInfo = this.requestCountPerRoute.get(route);
      
      // Réinitialiser le compteur si la période est écoulée
      if (now - routeInfo.timestamp > this.requestCountResetTime) {
        this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
      } else {
        // Incrémenter le compteur
        routeInfo.count++;
        
        // Bloquer si le seuil est dépassé
        if (routeInfo.count > this.requestThreshold) {
          console.warn(`Too many requests (${routeInfo.count}) for route ${route} in a short period. Throttling.`);
          return true;
        }
      }
    }
    
    // Vérifier le délai depuis la dernière requête
    if (!this.lastRequestTime.has(route)) {
      this.lastRequestTime.set(route, now);
      return false;
    }
    
    const timeSinceLastRequest = now - this.lastRequestTime.get(route);
    if (timeSinceLastRequest < this.requestDebounceTime) {
      return true;
    }
    
    this.lastRequestTime.set(route, now);
    return false;
  },
  
  // Enregistrer une requête active
  registerActiveRequest(route, promise) {
    // Ensure we're dealing with a proper Promise
    if (!promise || typeof promise !== 'object' || typeof promise.finally !== 'function') {
      console.warn(`Invalid promise for route ${route}, creating a proper Promise wrapper`);
      // Create a proper Promise wrapper for the value
      const wrappedPromise = Promise.resolve(promise);
      this.activeRequests.set(route, wrappedPromise);
      
      wrappedPromise.finally(() => {
        if (this.activeRequests.get(route) === wrappedPromise) {
          this.activeRequests.delete(route);
        }
      });
      
      return wrappedPromise;
    }
    
    // Original behavior for valid Promises
    this.activeRequests.set(route, promise);
    
    // Nettoyer la requête une fois terminée
    promise.finally(() => {
      if (this.activeRequests.get(route) === promise) {
        this.activeRequests.delete(route);
      }
    });
    
    return promise;
  },
  
  // Récupérer une requête active pour une route
  getActiveRequest(route) {
    return this.activeRequests.get(route);
  },
  
  // Coordonner une requête pour éviter les doublons
  coordinateRequest(route, requestFn) {
    // Vérifier si une requête est déjà active pour cette route
    const activeRequest = this.getActiveRequest(route);
    if (activeRequest) {
      return activeRequest;
    }
    
    // Vérifier si la route est en cours de traitement
    if (this.isRouteProcessing(route)) {
      console.log(`Route ${route} is currently being processed, skipping duplicate request`);
      return Promise.resolve(null);
    }
    
    // Marquer la route comme étant en cours de traitement
    this.markRouteAsProcessing(route);
    
    try {
      // Créer et enregistrer la nouvelle requête
      let request;
      
      try {
        // Execute the request function
        const result = requestFn();
        
        // Check if the result is a valid Promise
        if (result && typeof result === 'object' && typeof result.finally === 'function') {
          request = result;
        } else {
          console.warn(`Request function for route ${route} did not return a valid Promise, wrapping result`);
          request = Promise.resolve(result);
        }
      } catch (error) {
        console.error(`Error executing request function for route ${route}:`, error);
        request = Promise.reject(error);
      }
      
      // Add cleanup regardless of promise type
      request.finally(() => {
        // Marquer la route comme n'étant plus en cours de traitement
        this.markRouteAsNotProcessing(route);
      });
      
      this.registerActiveRequest(route, request);
      return request;
    } catch (error) {
      // Handle any unexpected errors
      console.error(`Critical error in coordinateRequest for route ${route}:`, error);
      this.markRouteAsNotProcessing(route);
      return Promise.reject(error);
    }
  }
};

/**
 * Service centralisé pour gérer les données utilisateur
 */
const userDataManager = {
  // Cache pour les données
  cache: userDataCache,
  
  // Exposer le registre des requêtes
  requestRegistry,

  // Abonnés aux événements
  subscribers: {},
  
  // Statistiques d'utilisation
  stats: {
    requestCount: 0,
    invalidationCount: 0,
    updateCount: 0,
    errorCount: 0,
    lastUpdate: null
  },

  _debugCounters: {
    cacheHits: 0,
    apiCalls: 0,
    lastLogTime: 0,
    logInterval: 5000, // Log only every 5 seconds
  },

  /**
   * Outil de journalisation avec throttling
   * @private
   * @param {string} message - Message à journaliser
   * @param {string} level - Niveau de log (info, warn, error)
   */
  _log(message, level = 'info', forceLog = false) {
    const now = Date.now();
    // Ne logger que toutes les X secondes pour éviter de spammer la console
    if (forceLog || now - this._debugCounters.lastLogTime > this._debugCounters.logInterval) {
      this._debugCounters.lastLogTime = now;
      
      // Ajouter des informations supplémentaires aux logs
      const counters = `[Cache hits: ${this._debugCounters.cacheHits}, API calls: ${this._debugCounters.apiCalls}]`;
      const fullMessage = `${message} ${counters}`;
      
      switch (level) {
        case 'error':
          console.error(fullMessage);
          break;
        case 'warn':
          console.warn(fullMessage);
          break;
        default:
          console.info(fullMessage);
      }
    }
  },

  /**
   * Récupère les données utilisateur en cache
   * @returns {Object|null} - Données utilisateur en cache ou null
   */
  getCachedUserData() {
    // Si nous avons des données en mémoire, les utiliser
    if (userDataCache.data) {
      return userDataCache.data;
    }
    
    // Sinon, essayer de récupérer depuis le localStorage
    try {
      const cachedUserStr = localStorage.getItem('user');
      if (cachedUserStr) {
        const userData = JSON.parse(cachedUserStr);
        // Update our in-memory cache with the localStorage data
        userDataCache.data = userData;
        userDataCache.timestamp = Date.now(); // Use current time as we don't know when it was cached
        return userData;
      }
    } catch (e) {
      console.warn('Error retrieving user data from localStorage:', e);
    }
    
    return null;
  },

  /**
   * Récupérer les données utilisateur avec contrôle de la mise en cache
   * @param {Object} options - Options pour la requête
   * @param {string} options.routeKey - Route API à utiliser
   * @param {boolean} options.forceRefresh - Force une nouvelle requête ignorant le cache
   * @param {boolean} options.useCache - Utilise le cache si disponible
   * @param {boolean} options.bypassThrottle - Ignorer les règles de limitation de fréquence
   * @returns {Promise<Object>} - Données utilisateur
   */
  getUserData(options = {}) {
    // Valeurs par défaut
    const {
      routeKey = '/api/me',      // Route API à utiliser
      componentId = 'global',    // Identifiant du composant demandeur
      forceRefresh = false,      // Force une nouvelle requête
      useCache = true,           // Utilise le cache si disponible
      bypassThrottle = false     // Ignorer les règles de limitation de fréquence
    } = options;
    
    // Log the request
    this._log(`getUserData request for route ${routeKey}. Options: forceRefresh=${forceRefresh}, useCache=${useCache}, bypassThrottle=${bypassThrottle}`);
    
    // Si le cache est autorisé et non forcé à rafraîchir
    if (useCache && !forceRefresh) {
      try {
        // Essayer d'abord d'utiliser le cache - avec une vérification défensive
        let cachedData = null;
        
        // Vérifier si la méthode get existe sur l'objet cache
        if (this.cache && typeof this.cache.get === 'function') {
          cachedData = this.cache.get(routeKey);
        } else {
          // Fallback: utiliser directement les données du cache
          cachedData = this.cache?.data || null;
        }
        
        if (cachedData) {
          this._debugCounters.cacheHits++;
          return Promise.resolve(cachedData);
        }
      } catch (error) {
        console.warn(`Error retrieving data from cache for ${routeKey}:`, error);
        // Continuer en cas d'erreur de cache
      }
    }
    
    // Check if we should throttle this request (unless bypass is requested)
    if (!bypassThrottle && requestRegistry.shouldThrottleRequest(routeKey)) {
      this._log(`Request throttled for route ${routeKey}`, 'warn');
      return this.getCachedUserData() || Promise.resolve(null);
    }
    
    return this._loadUserData(componentId, {
      routeKey,
      forceRefresh,
      useCache,
      bypassThrottle
    });
  },

  /**
   * Charge les données utilisateur depuis l'API
   * @private
   * @param {string} componentId - Identifiant du composant qui fait la requête
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} - Données utilisateur
   */
  async _loadUserData(componentId, options = {}) {
    const { preventRecursion = false } = options;
    
    // Notifier que le chargement a commencé (sauf si preventRecursion est true)
    userDataCache.isLoading = true;
    if (!preventRecursion) {
      this._notifySubscribers(USER_DATA_EVENTS.LOADING);
    }
    
    // Créer une nouvelle promesse pour le chargement
    const loadPromise = new Promise(async (resolve, reject) => {
      try {
        // Déterminer les options appropriées en fonction de si c'est un chargement forcé
        const apiOptions = {
          noCache: true,
          retries: 2,
          timeout: 12000,
        };

        // Appeler l'API pour obtenir les données utilisateur
        const response = await apiService.get('/api/me', apiOptions);
        
        // Extraire les données utilisateur de la réponse
        let userData = null;
        
        if (response?.data) {
          userData = response.data;
        } else if (response?.user) {
          userData = response.user;
        } else {
          userData = response;
        }
        
        // Si les données sont un tableau, prendre le premier élément
        if (Array.isArray(userData)) {
          userData = userData[0];
        }
        
        // Vérifier que les données sont valides
        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid user data format');
        }
        
        // Mettre à jour le cache
        userDataCache.data = userData;
        userDataCache.timestamp = Date.now();
        userDataCache.isLoading = false;
        userDataCache.consecutiveErrors = 0;

        // Notifier que les données ont été chargées (sauf si preventRecursion est true)
        if (!preventRecursion) {
          this._notifySubscribers(USER_DATA_EVENTS.LOADED, userData);
          
          // Déclencher un événement mis à jour
          this._notifySubscribers(USER_DATA_EVENTS.UPDATED, userData);
        }
        
        resolve(userData);
      } catch (error) {
        
        userDataCache.isLoading = false;
        userDataCache.consecutiveErrors++; // Incrémenter le compteur d'erreurs consécutives
        
        // Si le seuil d'erreur est atteint, activer le circuit breaker
        if (userDataCache.consecutiveErrors >= userDataCache.errorThreshold) {
          userDataCache.lastCircuitBreak = Date.now();
        }

        // Notifier l'erreur
        this._notifySubscribers(USER_DATA_EVENTS.ERROR, error);
        
        // Essayer de récupérer les données du cache ou du localStorage
        if (userDataCache.data) {
          resolve(userDataCache.data);
        } else {
          try {
            const cachedUserStr = localStorage.getItem('user');
            if (cachedUserStr) {
              return JSON.parse(cachedUserStr);
            }
          } catch (e) {
            // Erreur lors de la récupération des données utilisateur du localStorage
          }
          reject(error);
        }
      } finally {
        // Supprimer la requête en cours de la map une fois terminée
        setTimeout(() => {
          userDataCache.pendingRequests.delete('/api/me');
        }, 0);
      }
    });

    // Stocker la promesse dans la map des requêtes en cours
    userDataCache.pendingRequests.set('/api/me', loadPromise);
    
    return loadPromise;
  },

  /**
   * Vérifie si les données utilisateur sont en cours de chargement
   * @returns {boolean} - true si les données sont en cours de chargement
   */
  isLoading() {
    return userDataCache.isLoading;
  },

  /**
   * Invalide le cache des données utilisateur et notifie les abonnés
   * @param {string} [updateType] - Type optionnel de mise à jour (ex: 'profile_picture', 'address')
   * @param {Object} [options] - Options supplémentaires
   * @param {boolean} [options.skipRefresh] - Si true, ne pas rafraîchir les données après invalidation
   */
  invalidateCache(updateType = null, options = {}) {
    try {
      // Mettre à jour les statistiques (avec vérification défensive)
      if (this.stats) {
        this.stats.invalidationCount = (this.stats.invalidationCount || 0) + 1;
        this.stats.lastUpdate = Date.now();
      }
      
      // Invalider le cache local
      if (typeof userDataCache.invalidate === 'function') {
        userDataCache.invalidate();
      } else {
        // Fallback si la méthode n'existe pas
        userDataCache.data = null;
        userDataCache.timestamp = 0;
      }
      
      // Invalider les requêtes dans React Query
      const queryClient = getQueryClient();
      if (queryClient) {
        try {
          // Utiliser try/catch pour chaque partie critique
          queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
          
          // Invalider également les requêtes spécifiques selon le type de mise à jour
          if (updateType) {
            switch (updateType) {
              case 'profile_picture':
                queryClient.invalidateQueries({ queryKey: ['profilePicture'] });
                break;
              case 'address':
                queryClient.invalidateQueries({ queryKey: ['userAddress'] });
                break;
              // Ajouter d'autres cas spécifiques au besoin
            }
          }
        } catch (queryError) {
          console.warn('Erreur lors de l\'invalidation des requêtes:', queryError);
        }
      }
      
      // Notifier les abonnés de l'invalidation (avec vérification défensive)
      try {
        this._notifySubscribers(USER_DATA_EVENTS.INVALIDATED, updateType);
        this._notifySubscribers(USER_DATA_EVENTS.UPDATING, updateType);
      } catch (notifyError) {
        console.warn('Erreur lors de la notification des abonnés:', notifyError);
      }
      
      // Si l'option skipRefresh est true, ne pas rafraîchir les données
      if (options && options.skipRefresh) {
        console.log(`Skipping data refresh after invalidation (type: ${updateType})`);
        
        // Notifier quand même les abonnés que les données ont été mises à jour
        try {
          this._notifySubscribers(USER_DATA_EVENTS.UPDATED, updateType, null, { isPartialUpdate: true });
        } catch (notifyError) {
          console.warn('Erreur lors de la notification des abonnés:', notifyError);
        }
        
        return Promise.resolve(null);
      }
      
      // Rafraîchir les données depuis l'API
      return this._loadUserData('invalidateCache')
        .then(data => {
          // Notifier les abonnés que les données ont été mises à jour
          try {
            this._notifySubscribers(USER_DATA_EVENTS.UPDATED, updateType, data);
          } catch (notifyError) {
            console.warn('Erreur lors de la notification des abonnés:', notifyError);
          }
          return data;
        })
        .catch(error => {
          // Notifier les abonnés qu'une erreur s'est produite
          try {
            this._notifySubscribers(USER_DATA_EVENTS.ERROR, error);
          } catch (notifyError) {
            console.warn('Erreur lors de la notification des abonnés:', notifyError);
          }
          throw error;
        });
    } catch (error) {
      console.error('Erreur critique dans invalidateCache:', error);
      // Retourner une promesse résolue pour éviter de casser le flux
      return Promise.resolve(null);
    }
  },
  
  /**
   * Notifie les abonnés d'un événement
   * @private
   * @param {string} eventName - Nom de l'événement
   * @param {*} data - Données à envoyer avec l'événement
   */
  _notifySubscribers(eventName, ...args) {
    if (!this.subscribers) {
      this.subscribers = {};
      return;
    }
    
    // Avoid notification storms by tracking recent notifications
    if (!this._recentNotifications) {
      this._recentNotifications = {};
    }
    
    // Create an ID based on event name and a hash of the data
    const now = Date.now();
    let dataHash = 'no-data';
    
    try {
      // For userData events, use a more stable identifier based on user ID
      if (eventName === USER_DATA_EVENTS.UPDATED || eventName === USER_DATA_EVENTS.LOADED) {
        const userData = args[0];
        if (userData && userData.id) {
          // Use user ID and update timestamp for notification ID to better detect duplicates
          dataHash = `user-${userData.id}-${userData._timestamp || now}`;
        } else if (userData) {
          // Just use first 20 chars of stringified data for non-user objects
          dataHash = JSON.stringify(userData).substring(0, 20);
        }
      } else if (args[0]) {
        // For other events, use a short prefix of the JSON string
        dataHash = JSON.stringify(args[0]).substring(0, 30);
      }
    } catch (error) {
      console.warn('Error creating notification hash:', error);
      dataHash = 'hash-error-' + now;
    }
    
    const notificationId = `${eventName}:${dataHash}`;
    
    // Check if we've sent this exact notification recently (within 800ms)
    if (this._recentNotifications[notificationId] && 
        now - this._recentNotifications[notificationId] < 800) {
      // Skip duplicate notifications that happen too quickly
      console.log(`Skipping duplicate notification: ${eventName}:${dataHash.substring(0, 20)}`);
      return;
    }
    
    // Record this notification timestamp
    this._recentNotifications[notificationId] = now;
    
    // Clean up old notification records (older than 5 seconds)
    Object.keys(this._recentNotifications).forEach(key => {
      if (now - this._recentNotifications[key] > 5000) {
        delete this._recentNotifications[key];
      }
    });
    
    // Limit subscribers to process - if there are more than 10 subscribers to an event,
    // something might be wrong (memory leak)
    if (this.subscribers[eventName] && this.subscribers[eventName].length > 10) {
      console.warn(`Unusually high number of subscribers (${this.subscribers[eventName].length}) for event ${eventName}. Possible memory leak.`);
      // Keep only the 10 most recently added subscribers
      this.subscribers[eventName] = this.subscribers[eventName].slice(-10);
    }
    
    // Use setTimeout to break potential immediate recursion
    setTimeout(() => {
      if (this.subscribers[eventName]) {
        // Make a copy of subscribers to avoid modification during iteration
        const subscribers = [...this.subscribers[eventName]];
        
        subscribers.forEach(callback => {
          try {
            callback(...args);
          } catch (error) {
            console.error(`Error in subscriber callback for ${eventName}:`, error);
          }
        });
      }
    }, 0);
  },

  /**
   * S'abonne aux événements de changement des données utilisateur
   * @param {string} eventName - Nom de l'événement (voir USER_DATA_EVENTS)
   * @param {Function} callback - Fonction de rappel à appeler lors de l'événement
   * @returns {Function} - Fonction pour se désabonner
   */
  subscribe(eventName, callback) {
    if (!Object.values(USER_DATA_EVENTS).includes(eventName)) {
      return () => {};
    }
    
    if (!this.subscribers) {
      this.subscribers = {};
    }
    
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }
    
    this.subscribers[eventName].push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      const index = this.subscribers[eventName].indexOf(callback);
      if (index !== -1) {
        this.subscribers[eventName].splice(index, 1);
      }
    };
  },

  /**
   * Récupère les statistiques d'utilisation du gestionnaire de données utilisateur
   * @returns {Object} - Statistiques
   */
  getStats() {
    const now = Date.now();
    return {
      requestCount: userDataCache.requestCount,
      lastUpdated: userDataCache.timestamp ? new Date(userDataCache.timestamp).toISOString() : null,
      dataAge: userDataCache.timestamp ? now - userDataCache.timestamp : null,
      consecutiveErrors: userDataCache.consecutiveErrors,
      pendingRequests: Array.from(userDataCache.pendingRequests.keys()),
      isCircuitBreakerActive: userDataCache.consecutiveErrors >= userDataCache.errorThreshold &&
        (now - userDataCache.lastCircuitBreak < userDataCache.circuitBreakDuration),
      // Nouvelles statistiques de déduplication
      deduplicationMapSize: userDataCache.deduplicationMap.size,
      deduplicationEntries: Array.from(userDataCache.deduplicationMap.entries()).map(([key, entry]) => ({
        key,
        age: now - entry.timestamp
      })),
      cacheStatus: userDataCache.data ? (
        now - userDataCache.timestamp < userDataCache.freshnessDuration 
          ? 'fresh' 
          : now - userDataCache.timestamp < userDataCache.maxAgeDuration
            ? 'stale'
            : 'expired'
      ) : 'empty',
      hasCachedData: !!userDataCache.data,
      isLoading: userDataCache.isLoading
    };
  },

  /**
   * Coordonne une requête à une route spécifique
   * @param {string} route - Route API à appeler
   * @param {string} componentId - Identifiant du composant qui fait la requête
   * @param {Function} requestFn - Fonction qui effectue la requête API
   * @returns {Promise} - Promesse de la requête
   */
  coordinateRequest(route, componentId, requestFn) {
    // Enregistrer le composant comme utilisateur de la route
    this.requestRegistry.registerRouteUser(route, componentId);
    
    // Special handling for /api/me - use aggressive caching
    if (route.includes('/api/me')) {
      const now = Date.now();
      const cachedData = this.getCachedUserData();
      
      // If we have fresh cached data (less than 30 seconds old), use it
      if (cachedData && userDataCache.timestamp && (now - userDataCache.timestamp < 30000)) {
        this._debugCounters.cacheHits++;
        this._log('Using cached user data (less than 30s old)');
        return Promise.resolve(cachedData);
      }
      
      // If there's an active request for this route, reuse it
      const activeRequest = this.requestRegistry.getActiveRequest(route);
      if (activeRequest) {
        this._log('Reusing active request', 'info', true);
        return activeRequest;
      }
      
      // Otherwise, make a new request and register it
      this._debugCounters.apiCalls++;
      this._log('Making new API request', 'info', true);
      
      // Safely handle the request function
      let request;
      try {
        const result = requestFn();
        
        // Ensure result is a proper Promise
        if (result && typeof result === 'object' && typeof result.then === 'function') {
          request = result.then(response => {
            // Store the response in our cache
            userDataCache.data = response;
            userDataCache.timestamp = Date.now();
            
            // Also update localStorage
            try {
              localStorage.setItem('user', JSON.stringify(response));
            } catch (e) {
              console.warn('Error storing user data in localStorage:', e);
            }
            
            return response;
          });
        } else {
          console.warn('Request function did not return a Promise for /api/me route, wrapping result');
          request = Promise.resolve(result).then(response => {
            if (response) {
              userDataCache.data = response;
              userDataCache.timestamp = Date.now();
              
              try {
                localStorage.setItem('user', JSON.stringify(response));
              } catch (e) {
                console.warn('Error storing user data in localStorage:', e);
              }
            }
            return response;
          });
        }
      } catch (error) {
        console.error('Error executing request function for /api/me:', error);
        request = Promise.reject(error);
      }
      
      this.requestRegistry.registerActiveRequest(route, request);
      return request;
    }
    
    // Prioritize other critical user data routes
    const isCriticalRoute = route.includes('/profile') || 
                           route.includes('/user-roles') || 
                           route.includes('/user');
    
    // Skip throttling for critical routes
    if (isCriticalRoute) {
      // If there's an active request for this critical route, reuse it
      const activeRequest = this.requestRegistry.getActiveRequest(route);
      if (activeRequest) {
        return activeRequest;
      }
      
      // Otherwise, make a new request and register it
      let request;
      try {
        const result = requestFn();
        
        // Ensure result is a proper Promise
        if (result && typeof result === 'object' && typeof result.then === 'function') {
          request = result;
        } else {
          console.warn(`Request function did not return a Promise for critical route ${route}, wrapping result`);
          request = Promise.resolve(result);
        }
      } catch (error) {
        console.error(`Error executing request function for critical route ${route}:`, error);
        request = Promise.reject(error);
      }
      
      this.requestRegistry.registerActiveRequest(route, request);
      return request;
    }
    
    // For non-critical routes, apply normal throttling
    if (this.requestRegistry.shouldThrottleRequest(route)) {
      
      // Si une requête est déjà active, la réutiliser
      const activeRequest = this.requestRegistry.getActiveRequest(route);
      if (activeRequest) {
        return activeRequest;
      }
      
      // Sinon, créer une promesse résolue pour éviter de faire une nouvelle requête
      this._log('Request throttled, using cached data', 'warn', true);
      return Promise.resolve(null);
    }
    
    // Coordonner la requête via le registre
    return this.requestRegistry.coordinateRequest(route, requestFn);
  }
};

export default userDataManager;