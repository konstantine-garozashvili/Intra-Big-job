import { useRoles } from './roleContext';

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

export default RoleGuard; 