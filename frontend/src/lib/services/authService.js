import axios from 'axios';
import apiService from './apiService';
import { clearQueryCache, getQueryClient } from '../utils/queryClientUtils';
import { showGlobalLoader, hideGlobalLoader } from '../utils/loadingUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Générer un identifiant de session unique
export const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Stocker l'identifiant de session actuel
let currentSessionId = localStorage.getItem('session_id') || generateSessionId();

// Exposer l'identifiant de session pour l'utiliser dans les clés de requête
export const getSessionId = () => currentSessionId;

// Lazy loading des informations utilisateur
let userDataPromise = null;

/**
 * Service pour l'authentification et la gestion des utilisateurs
 */
export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async register(userData) {
    try {
      const response = await apiService.post('/register', userData);
      
      // Si la réponse contient un token (certaines API peuvent fournir un token immédiatement)
      if (response && response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Retourner une réponse formatée avec un status 201 si l'API ne renvoie pas de statut
      return {
        status: response.status || 201,
        data: response
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Connexion d'un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} - Réponse de l'API avec token JWT
   */
  async login(email, password) {
    try {
      // Vider le cache existant de manière sélective avant la connexion
      // Ne supprimer que les caches pertinents pour l'authentification
      const queryClient = getQueryClient();
      if (queryClient) {
        queryClient.removeQueries({ queryKey: ['user'] });
        queryClient.removeQueries({ queryKey: ['profile'] });
      }
      
      // Obtain device ID and info
      const deviceId = getOrCreateDeviceId();
      const { deviceName, deviceType } = getDeviceInfo();
      
      // Prepare data for the standard JWT route (/login_check)
      const loginData = {
        username: email, // Note the field 'username' instead of 'email' for JWT standard
        password,
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType
      };
      
      // Clean up previous user data
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Generate a new session ID
      currentSessionId = generateSessionId();
      localStorage.setItem('session_id', currentSessionId);
      
      // Use JWT standard route directly
      const response = await apiService.post('/login_check', loginData);
      
      // Store JWT token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Store refresh token if present
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Extract detailed info from JWT token for immediate use
      if (response.token) {
        try {
          const tokenParts = response.token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            
            if (payload.roles) {
              // Create enhanced user object with token information
              const enhancedUser = {
                username: payload.username,
                roles: payload.roles,
                // Extract additional information if available
                id: payload.id,
                email: payload.username,
                firstName: payload.firstName,
                lastName: payload.lastName,
                // Add token extraction timestamp for tracking freshness
                _extractedAt: Date.now()
              };
              
              localStorage.setItem('user', JSON.stringify(enhancedUser));
              
              // Pre-populate cache with this minimal data to speed up initial rendering
              if (queryClient) {
                queryClient.setQueryData(['user', 'current'], enhancedUser);
              }
              
              // Trigger role update event
              window.dispatchEvent(new Event('role-change'));
            }
          }
        } catch (tokenError) {
          // Silently handle token parsing errors
          console.error('Error parsing token:', tokenError);
        }
      }
      
      // Initialize background loading of user data
      // but don't wait for resolution
      this.lazyLoadUserData();
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Charge les données utilisateur en arrière-plan
   * @returns {Promise<Object>} - Données de l'utilisateur
   */
  lazyLoadUserData() {
    // Si une promesse existe déjà, la retourner
    if (userDataPromise) return userDataPromise;
    
    // Créer une promesse avec timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('User data fetch timeout'));
      }, 1500); // Réduit de 3000ms à 1500ms pour accélérer le chargement
    });
    
    // Sinon, créer une nouvelle promesse
    const fetchPromise = this.getCurrentUser()
      .then(userData => {
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('user-data-loaded'));
        return userData;
      });
    
    // Race between fetch and timeout
    userDataPromise = Promise.race([fetchPromise, timeoutPromise])
      .catch(error => {
        userDataPromise = null; // Réinitialiser en cas d'erreur
        
        // Even if we timeout, dispatch the event to unblock UI
        window.dispatchEvent(new Event('user-data-loaded'));
        
        // Try to extract more detailed user data from token as fallback
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              if (payload.username) {
                const minimalUser = {
                  username: payload.username,
                  roles: payload.roles || [],
                  // Extract additional data if available in token
                  id: payload.id,
                  email: payload.username,
                  firstName: payload.firstName,
                  lastName: payload.lastName
                };
                return minimalUser;
              }
            }
          }
        } catch (tokenError) {
          // Silent fail for token parsing
        }
        
        throw error;
      });
    
    return userDataPromise;
  },

  /**
   * Rafraîchir le token JWT
   * @returns {Promise<Object>} - Nouveau token JWT
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const deviceId = localStorage.getItem('device_id');
      const { deviceName, deviceType } = getDeviceInfo();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const refreshData = {
        refresh_token: refreshToken,
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType
      };
      
      const response = await apiService.post('/token/refresh', refreshData);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      return response;
    } catch (error) {
      // Si le refresh token est invalide, déconnecter l'utilisateur
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        this.logout();
      }
      throw error;
    }
  },
  
  /**
   * Déconnexion
   * @param {string} [redirectTo='/'] - Chemin de redirection après la déconnexion
   * @returns {Promise<boolean>} - True si la déconnexion est réussie
   */
  async logout(redirectTo = '/') {
    try {
      // Show global loading state
      showGlobalLoader();
      
      // Récupérer l'ID de session avant de supprimer les données du localStorage
      const sessionId = currentSessionId;
      
      // Supprimer d'abord les données d'authentification du localStorage
      // pour éviter des requêtes authentifiées après la déconnexion
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiration');
      
      // Tenter de faire un appel API pour invalider le token côté serveur
      if (this.isLoggedIn()) {
        try {
          await apiService.post('/api/auth/logout');
        } catch (logoutApiError) {
          // Ignorer les erreurs d'API lors de la déconnexion
        }
      }
      
      // Étape 1: Optimisé - Vider seulement les requêtes spécifiques à l'utilisateur
      try {
        // Obtenir le client de query pour des opérations ciblées
        const queryClient = getQueryClient();
        if (queryClient) {
          // Supprimer uniquement les requêtes liées à l'utilisateur
          queryClient.removeQueries({ queryKey: ['user'] });
          queryClient.removeQueries({ queryKey: ['profile'] });
          queryClient.removeQueries({ queryKey: ['dashboard'] });
          queryClient.removeQueries({ queryKey: ['notifications'] });
          
          // Supprimer les requêtes de la session actuelle en utilisant le pattern de préfixe
          queryClient.removeQueries({
            predicate: (query) => {
              const key = query.queryKey;
              return Array.isArray(key) && key[0] === 'session' && key[1] === sessionId;
            }
          });
          
          // Annuler aussi toutes les requêtes en cours
          queryClient.cancelQueries({
            predicate: (query) => {
              const key = query.queryKey;
              return Array.isArray(key) && key[0] === 'session' && key[1] === sessionId;
            }
          });
        }
      } catch (cacheError) {
        console.error('Error clearing query cache:', cacheError);
      }
      
      // Étape 2: Vider le cache du service API de manière sélective
      try {
        // Vider seulement les caches liés au profile et authentification
        apiService.invalidateProfileCache();
        
        // Supprimer explicitement les entrées de cache liées à l'authentification
        const authCacheKeys = ['/me', '/profile', '/dashboard'];
        authCacheKeys.forEach(path => apiService.invalidateCache(path));
      } catch (apiCacheError) {
        console.error('Error clearing API cache:', apiCacheError);
      }
      
      // Générer un nouvel identifiant de session pour la prochaine connexion
      currentSessionId = generateSessionId();
      localStorage.setItem('session_id', currentSessionId);
      
      // Déclencher un événement pour informer l'application de la déconnexion
      // Utiliser CustomEvent pour passer des données supplémentaires
      window.dispatchEvent(new CustomEvent('logout-success', {
        detail: { redirectTo }
      }));
      
      // Pour la compatibilité avec d'anciens écouteurs
      window.dispatchEvent(new Event('auth-logout-success'));
      
      // Remove loading state after a short delay
      hideGlobalLoader(300);
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Même en cas d'erreur, on force la déconnexion côté client
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiration');
      
      // Générer un nouvel identifiant de session
      currentSessionId = generateSessionId();
      localStorage.setItem('session_id', currentSessionId);
      
      // Émettre quand même les événements de déconnexion
      window.dispatchEvent(new CustomEvent('logout-success', {
        detail: { redirectTo }
      }));
      window.dispatchEvent(new Event('auth-logout-success'));
      
      // Remove loading state on error
      hideGlobalLoader();
      
      return false;
    }
  },
  
  /**
   * Déconnexion de tous les appareils
   */
  async logoutAllDevices() {
    try {
      await apiService.post('/token/revoke-all');
      
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Réinitialiser la promesse de chargement des données utilisateur
      userDataPromise = null;
      
      // Vider le cache React Query
      clearQueryCache();
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Récupérer la liste des appareils connectés
   */
  async getDevices() {
    try {
      const devices = await apiService.get('/token/devices');
      return devices;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère le token JWT stocké
   * @returns {string|null} - Token JWT ou null
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Récupère les informations de l'utilisateur connecté
   * @returns {Object|null} - Informations de l'utilisateur ou null
   */
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {boolean} - True si connecté
   */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * Récupère les informations complètes de l'utilisateur connecté depuis l'API
   * @param {boolean} [forceRefresh=false] - Force le rafraîchissement des données depuis l'API
   * @returns {Promise<Object>} - Données complètes de l'utilisateur
   */
  async getCurrentUser(forceRefresh = false) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Aucun token d\'authentification trouvé');
    }

    // Si une promesse est déjà en cours et qu'on ne force pas le rafraîchissement, on la retourne
    if (userDataPromise && !forceRefresh) {
      return userDataPromise;
    }

    // Créer une nouvelle promesse pour charger les données utilisateur
    userDataPromise = new Promise(async (resolve, reject) => {
      try {
        // Utiliser le cache sauf si on force le rafraîchissement
        const options = forceRefresh ? { cache: 'no-store' } : {};
        const response = await apiService.get('/me', { ...apiService.withAuth(), ...options });
        
        // Extraire l'objet utilisateur si la réponse contient un objet "user"
        const userData = response.user || response;
        
        // Stocker les données utilisateur dans le localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Stocker le rôle principal pour référence
        if (userData.roles && userData.roles.length > 0) {
          localStorage.setItem('last_role', userData.roles[0]);
        }
        
        resolve(userData);
      } catch (error) {
        userDataPromise = null; // Réinitialiser la promesse en cas d'erreur
        reject(error);
      }
    });

    return userDataPromise;
  },
  
  /**
   * Change le mot de passe de l'utilisateur connecté
   * @param {Object} passwordData - Données de changement de mot de passe
   * @param {string} passwordData.currentPassword - Mot de passe actuel
   * @param {string} passwordData.newPassword - Nouveau mot de passe
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async changePassword(passwordData) {
    try {
      const response = await apiService.post('/change-password', passwordData, apiService.withAuth());
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Méthode pour déclencher manuellement une mise à jour des rôles
  triggerRoleUpdate: () => {
    triggerRoleUpdate();
  }
};

// Générer ou récupérer un identifiant unique pour l'appareil
function getOrCreateDeviceId() {
  // Vérifier si un deviceId existe déjà dans le localStorage
  let deviceId = localStorage.getItem('device_id');
  
  // Si non, en créer un nouveau
  if (!deviceId) {
    // Générer un identifiant unique (UUID v4)
    deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('device_id', deviceId);
  }
  
  return deviceId;
}

// Obtenir des informations de base sur l'appareil
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let deviceType = 'unknown';
  let deviceName = 'Browser';
  
  // Détection simple du type d'appareil
  if (/Android/i.test(userAgent)) {
    deviceType = 'mobile';
    deviceName = 'Android Device';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    deviceType = 'mobile';
    deviceName = 'iOS Device';
  } else if (/Windows/i.test(userAgent)) {
    deviceType = 'desktop';
    deviceName = 'Windows PC';
  } else if (/Macintosh/i.test(userAgent)) {
    deviceType = 'desktop';
    deviceName = 'Mac';
  } else if (/Linux/i.test(userAgent)) {
    deviceType = 'desktop';
    deviceName = 'Linux';
  }
  
  return {
    deviceType,
    deviceName
  };
}

// Fonction pour déclencher manuellement une mise à jour des rôles
export const triggerRoleUpdate = () => {
  window.dispatchEvent(new Event('role-change'));
};

export default authService; 