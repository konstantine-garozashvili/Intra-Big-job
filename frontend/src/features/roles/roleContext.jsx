import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../lib/services/authService';

// Create the context
const RoleContext = createContext(null);

// Role constants
export const ROLES = {
  SUPER_ADMIN: 'ROLE_SUPER_ADMIN',
  ADMIN: 'ROLE_ADMIN',
  HR: 'ROLE_HR',
  TEACHER: 'ROLE_TEACHER',
  STUDENT: 'ROLE_STUDENT',
  RECRUITER: 'ROLE_RECRUITER',
  GUEST: 'ROLE_GUEST',
};

export const RoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  
  // Function to fetch user data
  const fetchUser = async () => {
    if (authService.isLoggedIn()) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        return userData;
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
        return null;
      }
    } else {
      setUser(null);
      return null;
    }
  };
  
  // Fetch user data when the component mounts
  useEffect(() => {
    fetchUser();
    
    // Listen for authentication events
    const handleLoginSuccess = () => {
      console.log('Login success event detected in RoleContext');
      fetchUser().then(() => {
        // Invalidate the userRoles query to force a refetch
        queryClient.invalidateQueries(['userRoles']);
      });
    };
    
    const handleLogoutSuccess = () => {
      console.log('Logout success event detected in RoleContext');
      setUser(null);
      // Clear the userRoles query data
      queryClient.setQueryData(['userRoles'], []);
    };
    
    // Add event listeners
    window.addEventListener('login-success', handleLoginSuccess);
    window.addEventListener('logout-success', handleLogoutSuccess);
    window.addEventListener('role-change', handleLoginSuccess); // Also listen for role changes
    
    // Cleanup
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
      window.removeEventListener('logout-success', handleLogoutSuccess);
      window.removeEventListener('role-change', handleLoginSuccess);
    };
  }, [queryClient]);
  
  // Use React Query to fetch user roles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async () => {
      // If no user, return empty array
      if (!user) return [];
      
      // If user has roles already, use those
      if (user.roles) return user.roles;
      
      // Otherwise, you could fetch roles from an API endpoint if needed
      // const response = await fetch(`/api/users/${user.id}/roles`);
      // return response.json();
      
      return [];
    },
    enabled: !!user,
  });

  // Create memoized value for the context
  const value = useMemo(() => ({
    roles: userRoles || [],
    isLoading,
    // Add role check functions
    hasRole: (role) => userRoles?.some(r => r === role),
    hasAnyRole: (roles) => roles.some(role => userRoles?.some(r => r === role)),
    hasAllRoles: (roles) => roles.every(role => userRoles?.some(r => r === role)),
    // Add a function to refresh roles
    refreshRoles: () => {
      fetchUser().then(() => {
        queryClient.invalidateQueries(['userRoles']);
      });
    }
  }), [userRoles, isLoading, queryClient]);

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