import axios from 'axios';

// Configurer des intercepteurs pour logger les requêtes et réponses
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
  
  // Ajouter les credentials et les headers CORS
  request.withCredentials = true;
  
  // Récupérer le token depuis le localStorage si disponible
  const token = localStorage.getItem('token');
  if (token) {
    request.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return request;
}, error => {
  console.error('Erreur lors de la préparation de la requête:', error);
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
  
  // Ne pas afficher les tokens complets pour des raisons de sécurité
  if (isAuthResponse) {
    const data = response.data;
    // Sanitize data if needed
  }
  
  return response;
}, error => {
  // Identifier les réponses d'authentification
  let isAuthResponse = false;
  if (error.config?.url) {
    isAuthResponse = error.config.url.includes('/login_check') || 
                    error.config.url.includes('/token/refresh') ||
                    error.config.url.includes('/token/revoke');
  }
  
  if (isAuthResponse) {
    console.error(`=== ERREUR API (${error.config?.method?.toUpperCase()}) - AUTHENTIFICATION ===`);
    console.error('URL:', error.config?.url);
    console.error('Statut:', error.response?.status, error.response?.statusText);
    
    if (error.response) {
      console.error('Données de réponse:', error.response.data);
    } else {
      console.error('Erreur réseau ou timeout');
    }
    
    // Vérifier spécifiquement pour les problèmes d'expiration de token
    if (error.response?.status === 401) {
      console.error('Token expiré ou invalide détecté');
    }
  } else {
    // Log standard pour les autres erreurs
    console.error(`Erreur API (${error.config?.method?.toUpperCase()}):`, error.config?.url, 'Statut:', error.response?.status);
    if (error.response) {
      console.error('Données d\'erreur:', error.response.data);
    }
  }
  
  return Promise.reject(error);
});

// Configuration de base pour axios
axios.defaults.withCredentials = true;

// Create a simple in-memory request cache with expiration
const apiCache = new Map();
const DEFAULT_CACHE_TTL = 60000; // 1 minute

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
  
  // Simplify handling of the /api prefix
  // This ensures we don't end up with /api/api/...
  const apiPath = trimmedPath.replace(/^\/api\//, '/');
  
  // Now add /api prefix if it doesn't already start with it
  if (apiPath.startsWith('/')) {
    return `/api${apiPath}`;
  } else {
    return `/api/${apiPath}`;
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
      
      // Check for in-memory cache if caching is not disabled
      if (!options.noCache) {
        const cacheKey = generateCacheKey('GET', url, options.params);
        const cached = apiCache.get(cacheKey);
        
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        }
      }
      
      // Set optimized timeouts based on request type
      const isProfileRequest = path.includes('/profile') || path.includes('/me');
      const isAuthRequest = path.includes('/login') || path.includes('/token');
      
      // Configure axios request with optimized settings
      const requestConfig = {
        ...options,
        timeout: options.timeout || (
          isAuthRequest ? 10000 : // Auth requests timeout increased from 3000ms to 10000ms
          isProfileRequest ? 7500 : // Profile requests timeout increased from 1500ms to 7500ms
          20000 // Standard timeout for regular requests increased from 10000ms to 20000ms
        )
      };
      
      const response = await axios.get(url, requestConfig);
      
      // Cache the response if caching is not disabled
      if (!options.noCache) {
        const cacheKey = generateCacheKey('GET', url, options.params);
        const ttl = options.cacheTTL || DEFAULT_CACHE_TTL;
        
        apiCache.set(cacheKey, {
          data: response.data,
          expiry: Date.now() + ttl
        });
      }
      
      return response.data;
    } catch (error) {
      // Only log detailed errors for non-profile requests
      const isProfileRequest = path.includes('/profile') || path.includes('/me');
      
      if (!isProfileRequest) {
        console.error(`Erreur API GET ${path}:`, error);
        console.error(`[apiService] Détails de l'erreur:`, error.response || error.message);
      } else {
        // For profile requests, log minimal error information
        console.error(`Erreur API (GET): ${path} Statut: ${error.response?.status || 'réseau'}`);
      }
      
      // Gestion spécifique des erreurs CORS
      if (error.message && error.message.includes('Network Error')) {
        console.error('Erreur réseau possible - Problème CORS');
        throw error; // Throw the error for proper propagation
      }
      
      // Pour les requêtes de profil, propager l'erreur au lieu de retourner un objet formaté
      if (isProfileRequest) {
        throw error;
      }
      
      // Retourner une réponse formatée en cas d'erreur pour éviter les crashes
      if (error.response && error.response.data) {
        return { success: false, message: error.response.data.message || 'Une erreur est survenue' };
      }
      
      return { success: false, message: 'Une erreur est survenue' };
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
      
      // Optimize login requests specifically
      const isLoginRequest = path.includes('login_check') || path.includes('/login');
      
      // Configure request
      const requestConfig = {
        ...options,
        timeout: options.timeout || (isLoginRequest ? 15000 : 20000)
      };
      
      const response = await axios.post(url, data, requestConfig);
      return response.data;
    } catch (error) {
      // Pour login_check, on ne doit PAS transformer l'erreur, mais la rejeter
      // afin que le composant d'authentification puisse la traiter correctement
      if (path.includes('login_check')) {
        throw error;
      }
      
      // Gestion spécifique des erreurs CORS
      if (error.message && error.message.includes('Network Error')) {
        console.error('Erreur réseau possible - Problème CORS');
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
      console.error(`Erreur API PUT ${path}:`, error);
      
      // Gestion spécifique des erreurs CORS
      if (error.message && error.message.includes('Network Error')) {
        console.error('Erreur réseau possible - Problème CORS');
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
      console.error(`Erreur API DELETE ${path}:`, error);
      throw error;
    }
  },
  
  /**
   * Fonctions spécifiques pour la gestion des rôles utilisateurs
   */
  async getUsersByRole(roleName) {
    return this.get(`/user-roles/users/${roleName}`);
  },
  
  async getAllRoles() {
    return this.get('/user-roles/roles');
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
   * Ajoute le token d'authentification aux headers
   * @param {Object} options - Options de la requête
   * @returns {Object} - Options avec le header d'authentification ajouté
   */
  withAuth(options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Tentative d\'appel API authentifié sans token');
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
    console.log(`Cache invalidé pour: ${path}`);
    // Logique d'invalidation du cache pour un chemin spécifique
    // Ici, on pourrait implémenter une logique avec localStorage ou IndexedDB si nécessaire
  },

  /**
   * Invalide le cache lié au profil utilisateur
   */
  invalidateProfileCache() {
    console.log('Cache de profil invalidé');
    // Logique d'invalidation du cache spécifique au profil
    this.invalidateCache('/profile');
    this.invalidateCache('/me');
  },

  /**
   * Invalide le cache lié aux documents
   */
  invalidateDocumentCache() {
    console.log('Cache de documents invalidé');
    // Logique d'invalidation du cache spécifique aux documents
    this.invalidateCache('/documents');
  },

  /**
   * Vide complètement le cache API
   */
  clearCache() {
    console.log('Cache API entièrement vidé');
    
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
        console.error(`Error removing key ${key}:`, e);
      }
    });
    
    // Notify the application that the cache has been cleared
    window.dispatchEvent(new Event('api-cache-cleared'));
    
    console.log('Cache API vidé');
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
  }
};

export default apiService; 