import axios from 'axios';

// Créer une instance axios avec des configurations par défaut
const axiosInstance = axios.create({
  timeout: 8000, // Réduit de 15000ms à 8000ms
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
    // Remove default Content-Type header to allow axios to set it correctly for FormData
  }
});

// Configurer des intercepteurs pour les requêtes et réponses
axiosInstance.interceptors.request.use(request => {
  // Ajouter le token d'authentification à toutes les requêtes si disponible
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  
  // Set Content-Type only for non-FormData requests
  if (request.data && !(request.data instanceof FormData)) {
    request.headers['Content-Type'] = 'application/json';
  }
  
  return request;
}, error => {
  return Promise.reject(error);
});

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
  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  
  // Supprimer le "/api" à la fin de baseUrl si path commence par "/api"
  if (path.startsWith('/api')) {
    return `${baseUrl.replace(/\/api$/, '')}${path}`;
  } 
  
  // Ajouter un "/" si nécessaire
  return `${baseUrl}${baseUrl.endsWith('/') || path.startsWith('/') ? '' : '/'}${path}`;
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
      
      // Si pas en cache ou cache expiré, faire la requête
      const response = await axiosInstance.get(url, authOptions);
      return response.data;
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
        
        const response = await axiosInstance.post(url, data, authOptions);
        
        // Invalidate related caches for profile picture operations
        if (path.includes('/profile/picture')) {
          this.invalidateProfileCache();
        }
        
        return response.data;
      } else {
        // For regular JSON data
        // Add authentication to the request for protected routes
        const authOptions = path.includes('/login_check') || path.includes('/register') 
          ? options 
          : this.withAuth(options);
        
        const response = await axiosInstance.post(url, data, authOptions);
        
        // Invalidate related caches for profile operations
        if (path.includes('/profile')) {
          this.invalidateProfileCache();
        }
        
        return response.data;
      }
    } catch (error) {
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
      // Add authentication to the request
      const authOptions = this.withAuth(options);
      const response = await axiosInstance.put(normalizeApiUrl(path), data, authOptions);
      
      // Invalidate related caches for profile operations
      if (path.includes('/profile')) {
        this.invalidateProfileCache();
      }
      
      return response.data;
    } catch (error) {
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
      // Add authentication to the request
      const authOptions = this.withAuth(options);
      
      // Add cache busting for profile picture requests
      if (path.includes('/profile/picture')) {
        const timestamp = Date.now();
        if (!options.params) options.params = {};
        options.params._t = timestamp;
      }
      
      // Pour Axios delete, le second paramètre doit être un objet de configuration
      // avec une propriété 'headers'
      const response = await axiosInstance.delete(normalizeApiUrl(path), {
        headers: authOptions.headers,
        params: options.params,
        data: options.data // Si vous avez besoin d'envoyer des données dans le corps
      });
      
      // Invalidate related caches for profile picture operations
      if (path.includes('/profile/picture')) {
        this.invalidateProfileCache();
      }
      
      return response.data;
    } catch (error) {
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
  
  /**
   * Vide le cache
   */
  clearCache() {
    // Just clear everything - safer and simpler
    cache.clear();
  },
  
  /**
   * Supprime une entrée spécifique du cache
   * @param {string} path - Chemin de l'API
   * @param {Object} params - Paramètres de la requête
   */
  invalidateCache(path, params = {}) {
    const url = normalizeApiUrl(path);
    const cacheKey = getCacheKey(url, params);
    cache.delete(cacheKey);
  },
  
  /**
   * Invalide toutes les entrées du cache liées au profil
   */
  invalidateProfileCache() {
    // Get all cache keys
    const keys = Array.from(cache.keys());
    
    // Filter keys related to profile
    const profileKeys = keys.filter(key => 
      key.includes('/profile') || 
      key.includes('/profil')
    );
    
    // Delete all profile-related cache entries
    profileKeys.forEach(key => cache.delete(key));
  },
  
  /**
   * Invalide toutes les entrées du cache liées aux documents
   */
  invalidateDocumentCache() {
    // Get all cache keys
    const keys = Array.from(cache.keys());
    
    // Filter keys related to documents
    const documentKeys = keys.filter(key => 
      key.includes('/documents') || 
      key.includes('/document')
    );
    
    // Delete all document-related cache entries
    documentKeys.forEach(key => cache.delete(key));
  },
  
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