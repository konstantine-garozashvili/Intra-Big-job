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
  events: new EventTarget()
};

// Événements personnalisés
export const USER_DATA_EVENTS = {
  LOADED: 'userData:loaded',
  LOADING: 'userData:loading',
  ERROR: 'userData:error',
  UPDATED: 'userData:updated'
};

/**
 * Service centralisé pour gérer les données utilisateur
 */
const userDataManager = {
  /**
   * Récupère les données utilisateur
   * @param {Object} options - Options de récupération
   * @param {boolean} options.forceRefresh - Force une nouvelle requête même si les données sont fraîches
   * @param {number} options.maxAge - Âge maximal des données en ms (par défaut 20 minutes)
   * @param {boolean} options.useCache - Utilise les données en cache si disponibles
   * @param {string} options.routeKey - Clé de route à utiliser ('/api/me' ou '/profile/consolidated')
   * @returns {Promise<Object>} - Données utilisateur
   */
  async getUserData(options = {}) {
    const {
      forceRefresh = false,
      maxAge = userDataCache.maxAgeDuration,
      useCache = true,
      routeKey = '/api/me'
    } = options;

    // Incrémenter le compteur de requêtes
    userDataCache.requestCount++;
    
    // Vérifier si le circuit breaker est actif (trop d'erreurs consécutives)
    const now = Date.now();
    if (userDataCache.consecutiveErrors >= userDataCache.errorThreshold) {
      const timeInBreak = now - userDataCache.lastCircuitBreak;
      if (timeInBreak < userDataCache.circuitBreakDuration) {
        console.warn(`Circuit breaker actif, attente de ${(userDataCache.circuitBreakDuration - timeInBreak) / 1000}s avant nouvelles requêtes`);
        
        // Si on a des données en cache, les retourner même si elles sont anciennes
        if (userDataCache.data) {
          return userDataCache.data;
        }
        
        // Sinon, tenter de récupérer les données depuis le localStorage
        try {
          const cachedUserStr = localStorage.getItem('user');
          if (cachedUserStr) {
            return JSON.parse(cachedUserStr);
          }
        } catch (e) {
          console.error('Erreur lors de la récupération des données utilisateur du localStorage:', e);
        }
        
        // Si tout échoue, attendre que le circuit breaker se réinitialise
        await new Promise(resolve => setTimeout(resolve, userDataCache.circuitBreakDuration - timeInBreak));
      } else {
        // Réinitialiser le circuit breaker après la période de pause
        userDataCache.consecutiveErrors = 0;
      }
    }

    // Si une requête est déjà en cours pour la même route, retourner la promesse existante
    if (userDataCache.pendingRequests.has(routeKey) && !forceRefresh) {
      console.log(`Requête UserData déjà en cours pour ${routeKey}, réutilisation de la promesse existante`);
      return userDataCache.pendingRequests.get(routeKey);
    }

    // Vérifier si les données en cache sont suffisamment fraîches
    if (
      useCache && 
      userDataCache.data && 
      !forceRefresh && 
      now - userDataCache.timestamp < maxAge
    ) {
      // Vérifier si elles sont très fraîches (moins de 2 minutes)
      const isSuperFresh = now - userDataCache.timestamp < userDataCache.freshnessDuration;
      
      if (isSuperFresh) {
        console.log('Utilisation des données utilisateur en cache (très fraîches)');
        return userDataCache.data;
      }
      
      // Si les données sont moins fraîches mais utilisables, les retourner et déclencher un rafraîchissement en arrière-plan
      console.log('Utilisation des données utilisateur en cache (actualisation en arrière-plan)');
      
      // Déclencher un rafraîchissement en arrière-plan sans attendre le résultat
      this._loadUserData(routeKey, { background: true })
        .catch(e => console.warn('Erreur lors du rafraîchissement en arrière-plan:', e));
        
      return userDataCache.data;
    }

    // Si nous arrivons ici, nous devons charger/recharger les données
    return this._loadUserData(routeKey, { forceRefresh });
  },

  /**
   * Charge les données utilisateur depuis l'API
   * @private
   * @param {string} routeKey - Clé de route à utiliser
   * @param {Object} options - Options de chargement
   * @returns {Promise<Object>} - Données utilisateur
   */
  async _loadUserData(routeKey, options = {}) {
    const { forceRefresh = false, background = false } = options;
    
    // Notifier que le chargement a commencé si ce n'est pas un chargement en arrière-plan
    if (!background) {
      userDataCache.isLoading = true;
      userDataCache.events.dispatchEvent(new CustomEvent(USER_DATA_EVENTS.LOADING));
    }

    // Créer une nouvelle promesse pour le chargement
    const loadPromise = new Promise(async (resolve, reject) => {
      try {
        // Déterminer les options appropriées en fonction de si c'est un chargement forcé
        const apiOptions = {
          noCache: forceRefresh,
          retries: background ? 1 : 2, // Moins de tentatives pour les requêtes en arrière-plan
          timeout: background ? 8000 : 12000, // Timeout plus court pour les requêtes en arrière-plan
        };

        // Appeler l'API pour obtenir les données utilisateur
        const response = await apiService.get(routeKey, apiOptions);
        
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
        }

        // Notifier que les données ont été chargées
        userDataCache.events.dispatchEvent(new CustomEvent(USER_DATA_EVENTS.LOADED, { detail: userData }));
        
        // Si ce n'est pas un chargement en arrière-plan, déclencher un événement mis à jour
        if (!background) {
          userDataCache.events.dispatchEvent(new CustomEvent(USER_DATA_EVENTS.UPDATED, { detail: userData }));
        }

        resolve(userData);
      } catch (error) {
        console.error(`Erreur lors du chargement des données utilisateur depuis ${routeKey}:`, error);
        
        userDataCache.isLoading = false;
        userDataCache.consecutiveErrors++; // Incrémenter le compteur d'erreurs consécutives
        
        // Si le seuil d'erreur est atteint, activer le circuit breaker
        if (userDataCache.consecutiveErrors >= userDataCache.errorThreshold) {
          userDataCache.lastCircuitBreak = Date.now();
          console.warn(`Circuit breaker activé pour les requêtes utilisateur (${userDataCache.consecutiveErrors} erreurs consécutives)`);
        }

        // Notifier l'erreur
        userDataCache.events.dispatchEvent(new CustomEvent(USER_DATA_EVENTS.ERROR, { detail: error }));
        
        // Essayer de récupérer les données du cache ou du localStorage
        if (userDataCache.data) {
          console.log('Échec de la requête, utilisation des données en cache');
          resolve(userDataCache.data);
        } else {
          try {
            const cachedUserStr = localStorage.getItem('user');
            if (cachedUserStr) {
              const cachedUser = JSON.parse(cachedUserStr);
              console.log('Échec de la requête, utilisation des données du localStorage');
              resolve(cachedUser);
            } else {
              reject(error);
            }
          } catch (e) {
            reject(error);
          }
        }
      } finally {
        // Supprimer la requête en cours de la map une fois terminée
        setTimeout(() => {
          userDataCache.pendingRequests.delete(routeKey);
        }, 0);
      }
    });

    // Stocker la promesse dans la map des requêtes en cours
    userDataCache.pendingRequests.set(routeKey, loadPromise);
    
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
   * Récupère les données utilisateur du cache sans déclencher de requête
   * @returns {Object|null} - Données utilisateur ou null si non disponibles
   */
  getCachedUserData() {
    // Si les données en cache sont disponibles et pas trop anciennes
    if (userDataCache.data && Date.now() - userDataCache.timestamp < userDataCache.maxAgeDuration) {
      return userDataCache.data;
    }
    
    // Sinon, essayer de récupérer depuis le localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Erreur lors de la récupération des données utilisateur du localStorage:', e);
    }
    
    return null;
  },

  /**
   * Invalide le cache des données utilisateur
   */
  invalidateCache() {
    userDataCache.data = null;
    userDataCache.timestamp = 0;
    
    // Invalider également le cache React Query
    const queryClient = getQueryClient();
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['user-data'] });
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
      console.warn(`Événement inconnu: ${eventName}`);
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
    return {
      requestCount: userDataCache.requestCount,
      lastUpdated: userDataCache.timestamp ? new Date(userDataCache.timestamp).toISOString() : null,
      dataAge: userDataCache.timestamp ? Date.now() - userDataCache.timestamp : null,
      consecutiveErrors: userDataCache.consecutiveErrors,
      pendingRequests: Array.from(userDataCache.pendingRequests.keys()),
      isCircuitBreakerActive: userDataCache.consecutiveErrors >= userDataCache.errorThreshold &&
        (Date.now() - userDataCache.lastCircuitBreak < userDataCache.circuitBreakDuration)
    };
  }
};

export default userDataManager; 