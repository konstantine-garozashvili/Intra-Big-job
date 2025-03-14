import axios from 'axios';

// Configurer des intercepteurs pour les requêtes et réponses
axios.interceptors.request.use(request => {
  // Ajouter le token d'authentification à toutes les requêtes si disponible
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
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
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async get(path, options = {}) {
    try {
      const url = normalizeApiUrl(path);
      const authOptions = this.withAuth(options);
      const response = await axios.get(url, authOptions);
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
      const response = await axios.post(url, data, authOptions);
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
      const response = await axios.put(normalizeApiUrl(path), data, authOptions);
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
      const response = await axios.delete(normalizeApiUrl(path), authOptions);
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
  }
};

export default apiService; 