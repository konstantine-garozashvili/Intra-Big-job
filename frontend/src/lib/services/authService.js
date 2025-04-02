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
      const response = await apiService.post('/api/register', userData);
      if (response?.token) localStorage.setItem('token', response.token);
      return { status: response.status || 201, data: response };
    } catch (error) {
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
      
      const response = await apiService.post('/api/login_check', {
        username: email,
        password,
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('lastLoginTime', Date.now().toString());
        
        const payload = decodeToken(response.token);
        if (payload?.roles) {
          const enhancedUser = {
            username: payload.username,
            roles: payload.roles,
            id: payload.id,
            email: payload.username,
            firstName: payload.firstName || "",
            lastName: payload.lastName || "",
            city: "Non renseignée",
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
      
      hideGlobalLoader();
      window.dispatchEvent(new Event('login-success'));
      window.dispatchEvent(new Event('auth-state-change'));
      
      try {
        const fullProfileData = await this.lazyLoadUserData(true);
        document.dispatchEvent(new CustomEvent('auth:login-complete', { 
          detail: { user: fullProfileData } 
        }));
        
        window.dispatchEvent(new CustomEvent('force-profile-refresh', {
          detail: { source: 'login', data: fullProfileData }
        }));
      } catch (err) {
        console.error("Error loading complete profile data:", err);
      }
      
      return response;
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
      // For guest users, we need to ensure we have complete profile data
      // REMOVED: Eager loading of consolidated profile for guests.
      // Basic user info from token/localStorage should be sufficient initially.
      /*
      if (cachedUser.roles && cachedUser.roles.includes('ROLE_GUEST')) {
        console.log('lazyLoadUserData - Loading guest user profile data');
        
        // Even for guests, we should load profile data to get city information
        try {
          // First try to get consolidated profile data which includes city
          const consolidatedResponse = await apiService.get('/api/profile/consolidated', { 
            noCache: isInitialLoad, 
            timeout: 8000, 
            retries: 2 
          });
          
          if (consolidatedResponse && (consolidatedResponse.data || consolidatedResponse.user)) {
            const profileData = consolidatedResponse.data || consolidatedResponse;
            const userData = profileData.user || profileData;
            
            // Enhance the cached user data with profile information
            const enhancedUser = {
              ...cachedUser,
              firstName: userData.firstName || cachedUser.firstName || "",
              lastName: userData.lastName || cachedUser.lastName || "",
              city: userData.city || "Non renseignée",
              email: userData.email || cachedUser.email,
              _extractedAt: Date.now(),
              _source: 'consolidated'
            };
            
            // Update localStorage and query cache
            localStorage.setItem('user', JSON.stringify(enhancedUser));
            
            const queryClient = getQueryClient();
            if (queryClient) {
              const sessionId = getSessionId();
              queryClient.setQueryData(['user', 'current'], enhancedUser);
              queryClient.setQueryData(['unified-user-data', '/api/profile/consolidated', sessionId], consolidatedResponse);
            }
            
            // Dispatch events to update UI
            document.dispatchEvent(new CustomEvent('user:data-updated', { detail: { user: enhancedUser } }));
            window.dispatchEvent(new Event('user-data-loaded'));
            
            return enhancedUser;
          }
        } catch (consolidatedError) {
          console.warn('Error loading consolidated profile for guest:', consolidatedError);
          // Fall back to basic /api/me endpoint
        }
      }
      */
      
      // Load profile data for all users (guest and regular)
      const profileResult = await this._loadProfileData();
      let enhancedUser = cachedUser;
      
      if (profileResult) {
        enhancedUser = {
          ...profileResult,
          city: profileResult.city || cachedUser.city || "Non renseignée",
          _extractedAt: Date.now()
        };
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
      console.error('Error in lazyLoadUserData:', error);
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
      const response = await apiService.post('/api/token/refresh', {
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
      await apiService.post('/api/token/revoke-all');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      userDataPromise = null;
      clearQueryCache();
    } catch (error) {
      throw error;
    }
  },

  async getDevices() {
    try {
      return await apiService.get('/api/token/devices');
    } catch (error) {
      throw error;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    
    // If no user in localStorage, try to extract from token for guest users
    try {
      const token = this.getToken();
      if (token) {
        const payload = decodeToken(token);
        if (payload && payload.roles && payload.roles.includes('ROLE_GUEST')) {
          console.log('Extracting guest user data from token');
          
          // Create minimal user object from token
          const minimalUser = {
            id: payload.id || payload.userId || '',
            username: payload.username || '',
            email: payload.username || payload.email || '',
            firstName: payload.firstName || payload.first_name || '',
            lastName: payload.lastName || payload.last_name || '',
            roles: payload.roles || [],
            _extractedAt: Date.now(),
            _minimal: true
          };
          
          // Cache in localStorage
          localStorage.setItem('user', JSON.stringify(minimalUser));
          
          // Also ensure roles are cached
          if (payload.roles && payload.roles.length > 0) {
            localStorage.setItem('userRoles', JSON.stringify(payload.roles));
          }
          
          return minimalUser;
        }
      }
    } catch (tokenError) {
      console.error('Error extracting user from token:', tokenError);
    }
    
    return null;
  },

  isLoggedIn() {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decodedToken = decodeToken(token);
      if (!decodedToken) return false;
      
      const isValid = decodedToken.exp > Date.now() / 1000;
      
      // If token is valid but no user data, try to extract and cache it
      if (isValid && !localStorage.getItem('user')) {
        const minimalUser = {
          id: decodedToken.id || decodedToken.userId || '',
          username: decodedToken.username || '',
          email: decodedToken.username || decodedToken.email || '',
          firstName: decodedToken.firstName || decodedToken.first_name || '',
          lastName: decodedToken.lastName || decodedToken.last_name || '',
          roles: decodedToken.roles || [],
          _extractedAt: Date.now(),
          _minimal: true
        };
        
        localStorage.setItem('user', JSON.stringify(minimalUser));
        
        // Also ensure roles are cached
        if (decodedToken.roles && decodedToken.roles.length > 0) {
          localStorage.setItem('userRoles', JSON.stringify(decodedToken.roles));
        }
      }
      
      return isValid;
    } catch (error) {
      console.error('Error checking token validity:', error);
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
  }
};

export default authService;