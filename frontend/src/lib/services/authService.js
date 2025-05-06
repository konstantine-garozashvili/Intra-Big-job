// frontend/src/lib/services/authService.js
import axiosInstance from '@/lib/axios';
import apiService from './apiService';
import { clearQueryCache, getQueryClient } from '../utils/queryClientUtils';
import { showGlobalLoader, hideGlobalLoader } from '../utils/loadingUtils';
import { toast } from 'sonner';
import userDataManager from './userDataManager';
import { getOrCreateDeviceId, getDeviceInfo } from '../utils/deviceUtils';
import { decodeToken } from '../utils/tokenUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Session management
let currentSessionId = localStorage.getItem('session_id') || 
  Date.now().toString(36) + Math.random().toString(36).substring(2);
export const getSessionId = () => currentSessionId;

// Call tracking
const getCurrentUserState = {
  lastCallTime: 0,
  minInterval: 2000,
  callStack: [],
  stackLimit: 3,
  currentPromise: null,
};

export const authService = {
  async register(userData) {
    try {
      console.log('[authService] Début de l\'inscription:', { ...userData, password: '***' });
      const response = await apiService.post('/register', userData);
      if (response?.token) localStorage.setItem('token', response.token);
      return { status: response.status || 201, data: response };
    } catch (error) {
      console.error('[authService] Erreur lors de l\'inscription:', error);
      console.error('[authService] Détails:', error.response?.data || error.message);
      throw error;
    }
  },

  async login(email, password) {
    try {
      const queryClient = getQueryClient();
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
      
      sessionStorage.setItem('login_in_progress', 'true');
      const deviceId = getOrCreateDeviceId();
      const { deviceName, deviceType } = getDeviceInfo();
      
      localStorage.clear();
      currentSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      localStorage.setItem('session_id', currentSessionId);
      showGlobalLoader();
      
      const response = await apiService.post('/login_check', {
        username: email,
        password,
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        const payload = decodeToken(response.token);
        if (payload?.roles) {
          const enhancedUser = {
            username: payload.username,
            roles: payload.roles,
            id: payload.id,
            email: payload.username,
            firstName: payload.firstName,
            lastName: payload.lastName,
            _extractedAt: Date.now(),
            _minimal: true
          };
          localStorage.setItem('user', JSON.stringify(enhancedUser));
          localStorage.setItem('userRoles', JSON.stringify(payload.roles));
          if (queryClient) queryClient.setQueryData(['user', 'current'], enhancedUser);
          document.dispatchEvent(new CustomEvent('auth:minimal-data-ready', { detail: { user: enhancedUser } }));
        }
      }
      
      if (response.refresh_token) localStorage.setItem('refresh_token', response.refresh_token);
      
      // Immediately fetch the latest user info and roles from the backend
      await this.getCurrentUser(true, { requestSource: 'login' });
      
      hideGlobalLoader();
      window.dispatchEvent(new Event('login-success'));
      window.dispatchEvent(new Event('auth-state-change'));
      
      this.lazyLoadUserData(true).catch(() => {});
      
      // Hide loader after successful login
      hideGlobalLoader();
      
      // Remove login in progress flag
      sessionStorage.removeItem('login_in_progress');
      
      return response.data;
    } catch (error) {
      sessionStorage.removeItem('login_in_progress');
      hideGlobalLoader();
      throw error;
    }
  },

  async lazyLoadUserData(isInitialLoad = false) {
    const cachedUser = this.getUser();
    if (!cachedUser) return null;
    
    try {
      const profileResult = await this._loadProfileData();
      let enhancedUser = cachedUser;
      
      if (profileResult) {
        enhancedUser = profileResult;
        localStorage.setItem('user', JSON.stringify(enhancedUser));
        
        const queryClient = getQueryClient();
        if (queryClient) {
          const sessionId = getSessionId();
          queryClient.setQueryData(['user', 'current'], enhancedUser);
          queryClient.setQueryData(['unified-user-data', '/api/me', sessionId], enhancedUser);
          queryClient.setQueryData(['user-data', enhancedUser?.id || 'anonymous', sessionId], enhancedUser);
        }
      }
      
      sessionStorage.removeItem('login_in_progress');
      document.dispatchEvent(new CustomEvent('user:data-updated', { detail: { user: enhancedUser } }));
      window.dispatchEvent(new Event('user-data-loaded'));
      
      return enhancedUser;
    } catch (error) {
      sessionStorage.removeItem('login_in_progress');
      window.dispatchEvent(new Event('user-data-loaded'));
      return cachedUser;
    }
  },

  async _loadProfileData() {
    if (!this.isLoggedIn()) return null;
    
    try {
      const response = await apiService.get('/api/me', { noCache: true, timeout: 10000, retries: 1 });
      const userData = response.user || response.data?.user || response.success ? response.user : response;
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');
      
      const { deviceName, deviceType } = getDeviceInfo();
      const response = await apiService.post('/token/refresh', {
        refresh_token: refreshToken,
        device_id: localStorage.getItem('device_id'),
        device_name: deviceName,
        device_type: deviceType
      });
      
      if (response.token) localStorage.setItem('token', response.token);
      if (response.refresh_token) localStorage.setItem('refresh_token', response.refresh_token);
      
      return response;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) this.logout();
      throw error;
    }
  },

  async logout(redirectTo = '/login') {
    try {
      window.__isLoggingOut = true;
      window.__isNavigating = true;
      showGlobalLoader();
      
      localStorage.clear();
      sessionStorage.clear();
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await apiService.post('/token/revoke', {
            refresh_token: refreshToken,
            device_id: localStorage.getItem('device_id')
          }).catch(() => {});
        }
      } catch (error) {}
      
      try {
        const queryClient = getQueryClient();
        if (queryClient) {
          queryClient.cancelQueries();
          queryClient.removeQueries();
          clearQueryCache();
        }
        apiService.clearCache();
      } catch (error) {}
      
      currentSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      window.dispatchEvent(new CustomEvent('logout-success', { detail: { redirectTo } }));
      window.dispatchEvent(new Event('auth-state-change'));
      
      setTimeout(() => window.location.replace(redirectTo || '/login'), 10);
      return true;
    } catch (error) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/login');
      return false;
    }
  },

  async logoutAllDevices() {
    try {
      await apiService.post('/token/revoke-all');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      userDataPromise = null;
      clearQueryCache();
    } catch (error) {
      console.error('Erreur lors de la déconnexion de tous les appareils:', error);
      console.error('Détails:', error.response?.data || error.message);
      throw error;
    }
  },

  async getDevices() {
    try {
      return await apiService.get('/token/devices');
    } catch (error) {
      console.error('Erreur lors de la récupération des appareils:', error);
      console.error('Détails:', error.response?.data || error.message);
      throw error;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isLoggedIn() {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decodedToken = decodeToken(token);
      return decodedToken && decodedToken.exp > Date.now() / 1000;
    } catch (error) {
      return false;
    }
  },

  isAuthenticated() {
    return this.isLoggedIn();
  },

  hasRole(role) {
    const user = this.getUser();
    if (!user) return false;
    
    const userRoles = Array.isArray(user.roles) ? user.roles :
      typeof user.roles === 'object' ? Object.values(user.roles) :
      user.role ? (Array.isArray(user.role) ? user.role : [user.role]) : [];
    
    const searchRole = role.toUpperCase().startsWith('ROLE_') ? role.toUpperCase() : `ROLE_${role.toUpperCase()}`;
    
    return userRoles.some(userRole => {
      if (typeof userRole === 'string') {
        const normalizedUserRole = userRole.toUpperCase().startsWith('ROLE_') ? 
          userRole.toUpperCase() : `ROLE_${userRole.toUpperCase()}`;
        return normalizedUserRole === searchRole;
      }
      
      if (typeof userRole === 'object' && userRole !== null) {
        const roleName = userRole.name || userRole.role || userRole.roleName || '';
        const normalizedRoleName = roleName.toUpperCase().startsWith('ROLE_') ? 
          roleName.toUpperCase() : `ROLE_${roleName.toUpperCase()}`;
        return normalizedRoleName === searchRole;
      }
      
      return false;
    });
  },

  async getCurrentUser(forceRefresh = false, options = {}) {
    const { requestSource = 'unknown' } = options;
    const token = this.getToken();
    if (!token) throw new Error('Aucun token d\'authentification trouvé');

    const callerId = `auth_service_${requestSource}_${Date.now()}`;
    getCurrentUserState.callStack.push(callerId);
    
    if (getCurrentUserState.callStack.length > getCurrentUserState.stackLimit) {
      console.warn(`Detected recursive calls to getCurrentUser. Call stack:`, getCurrentUserState.callStack);
      getCurrentUserState.callStack = [];
      const cachedUser = userDataManager.getCachedUserData();
      if (cachedUser) return cachedUser;
    }
    
    const now = Date.now();
    if (!forceRefresh && (now - getCurrentUserState.lastCallTime) < getCurrentUserState.minInterval) {
      const cachedUser = userDataManager.getCachedUserData();
      if (cachedUser) {
        getCurrentUserState.callStack = getCurrentUserState.callStack.filter(id => id !== callerId);
        return cachedUser;
      }
    }
    
    getCurrentUserState.lastCallTime = now;

    // Ajouter du contexte de débogage pour tracer l'origine des appels
    console.log(`🔍 getCurrentUser appelé depuis: ${requestSource || 'non spécifié'} (force=${forceRefresh})`);

    // Utiliser le nouveau gestionnaire de données utilisateur
    try {
      const userData = await userDataManager.getUserData({
        forceRefresh,
        routeKey: '/api/me',
        requestId: callerId,
        preventRecursion: options?.preventRecursion || false
      });
      
      if (userData.roles?.length > 0) {
        localStorage.setItem('last_role', userData.roles[0]);
        localStorage.setItem('userRoles', JSON.stringify(userData.roles));
      }
      
      return userData;
    } catch (error) {
      const cachedUser = userDataManager.getCachedUserData();
      if (cachedUser) return cachedUser;
      throw error;
    } finally {
      getCurrentUserState.callStack = getCurrentUserState.callStack.filter(id => id !== callerId);
    }
  },

  async changePassword(passwordData) {
    try {
      return await apiService.post('/api/change-password', passwordData, apiService.withAuth());
    } catch (error) {
      throw error;
    }
  },

  clearAuthData(showNotification = true, message = 'Vous avez été déconnecté.') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    
    if (showNotification) {
      toast.success(message, { duration: 3000, position: 'top-center' });
    }
    
    window.location.href = '/login';
  },

  triggerRoleUpdate: () => {
    window.dispatchEvent(new Event('role-change'));
    triggerRoleUpdate();
  },

  async ensureUserDataInLocalStorage() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const isSignaturePage = window.location.pathname.includes('/student/attendance');
      let userData = null;
      
      try {
        userData = await authService.getCurrentUser(true);
      } catch (err) {}
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        let roles = userData.roles;
        if (isSignaturePage && !roles.includes('ROLE_STUDENT')) {
          roles.push('ROLE_STUDENT');
        }
        localStorage.setItem('userRoles', JSON.stringify(roles));
        return true;
      }
      
      if (!localStorage.getItem('user')) {
        const minimalUser = {
          id: '1',
          email: 'student@example.com',
          firstName: 'Test',
          lastName: 'Student',
          roles: ['ROLE_STUDENT']
        };
        localStorage.setItem('user', JSON.stringify(minimalUser));
      }
      
      if (!localStorage.getItem('userRoles') || isSignaturePage) {
        localStorage.setItem('userRoles', JSON.stringify(['ROLE_STUDENT']));
      }
      
      return true;
    } catch (error) {
      return false;
    }
  },

  async fixProfileDataIssues() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, message: 'Not authenticated' };
      
      const queryClient = getQueryClient();
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
      
      try {
        const userData = await apiService.get('/api/profile', {
          noCache: true,
          retries: 2,
          timeout: 10000
        });
        
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          if (queryClient) {
            queryClient.setQueryData(['user', 'current'], userData);
          }
          return { success: true, message: 'Profile data fixed successfully' };
        }
      } catch (apiError) {}
      
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = decodeToken(token);
          if (decodedToken) {
            const minimalUser = {
              id: decodedToken.id || '1',
              email: decodedToken.username || 'user@example.com',
              roles: decodedToken.roles || ['ROLE_USER'],
              _fixedAt: Date.now()
            };
            
            localStorage.setItem('user', JSON.stringify(minimalUser));
            localStorage.setItem('userRoles', JSON.stringify(minimalUser.roles));
            
            return { success: true, message: 'Created minimal profile data' };
          }
        }
      } catch (tokenError) {}
      
      return { success: false, message: 'Could not fix profile data' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getMinimalUserData() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const userData = JSON.parse(userStr);
      if (!userData || (!userData.firstName && !userData.lastName)) return null;
      
      return {
        ...userData,
        _source: 'localStorage',
        _retrievedAt: Date.now()
      };
    } catch (error) {
      return null;
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
      const response = await apiService.post('/api/change-password', passwordData, apiService.withAuth());
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Nettoie toutes les données d'authentification et redirige vers la page de connexion
   * @param {boolean} showNotification - Indique si une notification doit être affichée
   * @param {string} message - Message personnalisé à afficher dans la notification
   */
  clearAuthData(showNotification = true, message = 'Vous avez été déconnecté.') {
    // Supprimer toutes les données d'authentification du localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    
    // Afficher une notification si demandé
    if (showNotification) {
      toast.success(message, {
        duration: 3000,
        position: 'top-center',
      });
    }
    
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  },

  // Méthode pour déclencher manuellement une mise à jour des rôles
  triggerRoleUpdate: () => {
    window.dispatchEvent(new Event('role-change'));
    triggerRoleUpdate();
  },

  /**
   * Ensures that all necessary user data is saved to localStorage
   * Call this when encountering issues with missing data
   */
  ensureUserDataInLocalStorage: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Cannot ensure user data - no token found');
        return false;
      }
      
      // Check if the current page is the signature page
      const isSignaturePage = window.location.pathname.includes('/student/attendance');
      
      // Get user data from API
      let userData = null;
      try {
        // First try to get from the basic me endpoint
        userData = await authService.getCurrentUser(true);
      } catch (err) {
        console.warn('Failed to get user data from /me endpoint, trying backup methods');
      }
      
      // If we have user data, save it
      if (userData) {
        // Store the actual user data
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Ensure roles are stored
        if (userData.roles && Array.isArray(userData.roles)) {
          // If this is the signature page, ensure STUDENT role is included
          let roles = userData.roles;
          if (isSignaturePage && !roles.includes('ROLE_STUDENT')) {
            roles.push('ROLE_STUDENT'); // Add student role for signature page
          }
          localStorage.setItem('userRoles', JSON.stringify(roles));
        } else {
          // If no roles in response, set default student role for testing
          localStorage.setItem('userRoles', JSON.stringify(['ROLE_STUDENT']));
        }
        
        console.log('Successfully ensured user data in localStorage', {
          userData, 
          roles: JSON.parse(localStorage.getItem('userRoles') || '[]')
        });
        return true;
      }
      
      // If we still don't have user data, create minimal data
      // Based on data from token
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = decodeToken(token);
          if (decodedToken) {
            const minimalUser = {
              id: decodedToken.id || '1',
              email: decodedToken.username || 'user@example.com',
              roles: decodedToken.roles || ['ROLE_USER'],
              _fixedAt: Date.now()
            };
            
            localStorage.setItem('user', JSON.stringify(minimalUser));
            
            console.log('Created minimal user data from token');
            return true;
          }
        }
      } catch (tokenError) {
        console.error('Error creating fallback user data:', tokenError);
      }
      
      // Ensure roles exist - default to student role
      // For signature page, make sure student role is always included
      if (!localStorage.getItem('userRoles') || isSignaturePage) {
        localStorage.setItem('userRoles', JSON.stringify(['ROLE_STUDENT']));
      }
      
      console.log('Created fallback user data in localStorage', {
        user: JSON.parse(localStorage.getItem('user') || '{}'),
        roles: JSON.parse(localStorage.getItem('userRoles') || '[]')
      });
      
      return true;
    } catch (error) {
      console.error('Error ensuring user data:', error);
      return false;
    }
  },

  /**
   * Récupère les données minimales de l'utilisateur à partir du localStorage
   * Utilisé comme fallback lorsque les appels API échouent
   * @returns {Object|null} - Données minimales utilisateur ou null
   */
  getMinimalUserData() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const userData = JSON.parse(userStr);
      
      // Vérifier que les données minimales requises sont présentes
      if (!userData || (!userData.firstName && !userData.lastName)) {
        return null;
      }
      
      return {
        ...userData,
        _source: 'localStorage',
        _retrievedAt: Date.now()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données minimales:', error);
      return null;
    }
  },

  /**
   * Add a global helper to diagnose and fix profile data issues
   * This can be called if users encounter profile data errors
   */
  async fixProfileDataIssues() {
    try {
      console.log('Attempting to fix profile data issues...');
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found. User is not logged in.');
        return { success: false, message: 'Not authenticated' };
      }
      
      // Clear any cached profile data
      const queryClient = getQueryClient();
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
      
      // Try to fetch fresh profile data
      try {
        const correctApiPath = '/api/profile';
        const userData = await apiService.get(correctApiPath, {
          noCache: true,
          retries: 2,
          timeout: 10000
        });
        
        if (userData) {
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Profile data fixed successfully');
          
          // Update React Query cache
          if (queryClient) {
            queryClient.setQueryData(['user', 'current'], userData);
          }
          
          return { success: true, message: 'Profile data fixed successfully' };
        }
      } catch (apiError) {
        console.error('Error fetching fresh profile data:', apiError);
      }
      
      // If we couldn't fetch fresh data, create minimal profile data
      // Based on data from token
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = decodeToken(token);
          if (decodedToken) {
            const minimalUser = {
              id: decodedToken.id || '1',
              email: decodedToken.username || 'user@example.com',
              roles: decodedToken.roles || ['ROLE_USER'],
              _fixedAt: Date.now()
            };
            
            localStorage.setItem('user', JSON.stringify(minimalUser));
            
            console.log('Created minimal profile data from token');
            return { success: true, message: 'Created minimal profile data' };
          }
        }
      } catch (tokenError) {
        console.error('Error creating fallback profile data:', tokenError);
      }
      
      return { success: false, message: 'Could not fix profile data' };
    } catch (error) {
      console.error('Error in fixProfileDataIssues:', error);
      return { success: false, message: error.message };
    }
  },
};

export default authService;