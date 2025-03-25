import { useRoles } from './roleContext';
import { useRolePermissions } from './useRolePermissions';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useMemo } from 'react';
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
  const { hasRole, hasAnyRole, hasAllRoles, isLoading, roles: userRoles, refreshRoles } = useRoles();
  const toastShownRef = useRef(false);
  const timeoutRef = useRef(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [gracePeriod, setGracePeriod] = useState(true);
  
  // Use allowedRoles if provided, fall back to roles for backward compatibility
  const effectiveRoles = allowedRoles || roles;
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Rafraîchir les rôles à chaque montage du composant
  useEffect(() => {
    // Tenter de rafraîchir les rôles au montage
    refreshRoles();
    
    // Ajouter un délai de grâce pour s'assurer que les rôles sont bien chargés
    const timer = setTimeout(() => {
      setGracePeriod(false);
    }, 500); // 500ms de délai de grâce
    
    return () => clearTimeout(timer);
  }, [refreshRoles]);
  
  // Handle initial load completion with delay
  useEffect(() => {
    if (!isLoading) {
      // N'activer la vérification des rôles qu'après un court délai
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 300); // Petit délai supplémentaire
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Fonction normalisée pour vérifier les rôles (gère les formats avec/sans préfixe ROLE_)
  const hasRoleNormalized = useMemo(() => {
    return (role) => {
      // Si la fonction hasRole standard réussit, on accepte
      if (hasRole(role)) return true;
      
      // Sinon, on essaie avec différentes normalisations du nom de rôle
      const normalizedRole = role.replace(/^ROLE_/, '');
      const prefixedRole = `ROLE_${normalizedRole}`;
      
      // Vérifier les deux formats
      return hasRole(normalizedRole) || hasRole(prefixedRole);
    };
  }, [hasRole]);
  
  // Version normalisée pour vérifier plusieurs rôles
  const hasAnyRoleNormalized = useMemo(() => {
    return (roleArray) => {
      if (!roleArray || !Array.isArray(roleArray)) return false;
      return roleArray.some(role => hasRoleNormalized(role));
    };
  }, [hasRoleNormalized]);
  
  // Pure computation of role check result with normalization
  const roleCheckResult = useMemo(() => {
    // Si toujours en chargement ou en période de grâce, autoriser temporairement
    if (isLoading || !initialLoadComplete || gracePeriod) {
      return true;
    }
    
    if (typeof effectiveRoles === 'string') {
      return hasRoleNormalized(effectiveRoles);
    }
    
    return requireAll 
      ? effectiveRoles.every(role => hasRoleNormalized(role)) 
      : hasAnyRoleNormalized(effectiveRoles);
  }, [effectiveRoles, hasRoleNormalized, hasAnyRoleNormalized, isLoading, initialLoadComplete, requireAll, gracePeriod]);
  
  // Handle side effects (toast and logging) in useEffect
  useEffect(() => {
    if (!roleCheckResult && !toastShownRef.current && initialLoadComplete && !gracePeriod) {
      // Development logging
      if (process.env.NODE_ENV === 'development') {
        if (typeof effectiveRoles === 'string') {
          console.log(`Checking single role: ${effectiveRoles}, hasAccess: ${roleCheckResult}`);
        } else if (requireAll) {
          console.log(`Checking all roles: ${JSON.stringify(effectiveRoles)}, hasAccess: ${roleCheckResult}`);
        } else {
          console.log(`Checking any role: ${JSON.stringify(effectiveRoles)}, hasAccess: ${roleCheckResult}`);
        }
        console.log('User roles:', userRoles);
        console.log('isLoading:', isLoading);
        console.log('initialLoadComplete:', initialLoadComplete);
        console.log('gracePeriod:', gracePeriod);
        console.log('hasRole functions:', { hasRole, hasAnyRole, hasAllRoles, hasRoleNormalized, hasAnyRoleNormalized });
      }
      
      // Show toast notification
      toast.error("Accès non autorisé. Vous n'avez pas les permissions nécessaires pour accéder à cette page.", {
        duration: 4000,
        position: 'top-center',
      });
      
      toastShownRef.current = true;
      
      // Reset toast flag after delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        toastShownRef.current = false;
        timeoutRef.current = null;
      }, 10000);
    }
  }, [roleCheckResult, effectiveRoles, requireAll, initialLoadComplete, gracePeriod, userRoles, hasRole, hasAnyRole, hasAllRoles, hasRoleNormalized, hasAnyRoleNormalized, isLoading]);
  
  if (isLoading || gracePeriod) {
    return null;
  }
  
  if (element && roleCheckResult) {
    return element;
  }
  
  return roleCheckResult ? children : fallback;
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
  
  useEffect(() => {
    let mounted = true;
    
    const refreshUserRoles = async () => {
      if (!authService.isLoggedIn() || isRefreshing) return;
      
      setIsRefreshing(true);
      try {
        await authService.getCurrentUser(true);
        if (mounted) {
          refreshRoles();
        }
      } catch (error) {
        console.error('Error refreshing user roles:', error);
      } finally {
        if (mounted) {
          setIsRefreshing(false);
        }
      }
    };
    
    refreshUserRoles();
    
    return () => {
      mounted = false;
    };
  }, [refreshRoles, isRefreshing]);
  
  if (isLoading || isRefreshing) {
    return null;
  }
  
  const dashboardPath = permissions.getRoleDashboardPath();
  if (dashboardPath) {
    localStorage.setItem('dashboard_path', dashboardPath);
  }
  
  return <Navigate to={dashboardPath} replace />;
};

export default RoleGuard; 