import axios from 'axios';

// Import the low performance mode detection from loadingUtils
import { setLowPerformanceMode } from '../utils/loadingUtils';

// Système de verrouillage pour éviter les requêtes en parallèle
const pendingRequests = new Map();

// Détection des performances de l'appareil
function detectDevicePerformance() {
  // Si déjà détecté, utiliser la valeur en cache
  if (window._devicePerformanceScore !== undefined) {
    return window._devicePerformanceScore;
  }
  
  try {
    const startTime = performance.now();
    
    // Test simple de performance - calcul intense
    let result = 0;
    for (let i = 0; i < 100000; i++) {
      result += Math.sqrt(i);
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Score basé sur le temps d'exécution (0-100)
    // Plus bas = meilleure performance
    const performanceScore = Math.min(100, Math.max(0, executionTime / 10));
    
    // Stocker le score pour la session
    window._devicePerformanceScore = performanceScore;
    
    // Définir également le mode performance basse si nécessaire
    if (performanceScore > 70) {
      setLowPerformanceMode(true);
    }
    
    return performanceScore;
  } catch (e) {
    return 50; // Score moyen par défaut
  }
}

// Calculer les timeouts adaptatifs en fonction de la performance du dispositif
function getAdaptiveTimeout(baseTimeout, isImportant = false) {
  const performanceScore = detectDevicePerformance();
  
  // Pour les requêtes importantes, limiter l'augmentation du timeout
  const multiplier = isImportant ? 
    Math.max(1, 1 + (performanceScore / 100)) : // Max 2x pour importantes
    Math.max(1, 1.5 + (performanceScore / 50));  // Max 3.5x pour non-importantes
  
  return Math.round(baseTimeout * multiplier);
}

// Determine if we're in low performance mode
const isLowPerformanceMode = () => {
  // Run the performance detection on first call
  if (window._devicePerformanceScore === undefined) {
    detectDevicePerformance();
  }
  return localStorage.getItem('preferLowPerformanceMode') === 'true' || window._devicePerformanceScore > 70;
};

// Configure default timeouts based on performance mode
const getDefaultTimeout = (isProfileRequest = false) => {
  const lowPerformance = isLowPerformanceMode();
  
  if (isProfileRequest) {
    return lowPerformance ? 3000 : 2000; // Increase timeout for profile requests on low-perf devices
  }
  
  return lowPerformance ? 15000 : 30000; // Shorter timeout for low-perf devices to avoid hanging
};

// Configure des intercepteurs pour logger les requêtes et réponses
axios.interceptors.request.use(request => {
  // Ne pas afficher les informations sensibles comme les mots de passe
  const requestData = { ...request.data };
  if (requestData.password) {
    requestData.password = '********';
  }
  
  // Identifier les requêtes d'authentification
  let isAuthRequest = false;
  if (request.url) {
    isAuthRequest = request.url.includes('/login_check') || 
                   request.url.includes('/token/refresh') ||
                   request.url.includes('/token/revoke');
  }
  
  // Set default timeout based on performance mode
  if (!request.timeout) {
    const isProfileRequest = request.url && (request.url.includes('/profile/') || request.url.includes('/me'));
    request.timeout = getDefaultTimeout(isProfileRequest);
  }
  
  // Ajouter les credentials et les headers CORS
  request.withCredentials = true;
  
  // Récupérer le token depuis le localStorage si disponible
  const token = localStorage.getItem('token');
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return request;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  // Identifier les réponses d'authentification
  let isAuthResponse = false;
  if (response.config?.url) {
    isAuthResponse = response.config.url.includes('/login_check') || 
                    response.config.url.includes('/token/refresh') ||
                    response.config.url.includes('/token/revoke');
  }
  
  return response;
}, error => {
  return Promise.reject(error);
});

// Configuration de base pour axios
axios.defaults.withCredentials = true;
axios.defaults.timeout = 15000; // Augmenter le délai d'attente global à 15 secondes

// Enhanced cache configuration with specific TTLs for different data types
const DEFAULT_CACHE_TTL = 60000; // 1 minute default
const PROFILE_CACHE_TTL = 300000; // 5 minutes for profile data
const STATIC_CACHE_TTL = 600000; // 10 minutes for static data

// Memory optimization settings
const MEMORY_CONFIG = {
  // Smaller cache size to reduce memory footprint
  MAX_CACHE_SIZE: 30, // Reduced from 50
  // Maximum size of cached response in bytes (approximately 100KB)
  MAX_ITEM_SIZE: 100 * 1024,
  // Profile data size limit (smaller since we also use localStorage)
  PROFILE_SIZE_LIMIT: 50 * 1024,
  // Cleanup interval more frequent to release memory faster
  CLEANUP_INTERVAL: 2 * 60 * 1000 // 2 minutes (reduced from 5)
};

// Cache in-memory pour les réponses API
const apiCache = new Map();

// Tracking for prefetched requests to avoid duplicate prefetching
const prefetchedRequests = new Set();

// Preload flag to track if we've already preloaded profile data
let profilePreloaded = false;

// Last cleanup timestamp
let lastCacheCleanup = Date.now();

// Ajouter ces constantes en haut du fichier
const PUBLIC_PROFILE_CACHE_TTL = 120000; // 2 minutes
const PUBLIC_PROFILE_CACHE_KEY = 'public-profile';

/**
 * Estimate the size of an object in bytes (approximate)
 * @param {Object} object - Object to measure
 * @returns {number} - Approximate size in bytes
 */
const estimateObjectSize = (object) => {
  const jsonString = JSON.stringify(object);
  return jsonString ? jsonString.length * 2 : 0; // Unicode chars can be 2 bytes
};

/**
 * Nettoie le cache en supprimant les entrées expirées et limitant la taille
 * Optimized for memory usage
 */
const cleanupCache = () => {
  const now = Date.now();
  
  // Only run cleanup periodically to avoid performance impact
  if (now - lastCacheCleanup < MEMORY_CONFIG.CLEANUP_INTERVAL) {
    return;
  }
  
  lastCacheCleanup = now;
  
  // Remove expired entries first
  for (const [key, value] of apiCache.entries()) {
    if (value.expiry < now) {
      apiCache.delete(key);
    }
  }
  
  // If cache is still too large, remove entries based on size and age
  if (apiCache.size > MEMORY_CONFIG.MAX_CACHE_SIZE) {
    const entries = Array.from(apiCache.entries());
    
    // Calculate score for each entry (lower is better to keep)
    // Score = age * size factor
    entries.forEach(([key, value]) => {
      const age = now - value.timestamp;
      const size = estimateObjectSize(value.data);
      value._score = age * (size / 1024); // Normalize size to KB
    });
    
    // Sort by score (highest first to remove)
    entries.sort((a, b) => b[1]._score - a[1]._score);
    
    // Remove highest scored entries until we're under the limit
    for (let i = 0; i < entries.length && apiCache.size > MEMORY_CONFIG.MAX_CACHE_SIZE; i++) {
      apiCache.delete(entries[i][0]);
    }
  }
  
  // Force garbage collection hint (not guaranteed but can help)
  if (window.gc) {
    try {
      window.gc();
    } catch (e) {
      // Ignore if not available
    }
  }
};

/**
 * Normalise une URL d'API en gérant les doublons de "/api"
 * @param {string} path - Le chemin de l'API
 * @returns {string} - L'URL complète normalisée
 */
export const normalizeApiUrl = (path) => {
  // Handle null or undefined paths
  if (!path) return '/api';
  
  // Remove trailing slashes for consistency
  const trimmedPath = path.replace(/\/+$/, '');
  
  // If the path starts with http:// or https://, it's an absolute URL - return it as is
  if (trimmedPath.match(/^https?:\/\//)) {
    return trimmedPath;
  }
  
  // Check if the path already has the /api prefix
  if (trimmedPath.startsWith('/api/')) {
    return trimmedPath;
  }
  
  // Simplify handling of the /api prefix
  // Add /api prefix if it's not already there
  if (trimmedPath.startsWith('/')) {
    return `/api${trimmedPath}`;
  } else {
    return `/api/${trimmedPath}`;
  }
};

/**
 * Generates a cache key for a request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} params - Query parameters
 * @returns {string} - Cache key
 */
export const generateCacheKey = (method, url, params = {}) => {
  return `${method}:${url}:${JSON.stringify(params)}`;
};

/**
 * Service d'API pour gérer les appels centralisés
 */
const apiService = {
  /**
   * Effectue une requête GET
   * @param {string} path - Chemin de l'API
   * @param {Object} options - Options de la requête (headers, params, etc.)
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async get(path, options = {}) {
    try {
      const url = normalizeApiUrl(path);
      
      // Générer une clé unique pour cette requête
      const requestKey = `${path}${JSON.stringify(options.params || {})}`;
      
      // Identify if this is a profile request for special handling
      const isPublicProfileRequest = path.includes('/profile/public/');
      const isPersonalProfileRequest = path === '/profile' || path === '/me' || path === '/api/me';
      const isProfileRequest = isPublicProfileRequest || isPersonalProfileRequest;
      const isStaticRequest = path.includes('/static') || path.includes('/config');
      
      // For personal profile requests only, use more aggressive caching
      if (isPersonalProfileRequest && !options.noCache && !options.background) {
        try {
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            const userData = JSON.parse(cachedUser);
            const cacheTime = userData._extractedAt || 0;
            const cacheAge = Date.now() - cacheTime;
            
            if (cacheAge < 30000) {
              return Promise.resolve(userData);
            }
          }
        } catch (e) {
          // Error with localStorage, continue with normal flow
        }
      }
      
      // Vérifier si une requête identique est déjà en cours
      if (pendingRequests.has(requestKey)) {
        return pendingRequests.get(requestKey);
      }
      
      // Check for in-memory cache if caching is not disabled
      if (!options.noCache) {
        const cacheKey = generateCacheKey('GET', url, options.params);
        const cached = apiCache.get(cacheKey);
        
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        }
      }

      // Identifier le type de requête pour optimiser les timeouts
      const isMessagesRequest = path.includes('/messages');
      const isCriticalRequest = path.includes('/auth') || options.critical === true;
      
      // Définir les timeouts de base selon le type de requête
      // Reduced timeout for profile requests to fail faster and use cache
      const baseTimeout = isProfileRequest ? 2000 : 
                          isMessagesRequest ? 5000 : 
                          isCriticalRequest ? 8000 : 10000;
      
      // Appliquer le timeout adaptatif en fonction des performances de l'appareil
      const adaptiveTimeout = options.timeout || getAdaptiveTimeout(baseTimeout, isCriticalRequest);
      
      // Configure axios request with appropriate timeouts
      const requestConfig = {
        ...options,
        timeout: adaptiveTimeout,
        headers: {
          ...options.headers,
          // Add cache optimization headers
          'X-Request-Type': isProfileRequest ? 'profile' : 
                           isStaticRequest ? 'static' : 'standard',
          'X-Cache-Priority': isProfileRequest ? 'high' : 'normal',
          // Add cache control headers for browser caching
          'Cache-Control': isProfileRequest ? 'no-cache' : 'max-age=300'
        }
      };
      
      // Implement retries for profile and messages requests
      // Reduced retries for profile to speed up fallback to cache
      const maxRetries = options.retries !== undefined ? Math.min(options.retries, 2) : 
                         isProfileRequest ? 0 : // No retries for profile to speed up response
                         (isMessagesRequest) ? 1 : 0;
      
      // Créer une promesse pour cette requête
      const requestPromise = (async () => {
        let retries = 0;
        let lastError = null;
        
        // Start timer for performance tracking
        const startTime = Date.now();
        
        // Utiliser une boucle while au lieu d'une récursion pour éviter des problèmes de pile
        while (retries <= maxRetries) {
          try {
            const response = await axios.get(url, requestConfig);
            
            // Si success, mettre en cache si le caching n'est pas désactivé
            if (!options.noCache) {
              const cacheKey = generateCacheKey('GET', url, options.params);
              
              // Use appropriate TTL based on request type
              let ttl = options.cacheDuration || DEFAULT_CACHE_TTL;
              if (isProfileRequest) {
                ttl = PROFILE_CACHE_TTL;
              } else if (isStaticRequest) {
                ttl = STATIC_CACHE_TTL;
              }
              
              // Check data size before storing in memory cache
              const responseSize = estimateObjectSize(response.data);
              const sizeLimit = isProfileRequest ? 
                MEMORY_CONFIG.PROFILE_SIZE_LIMIT : 
                MEMORY_CONFIG.MAX_ITEM_SIZE;
              
              // Only store in memory if size is reasonable
              if (responseSize <= sizeLimit) {
                // Store in apiCache
                apiCache.set(cacheKey, {
                  data: response.data,
                  timestamp: Date.now(),
                  expiry: Date.now() + ttl,
                  size: responseSize // Store size for future reference
                });
              }
              
              // For profile data, also store in localStorage for faster access
              if (isProfileRequest && response.data) {
                try {
                  // Create a minimal version for localStorage to save space
                  const userData = this._createMinimalUserData(response.data);
                  userData._extractedAt = Date.now();
                  localStorage.setItem('user', JSON.stringify(userData));
                } catch (e) {
                  // Ignore localStorage errors
                }
              }
              
              cleanupCache();
            }
            
            return response.data;
          } catch (error) {
            lastError = error;
            
            // For profile requests, try to use cached data immediately on error
            if (isProfileRequest) {
              try {
                // Try memory cache first
                const cacheKey = generateCacheKey('GET', url, options.params);
                const cached = apiCache.get(cacheKey);
                if (cached) {
                  return cached.data;
                }
                
                // Try localStorage next
                const cachedUser = localStorage.getItem('user');
                if (cachedUser) {
                  return JSON.parse(cachedUser);
                }
              } catch (e) {
                // Continue with normal error handling
              }
            }
            
            // Ne pas retenter si c'est une erreur 4xx (sauf timeout)
            if (error.response && error.response.status >= 400 && error.response.status < 500) {
              break;
            }
            
            // Attendre avant de réessayer avec backoff exponentiel
            if (retries < maxRetries) {
              const backoffDelay = Math.min(1000 * Math.pow(2, retries), 8000);
              await new Promise(resolve => setTimeout(resolve, backoffDelay));
              retries++;
            } else {
              break;
            }
          }
        }
        
        // Toutes les tentatives ont échoué
        throw lastError;
      })();
      
      // Enregistrer cette promesse
      pendingRequests.set(requestKey, requestPromise);
      
      try {
        return await requestPromise;
      } finally {
        // Libérer le verrou quand la requête est terminée
        pendingRequests.delete(requestKey);
      }
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Effectue une requête POST
   * @param {string} path - Chemin de l'API
   * @param {Object} data - Données à envoyer
   * @param {Object} options - Options de la requête (headers, etc.)
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async post(path, data = {}, options = {}) {
    try {
      const url = normalizeApiUrl(path);
      const response = await axios.post(url, data, options);
      return response.data;
    } catch (error) {
      // Pour login_check, on ne doit PAS transformer l'erreur, mais la rejeter
      // afin que le composant d'authentification puisse la traiter correctement
      if (path.includes('login_check')) {
        throw error;
      }
      
      // Gestion spécifique des erreurs CORS
      if (error.message && error.message.includes('Network Error')) {
        return { success: false, message: 'Erreur de communication avec le serveur' };
      }
      
      // Retourner une réponse formatée en cas d'erreur pour éviter les crashes
      if (error.response && error.response.data) {
        return { success: false, message: error.response.data.message || 'Une erreur est survenue' };
      }
      
      return { success: false, message: 'Une erreur est survenue' };
    }
  },
  
  /**
   * Effectue une requête PUT
   * @param {string} path - Chemin de l'API
   * @param {Object} data - Données à envoyer
   * @param {Object} options - Options de la requête (headers, etc.)
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async put(path, data = {}, options = {}) {
    try {
      const url = normalizeApiUrl(path);
      const response = await axios.put(url, data, options);
      return response.data;
    } catch (error) {
      // Gestion spécifique des erreurs CORS
      if (error.message && error.message.includes('Network Error')) {
        return { success: false, message: 'Erreur de communication avec le serveur' };
      }
      
      // Retourner une réponse formatée en cas d'erreur pour éviter les crashes
      if (error.response && error.response.data) {
        return { success: false, message: error.response.data.message || 'Une erreur est survenue' };
      }
      
      return { success: false, message: 'Une erreur est survenue' };
    }
  },
  
  /**
   * Effectue une requête DELETE
   * @param {string} path - Chemin de l'API
   * @param {Object} options - Options de la requête (headers, etc.)
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async delete(path, options = {}) {
    try {
      const response = await axios.delete(normalizeApiUrl(path), options);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Fonctions spécifiques pour la gestion des rôles utilisateurs
   */
  async getUsersByRole(roleName) {
    // S'assurer que le rôle est au format correct (avec le préfixe ROLE_)
    const formattedRoleName = roleName.startsWith('ROLE_') 
      ? roleName 
      : `ROLE_${roleName.replace('ROLE_', '')}`;
    
    try {
      // Essayons d'abord avec la méthode /api/users-by-role endpoint
      return await this.get(`/users-by-role/${formattedRoleName}`);
    } catch (error) {
      console.warn(`L'API /users-by-role/${formattedRoleName} a échoué, tentative avec /users`);
      
      // Si ça échoue, récupérons tous les utilisateurs et filtrons côté client
      const response = await this.get('/users');
      
      if (response.success && response.data) {
        // Filtrer manuellement les utilisateurs par rôle
        const filteredUsers = response.data.filter(user => 
          user.roles && user.roles.some(role => 
            role.name === formattedRoleName || 
            role.name === formattedRoleName.replace('ROLE_', '') ||
            'ROLE_' + role.name === formattedRoleName
          )
        );
        
        // Retourner dans le même format que l'API
        return {
          success: true,
          data: filteredUsers
        };
      }
      
      return response;
    }
  },
  
  async getAllRoles() {
    try {
      // Tenter d'obtenir les rôles depuis l'API
      return await this.get('/user-roles/roles');
    } catch (error) {
      console.warn("Erreur lors de la récupération des rôles depuis l'API, utilisation des rôles prédéfinis", error);
      
      // Retourner des rôles par défaut en cas d'erreur
      return {
        success: true,
        data: [
          { id: 1, name: "ROLE_SUPERADMIN", description: "Super Administrateur" },
          { id: 2, name: "ROLE_ADMIN", description: "Administrateur" },
          { id: 3, name: "ROLE_TEACHER", description: "Formateur" },
          { id: 4, name: "ROLE_STUDENT", description: "Étudiant" },
          { id: 5, name: "ROLE_HR", description: "Ressources Humaines" },
          { id: 6, name: "ROLE_RECRUITER", description: "Recruteur" },
          { id: 7, name: "ROLE_GUEST", description: "Invité" }
        ]
      };
    }
  },
  
  /**
   * Change a user's role (for admins, superadmins, and recruiters)
   * @param {number} userId - The user's ID
   * @param {string} oldRoleName - The user's current role name
   * @param {string} newRoleName - The new role name to assign
   * @returns {Promise<Object>} - API response
   */
  async changeUserRole(userId, oldRoleName, newRoleName) {
    return this.post('/user-roles/change-role', {
      userId,
      oldRoleName,
      newRoleName
    });
  },
  
  /**
   * Update user information
   * @param {number} userId - The user's ID
   * @param {Object} userData - User data to update (firstName, lastName, email, phoneNumber, birthDate, roles, etc.)
   * @returns {Promise<Object>} - API response
   */
  async updateUser(userId, userData) {
    return this.put(`/users/${userId}`, userData);
  },
  
  /**
   * Ajoute le token d'authentification aux headers
   * @param {Object} options - Options de la requête
   * @returns {Object} - Options avec le header d'authentification ajouté
   */
  withAuth(options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
      return options;
    }
    
    return {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    };
  },

  /**
   * Invalide le cache pour un chemin spécifique
   * @param {string} path - Chemin de l'API à invalider
   */
  invalidateCache(path) {
    // Logique d'invalidation du cache pour un chemin spécifique
    // Ici, on pourrait implémenter une logique avec localStorage ou IndexedDB si nécessaire
  },

  /**
   * Invalide le cache lié au profil utilisateur
   */
  invalidateProfileCache() {
    // Logique d'invalidation du cache spécifique au profil
    this.invalidateCache('/profile');
    this.invalidateCache('/api/me');
  },

  /**
   * Invalide le cache lié aux documents
   */
  invalidateDocumentCache() {
    // Logique d'invalidation du cache spécifique aux documents
    this.invalidateCache('/documents');
  },

  /**
   * Vide complètement le cache API
   */
  clearCache() {
    // Clear in-memory cache - much faster than localStorage operations
    apiCache.clear();
    
    // Only clear critical localStorage items, not everything
    const criticalKeys = [
      'token', 
      'refresh_token',
      'user',
      'userRoles'
    ];
    
    // Remove only the critical keys
    criticalKeys.forEach(key => {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // Silent error handling
      }
    });
    
    // Notify the application that the cache has been cleared
    window.dispatchEvent(new Event('api-cache-cleared'));
  },
  
  /**
   * Invalidate a specific cache entry
   * @param {string} method - The HTTP method
   * @param {string} path - The API path
   * @param {Object} params - Query parameters if any
   */
  invalidateCacheEntry(method, path, params = {}) {
    const url = normalizeApiUrl(path);
    const cacheKey = generateCacheKey(method, url, params);
    apiCache.delete(cacheKey);
  },
  
  /**
   * Optimized method specifically for fetching user profile data
   * @param {Object} options - Additional options for the request
   * @returns {Promise<Object>} - User profile data
   */
  async getUserProfile(options = {}) {
    // Try to use localStorage cache first for immediate response
    if (!options.noCache) {
      try {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          const userData = JSON.parse(cachedUser);
          const cacheTime = userData._extractedAt || 0;
          const cacheAge = Date.now() - cacheTime;
          
          // Use very fresh cache immediately (under 30 seconds old)
          if (cacheAge < 30000) {
            return userData;
          }
        }
      } catch (e) {
        // Error with localStorage, continue with API call
      }
    }
    
    // Use optimized get method with profile-specific settings
    return this.get('/me', {
      headers: {
        'X-Request-Type': 'profile',
        'X-Cache-Priority': 'high'
      },
      cacheDuration: PROFILE_CACHE_TTL,
      timeout: getAdaptiveTimeout(2000, true), // Reduced timeout for faster fallback to cache
      retries: 0, // No retries to speed up response
      ...options
    });
  },

  /**
   * Preload profile data in the background
   * This can be called on app initialization to warm up the cache
   */
  preloadProfileData() {
    // Only preload once per session
    if (profilePreloaded) return;
    profilePreloaded = true;
    
    // Use setTimeout to not block the main thread
    setTimeout(() => {
      this.getUserProfile({ background: true })
        .catch(() => {}); // Ignore errors in background preload
    }, 100);
  },

  /**
   * Create a minimal version of user data for storage
   * Removes unnecessary fields to reduce memory usage
   * @private
   * @param {Object} userData - Full user data
   * @returns {Object} - Minimal user data
   */
  _createMinimalUserData(userData) {
    if (!userData) return null;
    
    // Create a copy with only essential fields
    const minimalData = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName || userData.firstname,
      lastName: userData.lastName || userData.lastname,
      roles: userData.roles,
      status: userData.status
    };
    
    // Add other essential fields if they exist
    if (userData.avatar) minimalData.avatar = userData.avatar;
    if (userData.permissions) minimalData.permissions = userData.permissions;
    
    return minimalData;
  },

  /**
   * Clear memory cache to free up RAM
   * Can be called during low memory situations
   */
  clearMemoryCache() {
    apiCache.clear();
    console.log('API memory cache cleared');
    
    // Force garbage collection hint
    if (window.gc) {
      try {
        window.gc();
      } catch (e) {
        // Ignore if not available
      }
    }
  },

  async getPublicProfile(userId, options = {}) {
    if (!userId) {
      throw new Error('User ID is required to fetch public profile');
    }

    const cacheKey = `${PUBLIC_PROFILE_CACHE_KEY}-${userId}`;
    console.log('Attempting to fetch public profile for userId:', userId);
    
    try {
      // Vérifier le cache seulement si pas de signal d'abort
      if (!options.signal) {
        const cached = apiCache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) {
          console.log('Returning cached profile data');
          return cached.data;
        }
      }

      console.log('Making API request to:', `/profile/public/${userId}`);
      const response = await this.get(`/profile/public/${userId}`, {
        ...options,
        noCache: true, // Force disable personal profile cache
        headers: {
          ...options.headers,
          'X-Request-Type': 'public-profile',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: getAdaptiveTimeout(5000, true)
      });
      console.log('Raw API response:', response);

      if (response) {
        // Normaliser la réponse
        const formattedResponse = {
          success: true,
          data: {
            user: response.data?.user || response.data || response
          }
        };
        console.log('Formatted response:', formattedResponse);

        // Ne pas mettre en cache si un signal d'abort est présent
        if (!options.signal) {
          console.log('Caching formatted response');
          apiCache.set(cacheKey, {
            data: formattedResponse,
            timestamp: Date.now(),
            expiry: Date.now() + PUBLIC_PROFILE_CACHE_TTL
          });
        }
        
        return formattedResponse;
      }

      console.error('No response received from server');
      throw new Error('No response received from server');
    } catch (error) {
      console.error('Error in getPublicProfile:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('La requête a pris trop de temps, veuillez réessayer');
      }
      if (error.response) {
        console.error('Server response error:', error.response.data);
        throw new Error(error.response.data.message || 'Erreur lors de la récupération du profil public');
      }
      throw error;
    }
  },

  clearPublicProfileCache(userId) {
    if (userId) {
      const cacheKey = `${PUBLIC_PROFILE_CACHE_KEY}-${userId}`;
      apiCache.delete(cacheKey);
    } else {
      // Si pas d'userId, nettoyer tous les caches de profils publics
      for (const [key] of apiCache.entries()) {
        if (key.startsWith(PUBLIC_PROFILE_CACHE_KEY)) {
          apiCache.delete(key);
        }
      }
    }
  }
};

// Exporter le service API pour utilisation dans d'autres modules
export default apiService; 