import { useMemo } from 'react';
import { useRoles } from './roleContext';
import { ROLES } from './roleContext';

/**
 * Hook that provides role-based permission checks
 * @returns {Object} Object containing permission check functions
 */
export const useRolePermissions = () => {
  const { roles, hasRole } = useRoles();

  const permissions = useMemo(() => ({
    // Role check functions
    isAdmin: () => hasRole(ROLES.ADMIN) || hasRole(ROLES.SUPER_ADMIN),
    isRecruiter: () => hasRole(ROLES.RECRUITER),
    isHR: () => hasRole(ROLES.HR),
    isTeacher: () => hasRole(ROLES.TEACHER),
    isStudent: () => hasRole(ROLES.STUDENT),
    isGuest: () => hasRole(ROLES.GUEST),
    
    // Permission check functions
    canEditPersonalInfo: () => {
      return permissions.isAdmin() || 
             permissions.isRecruiter() || 
             permissions.isHR() || 
             permissions.isTeacher() || 
             permissions.isStudent() || 
             permissions.isGuest();
    },
    
    isFieldEditable: (fieldName) => {
      // Only admin can edit email
      if (fieldName === 'email') return permissions.isAdmin();
      
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
    
    canEditAddress: () => permissions.isAdmin(),
    
    showLinkedIn: () => {
      return permissions.isAdmin() || 
             permissions.isRecruiter() || 
             permissions.isHR() || 
             permissions.isTeacher() || 
             permissions.isStudent() || 
             permissions.isGuest();
    },
    
    canEditAcademic: () => {
      return permissions.isAdmin() || 
             permissions.isStudent() || 
             permissions.isGuest();
    },
    
    canEditPortfolioUrl: () => {
      return permissions.isStudent() || permissions.isAdmin();
    },
    
    showPortfolioUrl: () => {
      return permissions.isStudent() || 
             permissions.isAdmin() || 
             permissions.isTeacher() || 
             permissions.isHR();
    },
  }), [hasRole]);

  return permissions;
};

/**
 * Hook that provides role-based UI components
 * @returns {Object} Object containing role-based UI components and utilities
 */
export const useRoleUI = () => {
  const { roles } = useRoles();
  
  return useMemo(() => ({
    // Get the main role (first role in the array)
    getMainRole: () => {
      if (roles && roles.length > 0) {
        return roles[0];
      }
      return 'ROLE_GUEST';
    },
    
    // Get color for role badge
    getRoleBadgeColor: (roleName) => {
      switch(roleName) {
        case ROLES.STUDENT: return "from-blue-500/90 to-blue-700/90";
        case ROLES.TEACHER: return "from-emerald-500/90 to-emerald-700/90";
        case ROLES.HR: return "from-purple-500/90 to-purple-700/90";
        case ROLES.ADMIN: return "from-amber-500/90 to-amber-700/90";
        case ROLES.SUPER_ADMIN: return "from-red-500/90 to-red-700/90";
        case ROLES.RECRUITER: return "from-pink-500/90 to-pink-700/90";
        case ROLES.GUEST: return "from-teal-500/90 to-teal-700/90";
        default: return "from-gray-500/90 to-gray-700/90";
      }
    },
    
    // Translate role name to French
    translateRoleName: (roleName) => {
      switch(roleName) {
        case ROLES.STUDENT: return "Étudiant";
        case ROLES.TEACHER: return "Professeur";
        case ROLES.HR: return "Ressources Humaines";
        case ROLES.ADMIN: return "Administrateur";
        case ROLES.SUPER_ADMIN: return "Super Administrateur";
        case ROLES.RECRUITER: return "Recruteur";
        case ROLES.GUEST: return "Invité";
        default: return roleName;
      }
    },
  }), [roles]);
}; 