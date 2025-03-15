import { useRoles } from './roleContext';
import { useRolePermissions } from './useRolePermissions';
import { Navigate } from 'react-router-dom';

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
  const { roles, isLoading } = useRoles();
  const permissions = useRolePermissions();
  
  // Show loading indicator while roles are loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#528eb2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const dashboardPath = permissions.getRoleDashboardPath();
  
  return <Navigate to={dashboardPath} replace />;
};

export default RoleGuard; 