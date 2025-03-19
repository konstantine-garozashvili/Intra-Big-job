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
  return context;
}; 