import { createContext, useContext, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/services/authService';
import userDataManager from '../../lib/services/userDataManager';

// Create the context
const RoleContext = createContext(null);

// Role constants
export const ROLES = {
  SUPERADMIN: 'ROLE_SUPERADMIN',
  ADMIN: 'ROLE_ADMIN',
  HR: 'ROLE_HR',
  TEACHER: 'ROLE_TEACHER',
  STUDENT: 'ROLE_STUDENT',
  RECRUITER: 'ROLE_RECRUITER',
  GUEST: 'ROLE_GUEST',
};

export const RoleProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);
  const refreshThreshold = 5000; // 5 seconds
  const queryClient = useQueryClient();
  const refreshInProgressRef = useRef(false);
  const lastRefreshTimestampRef = useRef(0);
  const refreshThrottleTimeRef = useRef(3000); // Minimum time between refreshes: 3 seconds
  
  // Référence pour le timer de debounce
  const refreshRolesTimerRef = useRef(null);
  // Timestamp du dernier rafraîchissement effectif
  const lastActualRefreshTimestampRef = useRef(0);
  // Intervalle minimum entre rafraîchissements (3 secondes)
  const minRefreshIntervalRef = useRef(3000);
  
  // Function to load roles from localStorage or token
  const loadRoles = useCallback(() => {
    setIsLoading(true);
    
    // First check if user is authenticated at all
    const isLoggedIn = authService.isLoggedIn();
    if (!isLoggedIn) {
      setRoles([]);
      setIsLoading(false);
      return;
    }
    
    try {
      // Try to get roles from localStorage first
      const storedRoles = localStorage.getItem('userRoles');
      if (storedRoles) {
        try {
          const parsedRoles = JSON.parse(storedRoles);
          setRoles(parsedRoles);
          setIsLoading(false);
          setLastRefresh(Date.now());
        } catch (parseError) {
          console.error('Error parsing stored roles:', parseError);
          fallbackToTokenRoles();
        }
      } else {
        fallbackToTokenRoles();
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([]);
      setIsLoading(false);
    }
  }, []);

  // Fallback to extract roles from token
  const fallbackToTokenRoles = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Extract roles from token if possible
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        if (payload.roles) {
          setRoles(payload.roles);
          localStorage.setItem('userRoles', JSON.stringify(payload.roles));
        } else {
          setRoles([]);
        }
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error('Error extracting roles from token:', error);
      setRoles([]);
    } finally {
      setIsLoading(false);
      setLastRefresh(Date.now());
    }
  }, []);

  // Function to refresh roles (can be called from components)
  const refreshRoles = useCallback(() => {
    // Prevent frequent refreshes
    const now = Date.now();
    if (now - lastRefresh < refreshThreshold) {
      return;
    }
    
    loadRoles();
  }, [loadRoles, lastRefresh]);

  // Load roles on mount and when auth status changes
  useEffect(() => {
    loadRoles();
    
    // Listen for authentication events
    const handleAuthChange = () => {
      loadRoles();
    };
    
    window.addEventListener('auth-state-change', handleAuthChange);
    window.addEventListener('login-success', handleAuthChange);
    window.addEventListener('logout-success', handleAuthChange);
    window.addEventListener('role-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-state-change', handleAuthChange);
      window.removeEventListener('login-success', handleAuthChange);
      window.removeEventListener('logout-success', handleAuthChange);
      window.removeEventListener('role-change', handleAuthChange);
    };
  }, [loadRoles]);

  // Function to check if user has specific role
  const hasRole = useCallback((role) => {
    if (!authService.isLoggedIn()) return false;
    
    if (roles.length === 0 && !isLoading) {
      // If no roles but authenticated, try to refresh
      refreshRoles();
      return false;
    }
    
    // First normalize the role name
    const normalizedRole = role.toUpperCase().startsWith('ROLE_') ? role.toUpperCase() : `ROLE_${role.toUpperCase()}`;
    
    return roles.some(userRole => {
      if (typeof userRole === 'string') {
        const normalizedUserRole = userRole.toUpperCase().startsWith('ROLE_') ? 
          userRole.toUpperCase() : `ROLE_${userRole.toUpperCase()}`;
        return normalizedUserRole === normalizedRole;
      }
      
      return false;
    });
  }, [roles, isLoading, refreshRoles]);

  // Function to check if user has any of the specified roles
  const hasAnyRole = useCallback((roleList) => {
    if (!roleList || roleList.length === 0) return true;
    if (!authService.isLoggedIn()) return false;
    
    return roleList.some(role => hasRole(role));
  }, [hasRole]);

  // Create memoized value for the context
  const value = useMemo(() => {
    return {
      roles: roles || [],
      isLoading: isLoading || !authService.isLoggedIn(), // Considérer comme chargement si pas d'utilisateur
      // Add role check functions
      hasRole: hasRole,
      hasAnyRole: hasAnyRole,
      hasAllRoles: (roles) => {
        if (isLoading) return null;
        if (!roles || !Array.isArray(roles)) return false;
        const result = roles.every(role => hasRole(role));
        return result;
      },
      // Add a function to refresh roles with debounce
      refreshRoles: refreshRoles
    };
  }, [roles, isLoading, hasRole, hasAnyRole, refreshRoles]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

// Custom hook to use the role context
export const useRoles = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoles must be used within a RoleProvider');
  }
  
  // Add a robust version of hasRole that handles empty arrays
  const hasRoleRobust = useCallback((role) => {
    // If we have roles in context, check those first
    if (context.roles && context.roles.length > 0) {
      if (context.roles.some(r => r === role)) {
        return true;
      }
    }
    
    // If no roles in context or role not found, check localStorage
    try {
      const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      if (userRoles.length > 0) {
        // Check if the exact role exists
        if (userRoles.some(r => r === role)) {
          return true;
        }
        
        // Check for variant formats (with/without ROLE_ prefix, case-insensitive)
        const targetRole = role.toUpperCase().replace('ROLE_', '');
        if (userRoles.some(r => r.toUpperCase().replace('ROLE_', '') === targetRole)) {
          return true;
        }
      }
      
      // Special case for STUDENT role if no roles are found
      if (userRoles.length === 0 && (role === 'ROLE_STUDENT' || role === 'STUDENT')) {
        return true;
      }
    } catch (error) {
      // Ignorer l'erreur silencieusement
    }
    
    return false;
  }, [context.roles]);
  
  // Enhance the context with our robust version
  return {
    ...context,
    hasRoleRobust,
    // Override hasRole with our robust version
    hasRole: hasRoleRobust
  };
}; 