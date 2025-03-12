import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  
  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      if (authService.isLoggedIn()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    
    fetchUser();
  }, []);
  
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
  }), [userRoles, isLoading]);

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