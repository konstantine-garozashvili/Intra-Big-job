import { createContext, useContext, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../lib/services/authService';
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
  const [user, setUser] = useState(null);
  const [lastRole, setLastRole] = useState(null);
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
  
  // Function to fetch user data with deduplication logic
  const fetchUser = useCallback(async (forceRefresh = false) => {
    if (!authService.isLoggedIn()) {
      setUser(null);
      setLastRole(null);
      queryClient.setQueryData(['userRoles'], []);
      return null;
    }
    
    try {
      // Prevent multiple fetches in a short time window
      const now = Date.now();
      if (refreshInProgressRef.current) {
        // Use cached user data instead of making a new request
        const cachedUser = userDataManager.getCachedUserData();
        if (cachedUser) {
          return cachedUser;
        }
      }
      
      // Anti-rebond (debounce) - si un refresh a été fait récemment, utiliser le cache
      if (!forceRefresh && now - lastRefreshTimestampRef.current < refreshThrottleTimeRef.current) {
        const cachedUser = userDataManager.getCachedUserData();
        if (cachedUser) {
          return cachedUser;
        }
      }
      
      refreshInProgressRef.current = true;
      lastRefreshTimestampRef.current = now;
      
      // Add a unique requestId for tracing/deduplication
      const userData = await authService.getCurrentUser(forceRefresh, { requestSource: 'roleContext' });
      setUser(userData);
      
      // Check if role has changed
      const currentRole = userData?.roles?.[0];
      if (currentRole && lastRole && currentRole !== lastRole) {
        // Clear role-specific caches
        queryClient.removeQueries(['admin-users']);
        queryClient.removeQueries(['admin-dashboard']);
        queryClient.removeQueries(['student-dashboard']);
        queryClient.removeQueries(['teacher-dashboard']);
        queryClient.removeQueries(['hr-dashboard']);
      }
      
      // Update last role
      if (currentRole) {
        setLastRole(currentRole);
      }
      
      refreshInProgressRef.current = false;
      return userData;
    } catch (error) {
      refreshInProgressRef.current = false;
      setUser(null);
      setLastRole(null);
      // Clear query data to ensure consistent state
      queryClient.setQueryData(['userRoles'], []);
      return null;
    }
  }, [queryClient, lastRole]);
  
  // Fetch user data when the component mounts
  useEffect(() => {
    // On mount, use cached data first if available to avoid a new request
    const cachedUser = userDataManager.getCachedUserData();
    if (cachedUser) {
      setUser(cachedUser);
      if (cachedUser.roles && cachedUser.roles.length > 0) {
        setLastRole(cachedUser.roles[0]);
      }
      
      // Then refresh in the background only if data is stale
      const cachedTimestamp = userDataManager.getStats().lastUpdated 
        ? new Date(userDataManager.getStats().lastUpdated).getTime() 
        : 0;
      
      const now = Date.now();
      if (now - cachedTimestamp > 2 * 60 * 1000) { // 2 minutes
        fetchUser(false).catch(() => {});
      }
    } else {
      fetchUser(false).catch(() => {});
    }
    
    // Listen for authentication events
    const handleLoginSuccess = () => {
      fetchUser(true).then(() => {
        // Invalidate the userRoles query to force a refetch
        queryClient.invalidateQueries(['userRoles']);
      });
    };
    
    const handleLogoutSuccess = () => {
      setUser(null);
      setLastRole(null);
      // Clear the userRoles query data
      queryClient.setQueryData(['userRoles'], []);
      // Also remove the queries completely
      queryClient.removeQueries(['userRoles']);
    };
    
    const handleRoleChange = () => {
      // Check if a refresh is already in progress
      if (refreshInProgressRef.current) {
        return;
      }
      
      fetchUser(true).then(() => {
        // Invalidate all role-related queries
        queryClient.invalidateQueries(['userRoles']);
      });
    };
    
    // Add event listeners
    window.addEventListener('login-success', handleLoginSuccess);
    window.addEventListener('logout-success', handleLogoutSuccess);
    window.addEventListener('role-change', handleRoleChange);
    window.addEventListener('auth-logout-success', handleLogoutSuccess);
    window.addEventListener('query-cache-cleared', handleLogoutSuccess);
    
    // Cleanup
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
      window.removeEventListener('logout-success', handleLogoutSuccess);
      window.removeEventListener('role-change', handleRoleChange);
      window.removeEventListener('auth-logout-success', handleLogoutSuccess);
      window.removeEventListener('query-cache-cleared', handleLogoutSuccess);
    };
  }, [fetchUser, queryClient]);
  
  // Use React Query to fetch user roles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async () => {
      // If no user, return empty array
      if (!user) {
        return [];
      }
      
      // If user has roles already, use those
      if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        return user.roles;
      }
      
      return [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    onError: () => {
      return [];
    }
  });

  // Create memoized value for the context
  const value = useMemo(() => {
    return {
      roles: userRoles || [],
      isLoading: isLoading || !user, // Considérer comme chargement si pas d'utilisateur
      // Add role check functions
      hasRole: (role) => {
        // Si toujours en chargement, on retourne null pour indiquer l'indécision
        if (isLoading) return null;
        const result = userRoles?.some(r => r === role);
        return result;
      },
      hasAnyRole: (roles) => {
        if (isLoading) return null;
        if (!roles || !Array.isArray(roles)) return false;
        const result = roles.some(role => userRoles?.some(r => r === role));
        return result;
      },
      hasAllRoles: (roles) => {
        if (isLoading) return null;
        if (!roles || !Array.isArray(roles)) return false;
        const result = roles.every(role => userRoles?.some(r => r === role));
        return result;
      },
      // Add a function to refresh roles with debounce
      refreshRoles: () => {
        // Annuler tout timer existant
        if (refreshRolesTimerRef.current) {
          clearTimeout(refreshRolesTimerRef.current);
        }
        
        const now = Date.now();
        
        // Si un rafraîchissement a été fait récemment, programmer un nouveau après l'intervalle
        if (now - lastActualRefreshTimestampRef.current < minRefreshIntervalRef.current) {
          refreshRolesTimerRef.current = setTimeout(() => {
            lastActualRefreshTimestampRef.current = Date.now();
            fetchUser(true).then(() => {
              queryClient.invalidateQueries(['userRoles']);
            });
            refreshRolesTimerRef.current = null;
          }, minRefreshIntervalRef.current - (now - lastActualRefreshTimestampRef.current));
          
          return;
        }
        
        // Exécuter immédiatement si l'intervalle minimum est passé
        lastActualRefreshTimestampRef.current = now;
        fetchUser(true).then(() => {
          queryClient.invalidateQueries(['userRoles']);
        });
      }
    };
  }, [userRoles, isLoading, queryClient, fetchUser, user]);

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