import { useMemo, useState, useEffect } from 'react';
import { useRoles } from './roleContext';
import { ROLES } from './roleContext';

/**
 * Hook that provides role-based permission checks
 * @returns {Object} Object containing permission check functions
 */
export const useRolePermissions = () => {
  const { roles, hasRole, isLoading } = useRoles();
  const [rolesAvailable, setRolesAvailable] = useState(false);
  
  // Detect when roles become available
  useEffect(() => {
    if (roles && roles.length > 0) {
      setRolesAvailable(true);
    }
  }, [roles]);

  const permissions = useMemo(() => {
    // Helper function to handle role checks with loading state
    const safeRoleCheck = (roleCheckFn) => {
      // During loading, return null (indeterminate) instead of false
      if (isLoading || !rolesAvailable) return null;
      return roleCheckFn();
    };
    
    return {
      // Role check functions with loading state handling
      isAdmin: () => safeRoleCheck(() => hasRole(ROLES.ADMIN) || hasRole(ROLES.SUPERADMIN)),
      isSuperAdmin: () => safeRoleCheck(() => hasRole(ROLES.SUPERADMIN)),
      isRecruiter: () => safeRoleCheck(() => hasRole(ROLES.RECRUITER)),
      isHR: () => safeRoleCheck(() => hasRole(ROLES.HR)),
      isTeacher: () => safeRoleCheck(() => hasRole(ROLES.TEACHER)),
      isStudent: () => safeRoleCheck(() => hasRole(ROLES.STUDENT)),
      isGuest: () => safeRoleCheck(() => hasRole(ROLES.GUEST)),
      
      // Permission check functions
      canEditPersonalInfo: () => {
        return safeRoleCheck(() => 
          permissions.isAdmin() || 
          permissions.isRecruiter() || 
          permissions.isHR() || 
          permissions.isTeacher() || 
          permissions.isStudent() || 
          permissions.isGuest()
        );
      },
      
      isFieldEditable: (fieldName) => {
        // During loading, allow temporarily
        if (isLoading || !rolesAvailable) return true;
        
        // Admin et SuperAdmin peuvent éditer l'email
        if (fieldName === 'email') return hasRole(ROLES.ADMIN) || hasRole(ROLES.SUPERADMIN);
        
        // Portfolio URL can be edited by students and admins
        if (fieldName === 'portfolioUrl') {
          return permissions.isStudent() || permissions.isAdmin();
        }
        
        // Other fields follow regular permissions
        if (permissions.isAdmin()) return true;
        
        if (permissions.isRecruiter() || 
            permissions.isHR() || 
            permissions.isTeacher() || 
            permissions.isStudent() || 
            permissions.isGuest()) {
          return ['phoneNumber', 'linkedinUrl'].includes(fieldName);
        }
        
        return false;
      },
      
      canEditAddress: () => safeRoleCheck(() => hasRole(ROLES.ADMIN) || hasRole(ROLES.SUPERADMIN)),
      
      showLinkedIn: () => {
        return safeRoleCheck(() => 
          permissions.isAdmin() || 
          permissions.isRecruiter() || 
          permissions.isHR() || 
          permissions.isTeacher() || 
          permissions.isStudent() || 
          permissions.isGuest()
        );
      },
      
      canEditAcademic: () => {
        return safeRoleCheck(() => 
          permissions.isAdmin() || 
          permissions.isStudent() || 
          permissions.isGuest()
        );
      },
      
      canEditPortfolioUrl: () => {
        return safeRoleCheck(() => 
          permissions.isStudent() || permissions.isAdmin()
        );
      },
      
      showPortfolioUrl: () => {
        return safeRoleCheck(() => 
          permissions.isStudent() || 
          permissions.isAdmin() || 
          permissions.isTeacher() || 
          permissions.isHR()
        );
      },
      
      /**
       * Get the dashboard path based on the user's role
       * @returns {string} The path to the appropriate dashboard
       */
      getRoleDashboardPath: () => {
        // During loading, return null
        if (isLoading || !rolesAvailable) return null;
        
        if (hasRole(ROLES.SUPERADMIN)) {
          return '/superadmin/dashboard';
        }
        if (hasRole(ROLES.ADMIN)) {
          return '/admin/dashboard';
        }
        if (hasRole(ROLES.HR)) {
          return '/hr/dashboard';
        }
        if (hasRole(ROLES.TEACHER)) {
          return '/teacher/dashboard';
        }
        if (hasRole(ROLES.STUDENT)) {
          return '/student/dashboard';
        }
        if (hasRole(ROLES.RECRUITER)) {
          return '/recruiter/dashboard';
        }
        if (hasRole(ROLES.GUEST)) {
          return '/guest/dashboard';
        }
        
        // Default fallback
        return '/login';
      },
      
      // Loading state
      isRolesLoading: () => isLoading || !rolesAvailable
    };
  }, [hasRole, isLoading, rolesAvailable, roles]);

  return permissions;
};

/**
 * Hook that provides role-based UI components
 * @returns {Object} Object containing role-based UI components and utilities
 */
export const useRoleUI = () => {
  const { isAdmin, isRecruiter, isHR, isTeacher, isStudent, isGuest } = useRolePermissions();
  
  return useMemo(() => ({
    // Get the appropriate dashboard icon based on role
    getDashboardIcon: () => {
      if (isAdmin()) return 'admin-dashboard';
      if (isRecruiter()) return 'recruiter-dashboard';
      if (isHR()) return 'hr-dashboard';
      if (isTeacher()) return 'teacher-dashboard';
      if (isStudent()) return 'student-dashboard';
      if (isGuest()) return 'guest-dashboard';
      return 'default-dashboard';
    },
    
    // Get the role title for display
    getRoleTitle: () => {
      if (isAdmin()) return 'Administrateur';
      if (isRecruiter()) return 'Recruteur';
      if (isHR()) return 'Ressources Humaines';
      if (isTeacher()) return 'Formateur';
      if (isStudent()) return 'Étudiant';
      if (isGuest()) return 'Invité';
      return 'Utilisateur';
    },
    
    // Get role-specific CSS classes
    getRoleClasses: () => {
      if (isAdmin()) return 'role-admin';
      if (isRecruiter()) return 'role-recruiter';
      if (isHR()) return 'role-hr';
      if (isTeacher()) return 'role-teacher';
      if (isStudent()) return 'role-student';
      if (isGuest()) return 'role-guest';
      return 'role-default';
    }
  }), [isAdmin, isRecruiter, isHR, isTeacher, isStudent, isGuest]);
};