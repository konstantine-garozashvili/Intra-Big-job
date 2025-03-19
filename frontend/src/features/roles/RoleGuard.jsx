import { useRoles } from './roleContext';
import { useRolePermissions } from './useRolePermissions';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { authService } from '../../lib/services/authService';
import { toast } from 'sonner';

/**
 * Component that conditionally renders content based on user roles
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render if user has required roles
 * @param {React.ReactNode} props.element - Alternative way to provide content (used with route elements)
 * @param {string|string[]} props.roles - Required role(s) to access the content (deprecated)
 * @param {string|string[]} props.allowedRoles - Required role(s) to access the content
 * @param {boolean} props.requireAll - If true, user must have all roles; if false, any role is sufficient
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have required roles
 * @returns {React.ReactNode}
 */
const RoleGuard = ({ 
  children, 
  element,
  roles, 
  allowedRoles,
  requireAll = false, 
  fallback = null 
}) => {
  const { hasRole, hasAnyRole, hasAllRoles, isLoading } = useRoles();
  const toastShownRef = useRef(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Use allowedRoles if provided, fall back to roles for backward compatibility
  const effectiveRoles = allowedRoles || roles;
  
  // Marquer la fin du chargement initial
  useEffect(() => {
    if (!isLoading) {
      setInitialLoadComplete(true);
    }
  }, [isLoading]);
  
  // Function to check access and show notification if needed
  const checkAccess = () => {
    // Pendant le chargement initial, on considère que l'accès est autorisé
    // pour éviter de montrer des erreurs trop tôt
    if (isLoading || !initialLoadComplete) {
      return true;
    }
    
    let hasAccess = false;
    
    // Debug logging
    console.log('RoleGuard checking access:', {
      requiredRoles: effectiveRoles,
      userRoles: (hasRole && hasAnyRole && hasAllRoles) ? 'Role functions present' : 'Role functions missing',
      requireAll,
      isLoading,
      initialLoadComplete
    });
    
    // Handle single role case
    if (typeof effectiveRoles === 'string') {
      hasAccess = hasRole(effectiveRoles);
      console.log(`Checking single role: ${effectiveRoles}, hasAccess: ${hasAccess}`);
    } 
    // Handle multiple roles case
    else if (requireAll) {
      hasAccess = hasAllRoles(effectiveRoles);
      console.log(`Checking all roles: ${JSON.stringify(effectiveRoles)}, hasAccess: ${hasAccess}`);
    } else {
      hasAccess = hasAnyRole(effectiveRoles);
      console.log(`Checking any role: ${JSON.stringify(effectiveRoles)}, hasAccess: ${hasAccess}`);
    }
    
    // Show toast notification if access is denied and hasn't been shown yet
    if (!hasAccess && !toastShownRef.current && initialLoadComplete) {
      toast.error("Accès non autorisé. Vous n'avez pas les permissions nécessaires pour accéder à cette page.", {
        duration: 4000,
        position: 'top-center',
      });
      toastShownRef.current = true;
      
      // Reset the toast shown flag after some time to allow showing it again later
      setTimeout(() => {
        toastShownRef.current = false;
      }, 10000);
    }
    
    return hasAccess;
  };
  
  const hasAccess = checkAccess();
  
  // Si les rôles sont encore en cours de chargement, on n'affiche rien pour éviter un flash
  if (isLoading) {
    return null;
  }
  
  // If element prop is provided, use it (for use with Route element prop)
  if (element && hasAccess) {
    return element;
  }
  
  return hasAccess ? children : fallback;
};

/**
 * Component that redirects users to their role-specific dashboard
 * Useful for redirecting from generic routes like "/" or "/dashboard"
 * 
 * @returns {React.ReactNode} A Navigate component to the appropriate dashboard
 */
export const RoleDashboardRedirect = () => {
  const { roles, isLoading, refreshRoles } = useRoles();
  const permissions = useRolePermissions();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Force a refresh of roles when this component mounts to ensure we have the latest data
  useEffect(() => {
    const refreshUserRoles = async () => {
      if (authService.isLoggedIn() && !isRefreshing) {
        setIsRefreshing(true);
        try {
          // Force refresh user data and roles
          await authService.getCurrentUser(true);
          refreshRoles();
        } catch (error) {
          console.error('Error refreshing user roles:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };
    
    refreshUserRoles();
  }, [refreshRoles]);
  
  // Si les rôles sont encore en chargement, on n'affiche rien
  if (isLoading || isRefreshing) {
    return null;
  }
  
  const dashboardPath = permissions.getRoleDashboardPath();
  
  // Store the current dashboard path in localStorage for debugging
  if (dashboardPath) {
    localStorage.setItem('dashboard_path', dashboardPath);
  }
  
  return <Navigate to={dashboardPath} replace />;
};

export default RoleGuard; 