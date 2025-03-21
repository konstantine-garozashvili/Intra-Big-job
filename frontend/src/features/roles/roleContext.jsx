import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../lib/services/authService';

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
  
  // Function to fetch user data
  const fetchUser = useCallback(async (forceRefresh = false) => {
    if (authService.isLoggedIn()) {
      try {
        const userData = await authService.getCurrentUser(forceRefresh);
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
        
        return userData;
      } catch (error) {
        setUser(null);
        setLastRole(null);
        // Clear query data to ensure consistent state
        queryClient.setQueryData(['userRoles'], []);
        return null;
      }
    } else {
      setUser(null);
      setLastRole(null);
      // Clear query data to ensure consistent state
      queryClient.setQueryData(['userRoles'], []);
      return null;
    }
  }, [queryClient, lastRole]);
  
  // Fetch user data when the component mounts
  useEffect(() => {
    fetchUser();
    
    // Listen for authentication events
    const handleLoginSuccess = () => {
      // Nettoyer immédiatement toutes les données existantes
      queryClient.removeQueries(['userRoles']);
      queryClient.removeQueries(['user']);
      queryClient.removeQueries(['user-data']);
      queryClient.setQueryData(['userRoles'], []);
      
      // Réinitialiser l'état local
      setUser(null);
      setLastRole(null);
      
      // Forcer le rafraîchissement des données utilisateur avec un court délai pour éviter les conditions de course
      setTimeout(() => {
        fetchUser(true).then(() => {
          // Invalider toutes les requêtes liées aux rôles et utilisateur
          queryClient.invalidateQueries();
          queryClient.refetchQueries(['userRoles']);
          
          // Déclencher un événement pour indiquer que les rôles sont mis à jour
          window.dispatchEvent(new Event('roles-updated'));
        });
      }, 200);
    };
    
    const handleLogoutSuccess = () => {
      // Nettoyer l'état local
      setUser(null);
      setLastRole(null);
      
      // Nettoyer toutes les données en cache
      queryClient.setQueryData(['userRoles'], []);
      queryClient.removeQueries(['userRoles']);
      queryClient.removeQueries(['user']);
      queryClient.removeQueries(['user-data']);
      
      // Nettoyer localStorage
      localStorage.removeItem('userRoles');
      localStorage.removeItem('last_role');
      
      // Vider complètement le cache pour assurer une session propre
      queryClient.clear();
    };
    
    const handleRoleChange = () => {
      // Nettoyer d'abord les données en cache
      queryClient.removeQueries(['userRoles']);
      
      // Puis rafraîchir avec un délai
      setTimeout(() => {
        fetchUser(true).then(() => {
          // Invalider les requêtes liées aux rôles
          queryClient.invalidateQueries(['userRoles']);
          queryClient.invalidateQueries(['user-data']);
        });
      }, 100);
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
    staleTime: 0, // Toujours considérer les données comme obsolètes
    cacheTime: 60 * 1000, // 1 minute seulement
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
      // Add a function to refresh roles
      refreshRoles: () => {
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
        console.log('No roles found, assuming student role for testing');
        return true;
      }
    } catch (error) {
      console.error('Error checking roles in localStorage:', error);
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