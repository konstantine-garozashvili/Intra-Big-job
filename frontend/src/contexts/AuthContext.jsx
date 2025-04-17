import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/services/authService';
import { toast } from 'sonner';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [error, setError] = useState(null);

  // Function to check if token is expired or about to expire
  const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
      // Get payload from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Get expiration time
      const exp = payload.exp;
      // Get current time
      const now = Date.now() / 1000;
      // Check if token is expired or will expire in the next 5 minutes
      return exp - now < 300; // 300 seconds = 5 minutes
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  // Function to refresh token
  const refreshToken = async () => {
    try {
      setRefreshingToken(true);
      await authService.refreshToken();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    } finally {
      setRefreshingToken(false);
    }
  };

  // Function to load user data
  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to load user data:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        // If no token exists, user is not authenticated
        if (!localStorage.getItem('token')) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Check if token is expired or about to expire
        if (isTokenExpired()) {
          console.log('Token is expired or about to expire, attempting refresh');
          const refreshSuccessful = await refreshToken();
          
          if (!refreshSuccessful) {
            // If refresh failed, logout
            console.log('Token refresh failed, logging out');
            logout();
            return;
          }
        }
        
        // Load user data
        await loadUserData();
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear tokens and user data
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
    
    // Set up token refresh interval
    const tokenRefreshInterval = setInterval(() => {
      if (localStorage.getItem('token') && isTokenExpired()) {
        console.log('Refreshing token from interval');
        refreshToken().catch(error => {
          console.error('Token refresh interval failed:', error);
          logout();
        });
      }
    }, 4 * 60 * 1000); // Check every 4 minutes
    
    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.login(email, password);
      
      if (response && response.token) {
        // Load user data
        await loadUserData();
        toast.success('Connexion réussie');
        return response;
      } else {
        throw new Error('Login failed - No token received');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Échec de la connexion';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (redirectTo = '/login') => {
    try {
      setLoading(true);
      await authService.logout(redirectTo);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.register(userData);
      toast.success('Inscription réussie');
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Échec de l\'inscription';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    refreshingToken,
    error,
    login,
    logout,
    register,
    refreshToken,
    loadUserData,
    isAuthenticated: !!user && authService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
