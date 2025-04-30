import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useRoles } from '@/features/roles/roleContext';
import { useRolePermissions } from '@/features/roles/useRolePermissions';

/**
 * Composant pour protéger les routes nécessitant une authentification
 * Redirige vers la racine si l'utilisateur n'est pas connecté
 */
const ProtectedRoute = ({ roles }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const redirectedRef = useRef(false);
  const renderedOutletRef = useRef(false);
  const { roles: userRoles, hasRole, isLoading: rolesLoading } = useRoles();
  const permissions = useRolePermissions();

  // Verify that the user has the necessary roles for the requested path
  const checkRouteAccess = () => {
    // Don't check access if roles aren't loaded yet
    if (!rolesLoaded || rolesLoading) {
      return true;
    }

    // If no specific roles are required, allow access
    if (!roles) {
      return true;
    }

    // Check if user has any of the required roles
    const hasRequiredRole = Array.isArray(roles) 
      ? roles.some(role => hasRole(role))
      : hasRole(roles);

    if (!hasRequiredRole) {
      toast.error("Vous n'avez pas les droits nécessaires pour accéder à cette page", {
        duration: 3000,
        position: 'top-center',
      });
      return false;
    }

    return true;
  };

  // Effect to monitor role loading
  useEffect(() => {
    if (!rolesLoading && isAuthenticated) {
      setRolesLoaded(true);
    }
  }, [rolesLoading, isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = authService.isLoggedIn();
      
      if (!isLoggedIn) {
        if (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register') {
          toast.error('Veuillez vous connecter pour accéder à cette page', {
            duration: 3000,
            position: 'top-center',
          });
        }
      }
      
      setIsAuthenticated(isLoggedIn);
      setIsChecking(false);
    };

    checkAuth();
  }, [location.pathname]);

  // During verification, return existing content or null first time
  if (isChecking || (isAuthenticated && rolesLoading)) {
    if (renderedOutletRef.current && localStorage.getItem('token')) {
      return <Outlet />;
    }
    return null;
  }

  // If user is not authenticated, redirect to home
  if (!isAuthenticated) {
    if (redirectedRef.current) {
      return null;
    }
    
    redirectedRef.current = true;
    
    const returnTo = location.pathname !== '/' ? location.pathname : undefined;
    if (returnTo) {
      sessionStorage.setItem('returnTo', returnTo);
    }
    
    return <Navigate to="/" replace />;
  }
  
  // Check route access only if roles are loaded
  const hasRouteAccess = checkRouteAccess();
  
  // If the user doesn't have access to the route
  if (!hasRouteAccess && rolesLoaded) {
    // For guest users, redirect to guest dashboard
    if (hasRole('ROLE_GUEST')) {
      return <Navigate to="/guest/dashboard" replace />;
    }
    // For other users, redirect to their respective dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated, show route content
  renderedOutletRef.current = true;
  
  return (
    <div className="protected-route-wrapper">
      <Outlet />
    </div>
  );
};

export default ProtectedRoute; 
