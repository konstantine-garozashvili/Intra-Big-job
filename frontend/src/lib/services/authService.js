import axios from 'axios';
import apiService from './apiService';
import { clearQueryCache } from '../utils/queryClientUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Générer un identifiant de session unique
export const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Stocker l'identifiant de session actuel
let currentSessionId = localStorage.getItem('session_id') || generateSessionId();

// Exposer l'identifiant de session pour l'utiliser dans les clés de requête
export const getSessionId = () => currentSessionId;

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
      // Obtenir l'identifiant d'appareil et les infos
      const deviceId = getOrCreateDeviceId();
      const { deviceName, deviceType } = getDeviceInfo();
      
      // Préparer les données pour la route standard JWT (/login_check)
      const loginData = {
        username: email, // Noter le champ 'username' au lieu de 'email' pour le standard JWT
        password,
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType
      };
      
      // Nettoyer les données de l'utilisateur précédent
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Générer un nouvel identifiant de session
      currentSessionId = generateSessionId();
      localStorage.setItem('session_id', currentSessionId);
      
      // Vider COMPLÈTEMENT le cache React Query pour éviter les problèmes de données persistantes
      clearQueryCache();
      
      // Utiliser directement la route standard JWT
      const response = await apiService.post('/login_check', loginData);
      
      // Stocker le token JWT dans le localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Stocker le refresh token s'il est présent
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Stocker les informations de l'utilisateur si présentes
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Déclencher un événement de mise à jour des rôles
        window.dispatchEvent(new Event('role-change'));
      } else {
        // Essayer d'extraire les informations du token JWT
        try {
          if (response.token) {
            const tokenParts = response.token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              
              if (payload.roles) {
                // Créer un objet utilisateur minimal avec les informations du token
                const minimalUser = {
                  username: payload.username,
                  roles: payload.roles
                };
                
                localStorage.setItem('user', JSON.stringify(minimalUser));
                
                // Déclencher un événement de mise à jour des rôles
                window.dispatchEvent(new Event('role-change'));
              }
            }
          }
        } catch (tokenError) {
          // Silently handle token parsing errors
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
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
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const deviceId = localStorage.getItem('device_id');
      
      // Révoquer le refresh token côté serveur
      if (refreshToken) {
        const revokeData = {
          refresh_token: refreshToken,
          device_id: deviceId
        };
        
        await apiService.post('/token/revoke', revokeData).catch((error) => {
          // Ignorer les erreurs lors de la révocation
        });
      }
    } finally {
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Générer un nouvel identifiant de session pour la prochaine connexion
      currentSessionId = generateSessionId();
      localStorage.setItem('session_id', currentSessionId);
      
      // Ne pas supprimer device_id pour maintenir l'identification de l'appareil
      
      // Vider COMPLÈTEMENT le cache React Query
      clearQueryCache();
      
      // Solution radicale: forcer un rafraîchissement complet de la page
      // Cela garantit que toutes les données de l'ancien utilisateur sont effacées
      window.location.href = '/login';
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
      // Ne pas supprimer device_id pour maintenir l'identification de l'appareil
      
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
   * @returns {Promise<Object>} - Données complètes de l'utilisateur
   */
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) {
      throw new Error('Aucun token d\'authentification trouvé');
    }

    try {
      const response = await apiService.get('/me', apiService.withAuth());
      
      // Extraire l'objet utilisateur si la réponse contient un objet "user"
      const userData = response.user || response;
      
      return userData;
    } catch (error) {
      throw error;
    }
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