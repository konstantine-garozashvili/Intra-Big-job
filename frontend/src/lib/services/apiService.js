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

/**
 * Normalise une URL d'API en gérant les doublons de "/api"
 * @param {string} path - Le chemin de l'API
 * @returns {string} - L'URL complète normalisée
 */
export const normalizeApiUrl = (path) => {
  // Pour utiliser le proxy Vite, on garde simplement le chemin /api
  // Au lieu d'utiliser l'URL complète avec le port
  
  // Si le chemin commence déjà par /api, on le renvoie tel quel
  if (path.startsWith('/api')) {
    return path;
  }
  
  // Sinon, on ajoute le préfixe /api
  return `/api${path.startsWith('/') ? '' : '/'}${path}`;
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
      const authOptions = this.withAuth({
        ...options,
        withCredentials: true,
      });
      const response = await axios.get(url, authOptions);
      return response.data;
    } catch (error) {
      console.error(`Erreur API GET ${path}:`, error);
      console.error(`[apiService] Détails de l'erreur:`, error.response || error.message);
      
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
   * Effectue une requête POST
   * @param {string} path - Chemin de l'API
   * @param {Object} data - Données à envoyer
   * @param {Object} options - Options de la requête (headers, etc.)
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async post(path, data = {}, options = {}) {
    try {
      console.log(`[apiService] POST ${path}:`, { data: { ...data, password: data.password ? '***' : undefined } });
      const url = normalizeApiUrl(path);
      const completeOptions = {
        ...options,
        withCredentials: true,
      };
      
      const authOptions = this.withAuth(completeOptions);
      const response = await axios.post(url, data, authOptions);
      return response.data;
    } catch (error) {
      console.error(
        `
        
        POST ${path} ${error.response?.status || 'error'}`,
        error
      );
      
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
      const authOptions = this.withAuth({
        ...options,
        withCredentials: true,
      });
      const response = await axios.put(url, data, authOptions);
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
  }
};

export default apiService; 