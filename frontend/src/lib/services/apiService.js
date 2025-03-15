import axios from 'axios';

// Créer une instance axios avec des configurations par défaut
const axiosInstance = axios.create({
  timeout: 8000, // Réduit de 15000ms à 8000ms
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Configurer des intercepteurs pour les requêtes et réponses
axiosInstance.interceptors.request.use(request => {
  // Ajouter le token d'authentification à toutes les requêtes si disponible
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
}, error => {
  return Promise.reject(error);
});

// Ajouter un cache simple pour les requêtes GET
const cache = new Map();

axiosInstance.interceptors.response.use(response => {
  // Mettre en cache les réponses GET
  if (response.config.method === 'get' && response.config.url) {
    const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
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
      
      // Vérifier si la réponse est en cache et toujours valide
      if (useCache) {
        const cacheKey = url + JSON.stringify(authOptions.params || {});
        const cachedResponse = cache.get(cacheKey);
        
        if (cachedResponse && (Date.now() - cachedResponse.timestamp) < cacheDuration) {
          return cachedResponse.data;
        }
      }
      
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
      // Add authentication to the request for protected routes
      const authOptions = path.includes('/login_check') || path.includes('/register') ? options : this.withAuth(options);
      const response = await axiosInstance.post(url, data, authOptions);
      return response.data;
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
      const response = await axiosInstance.delete(normalizeApiUrl(path), authOptions);
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
    
    return {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    };
  },
  
  /**
   * Vide le cache
   */
  clearCache() {
    cache.clear();
  },
  
  /**
   * Supprime une entrée spécifique du cache
   * @param {string} path - Chemin de l'API
   * @param {Object} params - Paramètres de la requête
   */
  invalidateCache(path, params = {}) {
    const url = normalizeApiUrl(path);
    const cacheKey = url + JSON.stringify(params);
    cache.delete(cacheKey);
  }
};

export default apiService; 