import axiosInstance from '@/lib/axios';
import axios from 'axios';

// Ajouter un cache simple pour les requêtes GET
const cache = new Map();

// Define cache keys that should never be cached or have short TTL
const CACHE_CONFIG = {
  // Never cache these endpoints (always fetch fresh data)
  neverCache: [
    '/api/profile/picture',
    '/api/documents/type/CV',
    '/api/documents/type'
  ],
  // Short TTL for these endpoints (10 seconds)
  shortTtl: [
    '/api/profile',
    '/api/documents'
  ]
};

// Function to get a session-aware cache key
const getCacheKey = (url, params = {}) => {
  const sessionId = localStorage.getItem('session_id') || 'anonymous';
  return `session_${sessionId}:${url}:${JSON.stringify(params || {})}`;
};

// Fonction pour invalider une entrée spécifique du cache
const invalidateCache = (path) => {
  const normalizedPath = normalizeApiUrl(path);
  for (const [key] of cache.entries()) {
    if (key.includes(normalizedPath)) {
      cache.delete(key);
    }
  }
};

// Fonction pour invalider le cache du profil
const invalidateProfileCache = () => {
  for (const [key] of cache.entries()) {
    if (key.includes('/profile') || key.includes('/me')) {
      cache.delete(key);
    }
  }
};

// Fonction pour invalider le cache des documents
const invalidateDocumentCache = () => {
  for (const [key] of cache.entries()) {
    if (key.includes('/documents')) {
      cache.delete(key);
    }
  }
};

// Fonction pour vider complètement le cache
const clearCache = () => {
  cache.clear();
};

// Configurer des intercepteurs pour les réponses
axiosInstance.interceptors.response.use(response => {
  // Mettre en cache les réponses GET
  if (response.config.method === 'get' && response.config.url) {
    const url = response.config.url;
    const cacheKey = getCacheKey(url, response.config.params || {});
    
    // Skip caching for endpoints that should never be cached
    const shouldNeverCache = CACHE_CONFIG.neverCache.some(endpoint => url.includes(endpoint));
    if (!shouldNeverCache) {
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
  }
  return response;
}, error => {
  return Promise.reject(error);
});

/**
 * Normalise une URL d'API en gérant les doublons de "/api"
 * @param {string} path - Le chemin de l'API
 * @returns {string} - L'URL complète normalisée
 */
export const normalizeApiUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  
  // Supprimer le "/api" à la fin de baseUrl si path commence par "/api"
  if (path.startsWith('/api')) {
    return `${baseUrl.replace(/\/api$/, '')}${path}`;
  } 
  
  // Ajouter un "/" si nécessaire
  return `${baseUrl}${baseUrl.endsWith('/') || path.startsWith('/') ? '' : '/'}${path}`;
};

// Add retry utility function at the top
const retryRequest = async (requestFn, retryCount = 0, maxRetries = 3) => {
  try {
    return await requestFn();
  } catch (error) {
    // Analyser l'erreur pour déterminer si elle est due à un timeout, une annulation ou un autre problème
    const isTimeoutError = error.code === 'ECONNABORTED' || error.message.includes('timeout');
    const isCanceledError = error.message && error.message.toLowerCase().includes('cancel');
    const isNetworkError = error.message && (
      error.message.includes('Network Error') || 
      error.message.includes('network') ||
      !error.response
    );
    
    if (retryCount < maxRetries && (isTimeoutError || isNetworkError || isCanceledError)) {
      // Delay exponentially increases with each retry
      const delay = 1000 * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(requestFn, retryCount + 1, maxRetries);
    }
    throw error;
  }
};

// Add a dedicated function for authentication
const authenticateUser = async (url, data, options = {}) => {
  // Add specific options for authentication requests
  const authOptions = {
    ...options,
    // Empêcher les annulations liées aux redirections
    maxRedirects: 0,
    // S'assurer que la requête ne soit pas annulée prématurément
    cancelToken: undefined,
    signal: undefined
  };
  
  try {
    // Utiliser directement axios au lieu de axiosInstance pour ce cas spécifique
    // cela permet d'éviter les intercepteurs qui pourraient modifier la requête
    const response = await axios.post(url, data, authOptions);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Service d'API pour gérer les appels centralisés
 */
const apiService = {
  /**
   * Effectue une requête GET
   * @param {string} path - Chemin de l'API
   * @param {Object} options - Options de la requête (headers, params, etc.)
   * @param {boolean} useCache - Utiliser le cache si disponible
   * @param {number} cacheDuration - Durée de validité du cache en ms (défaut: 5 minutes)
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async get(path, options = {}, useCache = true, cacheDuration = 5 * 60 * 1000) {
    try {
      const url = normalizeApiUrl(path);
      const authOptions = this.withAuth(options);
      
      // Si pas de token et route protégée (sauf login et register), éviter la requête
      if (!localStorage.getItem('token') && 
          !path.includes('/login_check') && 
          !path.includes('/register')) {
        return null;
      }
      
      // Check if this endpoint should never be cached
      const shouldNeverCache = CACHE_CONFIG.neverCache.some(endpoint => path.includes(endpoint));
      if (shouldNeverCache) {
        useCache = false;
      }
      
      // Check if this endpoint should have a short TTL
      const shouldHaveShortTtl = CACHE_CONFIG.shortTtl.some(endpoint => path.includes(endpoint));
      if (shouldHaveShortTtl) {
        cacheDuration = 10 * 1000; // 10 seconds
      }
      
      // Add cache busting for profile picture requests
      if (path.includes('/profile/picture')) {
        const timestamp = Date.now();
        authOptions.params = { ...authOptions.params, _t: timestamp };
      }
      
      // Vérifier si la réponse est en cache et toujours valide
      if (useCache) {
        const cacheKey = getCacheKey(url, authOptions.params || {});
        const cachedResponse = cache.get(cacheKey);
        
        if (cachedResponse && (Date.now() - cachedResponse.timestamp) < cacheDuration) {
          return cachedResponse.data;
        }
      }
      
      // Use retry mechanism for the actual request
      const response = await retryRequest(
        () => axiosInstance.get(url, authOptions)
      );
      
      return response.data;
    } catch (error) {
      // Gérer silencieusement les erreurs d'authentification pendant la déconnexion
      if (error.response?.status === 401 || error.response?.status === 403) {
        return null;
      }
      
      console.error(`Error in GET request to ${path}:`, error);
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
      
      // Pour le login_check, utiliser la fonction d'authentification spécialisée
      if (path.includes('/login_check')) {
        try {
          const response = await authenticateUser(url, data, options);
          return response.data;
        } catch (authError) {
          throw authError;
        }
      }
      
      // Pour les autres requêtes, on continue avec le traitement normal
      // Check if data is FormData
      const isFormData = data instanceof FormData;
      
      if (isFormData) {
        // Create a new options object without modifying the original
        const formDataOptions = { ...options };
        
        // Ensure headers exist
        formDataOptions.headers = formDataOptions.headers || {};
        
        // For FormData, we must NOT set Content-Type so browser can set it with boundary
        delete formDataOptions.headers['Content-Type'];
        
        // Add authentication to the request for protected routes
        const authOptions = path.includes('/login_check') || path.includes('/register') 
          ? formDataOptions 
          : this.withAuth(formDataOptions);
        
        try {
          const response = await retryRequest(
            () => axiosInstance.post(url, data, authOptions)
          );
          
          // Invalidate related caches for profile picture operations
          if (path.includes('/profile/picture')) {
            this.invalidateProfileCache();
          }
          
          return response.data;
        } catch (requestError) {
          throw requestError;
        }
      } else {
        // For regular JSON data
        // Add authentication to the request for protected routes
        const authOptions = path.includes('/login_check') || path.includes('/register') 
          ? options 
          : this.withAuth(options);
        
        try {
          const response = await retryRequest(
            () => axiosInstance.post(url, data, authOptions)
          );
          
          // Invalidate related caches for profile operations
          if (path.includes('/profile')) {
            this.invalidateProfileCache();
          }
          
          return response.data;
        } catch (requestError) {
          throw requestError;
        }
      }
    } catch (error) {
      console.error(`Error in POST request to ${path}:`, error);
      throw error;
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
      const authOptions = this.withAuth(options);
      
      const response = await retryRequest(
        () => axiosInstance.put(url, data, authOptions)
      );
      
      // Invalidate related caches for profile operations
      if (path.includes('/profile')) {
        this.invalidateProfileCache();
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error in PUT request to ${path}:`, error);
      throw error;
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
      const url = normalizeApiUrl(path);
      const authOptions = this.withAuth(options);
      
      // Add cache busting for profile picture requests
      if (path.includes('/profile/picture')) {
        const timestamp = Date.now();
        if (!options.params) options.params = {};
        options.params._t = timestamp;
      }
      
      // Use retry mechanism for the actual request
      const response = await retryRequest(
        () => axiosInstance.delete(url, {
          headers: authOptions.headers,
          params: options.params,
          data: options.data
        })
      );
      
      // Invalidate related caches for profile picture operations
      if (path.includes('/profile/picture')) {
        this.invalidateProfileCache();
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error in DELETE request to ${path}:`, error);
      throw error;
    }
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
    
    // Create a new options object to avoid modifying the original
    const newOptions = { ...options };
    
    // Ensure headers exist (avec vérification)
    newOptions.headers = { ...(options.headers || {}) };
    
    // Add Authorization header
    newOptions.headers.Authorization = `Bearer ${token}`;
    
    return newOptions;
  },
  
  // Ajouter les nouvelles méthodes de gestion du cache
  invalidateCache,
  invalidateProfileCache,
  invalidateDocumentCache,
  clearCache,
  
  /**
   * Vérifie si l'entrée de cache est toujours valide
   * @param {string} cacheKey - Clé de cache
   * @param {number} cacheDuration - Durée de validité du cache
   * @returns {boolean} - True si l'entrée est valide
   */
  isCacheValid(cacheKey, cacheDuration) {
    const cachedResponse = cache.get(cacheKey);
    return cachedResponse && (Date.now() - cachedResponse.timestamp) < cacheDuration;
  }
};

export default apiService; 