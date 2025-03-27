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
  const refreshAttemptedRef = useRef(false); // Référence pour suivre si refreshRoles a été appelé
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [gracePeriod, setGracePeriod] = useState(true);
  const [rolesAvailable, setRolesAvailable] = useState(false);
  
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
    // Ne rafraîchir les rôles qu'une seule fois par montage du composant
    if (!refreshAttemptedRef.current) {
      refreshAttemptedRef.current = true;
      refreshRoles();
    }
    
    // Ajouter un délai de grâce plus long pour s'assurer que les rôles sont bien chargés
    const timer = setTimeout(() => {
      setGracePeriod(false);
    }, 1500); // 1.5s de délai de grâce (augmenté de 500ms à 1500ms)
    
    return () => clearTimeout(timer);
  }, [refreshRoles]);
  
  // Detect when roles become available
  useEffect(() => {
    if (userRoles && userRoles.length > 0) {
      setRolesAvailable(true);
    }
  }, [userRoles]);
  
  // Handle initial load completion with delay
  useEffect(() => {
    if (!isLoading && rolesAvailable) {
      // N'activer la vérification des rôles qu'après un court délai
      // et seulement quand les rôles sont disponibles
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 300); // Petit délai supplémentaire
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, rolesAvailable]);
  
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
    // Si toujours en chargement, en période de grâce, ou si les rôles ne sont pas encore disponibles,
    // autoriser temporairement
    if (isLoading || !initialLoadComplete || gracePeriod || !rolesAvailable) {
      return true;
    }
    
    if (typeof effectiveRoles === 'string') {
      return hasRoleNormalized(effectiveRoles);
    }
    
    return requireAll 
      ? effectiveRoles.every(role => hasRoleNormalized(role)) 
      : hasAnyRoleNormalized(effectiveRoles);
  }, [effectiveRoles, hasRoleNormalized, hasAnyRoleNormalized, isLoading, initialLoadComplete, requireAll, gracePeriod, rolesAvailable]);
  
  // Handle side effects (toast and logging) in useEffect
  useEffect(() => {
    if (!roleCheckResult && !toastShownRef.current && initialLoadComplete && !gracePeriod && rolesAvailable) {
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
        console.log('rolesAvailable:', rolesAvailable);
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
  }, [roleCheckResult, effectiveRoles, requireAll, initialLoadComplete, gracePeriod, userRoles, hasRole, hasAnyRole, hasAllRoles, hasRoleNormalized, hasAnyRoleNormalized, isLoading, rolesAvailable]);
  
  // Show nothing during loading or grace period
  if (isLoading || gracePeriod || !rolesAvailable) {
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
  const [rolesAvailable, setRolesAvailable] = useState(false);
  const gracePeriodTimeoutRef = useRef(null);
  const [gracePeriod, setGracePeriod] = useState(true);
  
  // Detect when roles become available
  useEffect(() => {
    if (roles && roles.length > 0) {
      setRolesAvailable(true);
    }
  }, [roles]);
  
  // Set up grace period for role loading
  useEffect(() => {
    // Set a grace period to allow roles to load
    gracePeriodTimeoutRef.current = setTimeout(() => {
      setGracePeriod(false);
    }, 1500); // 1.5 seconds grace period, matching RoleGuard
    
    return () => {
      if (gracePeriodTimeoutRef.current) {
        clearTimeout(gracePeriodTimeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    let mounted = true;
    
    const refreshUserRoles = async () => {
      if (!authService.isLoggedIn() || isRefreshing) return;
      
      setIsRefreshing(true);
      try {
        await refreshRoles();
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
  
  // Show loading state while roles are being loaded
  if (isLoading || isRefreshing || (!rolesAvailable && gracePeriod)) {
    // Return a loading indicator or null during the grace period
    return null; // Or a loading spinner
  }
  
  // Use the getRoleDashboardPath from permissions if available
  const dashboardPath = permissions.getRoleDashboardPath();
  if (dashboardPath && dashboardPath !== '/login') {
    return <Navigate to={dashboardPath} replace />;
  }
  
  // Fallback to direct role checks if getRoleDashboardPath returns null or '/login'
  if (permissions.isSuperAdmin()) {
    return <Navigate to="/superadmin/dashboard" replace />;
  } else if (permissions.isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (permissions.isHR()) {
    return <Navigate to="/hr/dashboard" replace />;
  } else if (permissions.isTeacher()) {
    return <Navigate to="/teacher/dashboard" replace />;
  } else if (permissions.isStudent()) {
    return <Navigate to="/student/dashboard" replace />;
  } else if (permissions.isRecruiter()) {
    return <Navigate to="/recruiter/dashboard" replace />;
  } else if (permissions.isGuest()) {
    return <Navigate to="/guest/dashboard" replace />;
  }
  
  // Default fallback
  return <Navigate to="/login" replace />;
};

export default RoleGuard;