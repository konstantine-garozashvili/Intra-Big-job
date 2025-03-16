import { useRoles } from './roleContext';
import { useRolePermissions } from './useRolePermissions';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authService } from '../../lib/services/authService';
import DotSpinner from '../../components/ui/DotSpinner';

/**
 * Component that conditionally renders content based on user roles
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render if user has required roles
 * @param {string|string[]} props.roles - Required role(s) to access the content
 * @param {boolean} props.requireAll - If true, user must have all roles; if false, any role is sufficient
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have required roles
 * @returns {React.ReactNode}
 */
const RoleGuard = ({ 
  children, 
  roles, 
  requireAll = false, 
  fallback = null 
}) => {
  const { hasRole, hasAnyRole, hasAllRoles } = useRoles();
  
  // Handle single role case
  if (typeof roles === 'string') {
    return hasRole(roles) ? children : fallback;
  }
  
  // Handle multiple roles case
  if (requireAll) {
    return hasAllRoles(roles) ? children : fallback;
  } else {
    return hasAnyRole(roles) ? children : fallback;
  }
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
  
  // Show the dot spinner while loading
  if (isLoading || isRefreshing) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <DotSpinner />
      </div>
    );
  }
  
  const dashboardPath = permissions.getRoleDashboardPath();
  
  // Store the current dashboard path in localStorage for debugging
  if (dashboardPath) {
    localStorage.setItem('dashboard_path', dashboardPath);
  }
  
  return <Navigate to={dashboardPath} replace />;
};

export default RoleGuard; 