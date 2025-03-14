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
    console.log('=== RÉCUPÉRATION DES DONNÉES UTILISATEUR DANS ROLECONTEXT ===');
    if (authService.isLoggedIn()) {
      console.log('Utilisateur connecté, récupération des données...');
      try {
        const userData = await authService.getCurrentUser();
        console.log('Données utilisateur récupérées:', userData);
        console.log('Rôles utilisateur:', userData.roles);
        setUser(userData);
        return userData;
      } catch (error) {
        setUser(null);
        return null;
      }
    } else {
      console.log('Utilisateur non connecté, aucune donnée à récupérer');
      setUser(null);
      return null;
    }
  };
  
  // Fetch user data when the component mounts
  useEffect(() => {
    fetchUser();
    
    // Listen for authentication events
    const handleLoginSuccess = () => {
      fetchUser().then(() => {
        // Invalidate the userRoles query to force a refetch
        queryClient.invalidateQueries(['userRoles']);
      });
    };
    
    const handleLogoutSuccess = () => {
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
      console.log('=== RÉCUPÉRATION DES RÔLES UTILISATEUR ===');
      // If no user, return empty array
      if (!user) {
        console.log('Aucun utilisateur, retour d\'un tableau vide de rôles');
        return [];
      }
      
      // If user has roles already, use those
      if (user.roles) {
        console.log('Rôles trouvés dans les données utilisateur:', user.roles);
        return user.roles;
      }
      
      // Otherwise, you could fetch roles from an API endpoint if needed
      // const response = await fetch(`/api/users/${user.id}/roles`);
      // return response.json();
      console.log('Aucun rôle trouvé, retour d\'un tableau vide');
      return [];
    },
    enabled: !!user,
  });

  // Create memoized value for the context
  const value = useMemo(() => {
    console.log('=== MISE À JOUR DU CONTEXTE DE RÔLES ===');
    console.log('Rôles disponibles:', userRoles || []);
    
    return {
      roles: userRoles || [],
      isLoading,
      // Add role check functions
      hasRole: (role) => {
        const hasRole = userRoles?.some(r => r === role);
        console.log(`Vérification du rôle ${role}: ${hasRole}`);
        return hasRole;
      },
      hasAnyRole: (roles) => roles.some(role => userRoles?.some(r => r === role)),
      hasAllRoles: (roles) => roles.every(role => userRoles?.some(r => r === role)),
      // Add a function to refresh roles
      refreshRoles: () => {
        console.log('Rafraîchissement des rôles...');
        fetchUser().then(() => {
          queryClient.invalidateQueries(['userRoles']);
        });
      }
    };
  }, [userRoles, isLoading, queryClient]);

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