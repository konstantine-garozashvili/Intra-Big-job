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
  deduplicationMap: new Map()
};

// Événements personnalisés
export const USER_DATA_EVENTS = {
  LOADED: 'userData:loaded',
  LOADING: 'userData:loading',
  ERROR: 'userData:error',
  UPDATED: 'userData:updated'
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
    // Si la route a une requête active, réutiliser cette requête
    if (this.activeRequests.has(route)) {
      return this.activeRequests.get(route);
    }
    
    // Vérifier si on doit limiter la fréquence des requêtes
    if (this.shouldThrottleRequest(route)) {
      
      // Si nous avons des données en cache, les retourner
      const cachedData = route.includes('/api/me') 
        ? userDataManager.getCachedUserData()
        : null;
        
      if (cachedData) {
        return Promise.resolve(cachedData);
      }
      
      // Sinon, attendre un peu avant d'exécuter la requête
      return new Promise(resolve => {
        setTimeout(() => {
          // Exécuter la fonction de requête et enregistrer la promesse
          const promise = requestFn();
          resolve(this.registerActiveRequest(route, promise));
        }, this.requestDebounceTime);
      });
    }
    
    // Exécuter la fonction de requête et enregistrer la promesse
    const promise = requestFn();
    return this.registerActiveRequest(route, promise);
  }
};

/**
 * Service centralisé pour gérer les données utilisateur
 */
const userDataManager = {
  // Exposer le registre des requêtes
  requestRegistry,

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
   * Charge les données utilisateur depuis l'API ou le cache
   * @param {boolean} forceRefresh - Forcer le rafraîchissement des données
   * @param {string} componentId - Identifiant du composant qui fait la requête
   * @returns {Promise<Object>} - Données utilisateur
   */
  getUserData(forceRefresh = false, componentId = 'default') {
    const now = Date.now();
    const cachedData = this.getCachedUserData();
    
    // Si nous avons des données fraîches en cache et qu'on ne force pas le rafraîchissement
    if (!forceRefresh && cachedData && cachedData.data) {
      const dataAge = now - cachedData.timestamp;
      
      // Si les données sont suffisamment fraîches (moins de 30 secondes), les utiliser
      if (dataAge < 30000) {
        console.info('Using fresh cached user data');
        return Promise.resolve(cachedData.data);
      }
      
      // Si une requête est déjà en cours, l'utiliser
      if (userDataCache.isLoading && userDataCache.loadingPromise) {
        return userDataCache.loadingPromise;
      }
    }
    
    // Si on force le rafraîchissement ou si les données sont périmées
    if (forceRefresh || !cachedData || !cachedData.data || (now - cachedData.timestamp > userDataCache.freshnessDuration)) {
      // Si une requête est déjà en cours et qu'on ne force pas le rafraîchissement
      if (!forceRefresh && userDataCache.isLoading && userDataCache.loadingPromise) {
        return userDataCache.loadingPromise;
      }
      
      // Sinon, charger les données depuis l'API
      return this._loadUserData(componentId);
    }
    
    // Retourner les données en cache (même si elles ne sont pas fraîches)
    return Promise.resolve(cachedData.data);
  },

  /**
   * Charge les données utilisateur depuis l'API
   * @private
   * @param {string} componentId - Identifiant du composant qui fait la requête
   * @returns {Promise<Object>} - Données utilisateur
   */
  async _loadUserData(componentId) {
    // Notifier que le chargement a commencé
    userDataCache.isLoading = true;
    userDataCache.events.dispatchEvent(new CustomEvent(USER_DATA_EVENTS.LOADING));
    
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
        let userData = response;
        if (response.user) {
          userData = response.user;
        } else if (response.data) {
          userData = response.data;
        } else if (response.success && response.user) {
          userData = response.user;
        }

        // Stocker les données dans le cache
        userDataCache.data = userData;
        userDataCache.timestamp = Date.now();
        userDataCache.isLoading = false;
        userDataCache.consecutiveErrors = 0; // Réinitialiser les erreurs consécutives

        // Stocker les données utilisateur dans le localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Mettre à jour le cache React Query
        const queryClient = getQueryClient();
        if (queryClient) {
          // Mettre à jour toutes les clés possibles qui pourraient utiliser ces données
          queryClient.setQueryData(['user', 'current'], userData);
          
          const sessionId = getSessionId();
          queryClient.setQueryData(['user-data', userData?.id || 'anonymous', sessionId], userData);
          queryClient.setQueryData(['currentUser'], userData);
          
          // Also update the unified key used by useUserData hook
          queryClient.setQueryData(['unified-user-data', '/api/me', sessionId], userData);
        }

        // Notifier que les données ont été chargées
        userDataCache.events.dispatchEvent(new CustomEvent(USER_DATA_EVENTS.LOADED, { detail: userData }));
        
        // Déclencher un événement mis à jour
        userDataCache.events.dispatchEvent(new CustomEvent(USER_DATA_EVENTS.UPDATED, { detail: userData }));
        
        resolve(userData);
      } catch (error) {
        
        userDataCache.isLoading = false;
        userDataCache.consecutiveErrors++; // Incrémenter le compteur d'erreurs consécutives
        
        // Si le seuil d'erreur est atteint, activer le circuit breaker
        if (userDataCache.consecutiveErrors >= userDataCache.errorThreshold) {
          userDataCache.lastCircuitBreak = Date.now();
        }

        // Notifier l'erreur
        userDataCache.events.dispatchEvent(new CustomEvent(USER_DATA_EVENTS.ERROR, { detail: error }));
        
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
   */
  invalidateCache(updateType = null) {
    
    // Réinitialiser le cache
    userDataCache.timestamp = 0;
    
    // Contrôle de la fréquence des événements
    const now = Date.now();
    const eventKey = updateType || 'general';
    
    // Si un événement du même type est déjà programmé, ne rien faire
    if (eventThrottleState.pendingEvents.has(eventKey)) {
      return;
    }
    
    // Si l'intervalle minimum n'est pas écoulé depuis le dernier événement, programmer l'événement
    if (now - eventThrottleState.lastEventTime < eventThrottleState.throttleInterval) {
      
      // Programmer l'événement pour plus tard
      const timeoutId = setTimeout(() => {
        eventThrottleState.lastEventTime = Date.now();
        eventThrottleState.pendingEvents.delete(eventKey);
        
        // Notifier les abonnés que les données ont été mises à jour
        userDataCache.events.dispatchEvent(
          new CustomEvent(USER_DATA_EVENTS.UPDATED, { 
            detail: updateType 
          })
        );
      }, eventThrottleState.throttleInterval - (now - eventThrottleState.lastEventTime));
      
      // Enregistrer l'événement programmé
      eventThrottleState.pendingEvents.set(eventKey, timeoutId);
      return;
    }
    
    // Mettre à jour le timestamp du dernier événement
    eventThrottleState.lastEventTime = now;
    
    // Notifier les abonnés que les données ont été mises à jour
    userDataCache.events.dispatchEvent(
      new CustomEvent(USER_DATA_EVENTS.UPDATED, { 
        detail: updateType 
      })
    );
    
    // Invalider les données dans React Query
    const queryClient = getQueryClient();
    if (queryClient) {
      queryClient.invalidateQueries(['user']);
      queryClient.invalidateQueries(['user-data']);
      queryClient.invalidateQueries(['unified-user-data']);
    }
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
    
    const handler = (event) => callback(event.detail);
    userDataCache.events.addEventListener(eventName, handler);
    
    // Retourner une fonction pour se désabonner
    return () => userDataCache.events.removeEventListener(eventName, handler);
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
        console.info('Using cached user data (less than 30s old)');
        return Promise.resolve(cachedData);
      }
      
      // If there's an active request for this route, reuse it
      const activeRequest = this.requestRegistry.getActiveRequest(route);
      if (activeRequest) {
        return activeRequest;
      }
      
      // Otherwise, make a new request and register it
      const request = requestFn().then(response => {
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
      const request = requestFn();
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
      return Promise.resolve(null);
    }
    
    // Coordonner la requête via le registre
    return this.requestRegistry.coordinateRequest(route, requestFn);
  }
};

export default userDataManager;