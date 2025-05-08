/**
 * Utility functions for handling user roles and permissions
 */

/**
 * Check if the user is an admin
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user is an admin
 */
export const isAdmin = (userRole) => {
  if (!userRole) return false;
  
  if (Array.isArray(userRole)) {
    return userRole.some(role => {
      const roleName = typeof role === 'object' && role !== null ? role.name : role;
      return roleName === 'ROLE_ADMIN' || roleName === 'ADMIN';
    });
  }
  
  return userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';
};

/**
 * Check if the user is a super admin
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user is a super admin
 */
export const isSuperAdmin = (userRole) => {
  if (!userRole) return false;
  
  if (Array.isArray(userRole)) {
    return userRole.some(role => {
      const roleName = typeof role === 'object' && role !== null ? role.name : role;
      return roleName === 'ROLE_SUPER_ADMIN' || roleName === 'SUPER_ADMIN' || roleName === 'SUPERADMIN';
    });
  }
  
  return userRole === 'ROLE_SUPER_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
};

/**
 * Check if the user is a recruiter
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user is a recruiter
 */
export const isRecruiter = (userRole) => {
  if (!userRole) return false;
  
  if (Array.isArray(userRole)) {
    return userRole.some(role => {
      const roleName = typeof role === 'object' && role !== null ? role.name : role;
      return roleName === 'ROLE_RECRUITER' || roleName === 'RECRUITER';
    });
  }
  
  return userRole === 'ROLE_RECRUITER' || userRole === 'RECRUITER';
};

/**
 * Check if the user is an HR
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user is an HR
 */
export const isHR = (userRole) => {
  if (!userRole) return false;
  
  if (Array.isArray(userRole)) {
    return userRole.some(role => {
      const roleName = typeof role === 'object' && role !== null ? role.name : role;
      return roleName === 'ROLE_HR' || roleName === 'HR';
    });
  }
  
  return userRole === 'ROLE_HR' || userRole === 'HR';
};

/**
 * Check if the user is a teacher
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user is a teacher
 */
export const isTeacher = (userRole) => {
  if (!userRole) return false;
  
  if (Array.isArray(userRole)) {
    return userRole.some(role => {
      const roleName = typeof role === 'object' && role !== null ? role.name : role;
      return roleName === 'ROLE_TEACHER' || roleName === 'TEACHER';
    });
  }
  
  return userRole === 'ROLE_TEACHER' || userRole === 'TEACHER';
};

/**
 * Check if the user is a student
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user is a student
 */
export const isStudent = (userRole) => {
  if (!userRole) return false;
  
  if (Array.isArray(userRole)) {
    return userRole.some(role => {
      const roleName = typeof role === 'object' && role !== null ? role.name : role;
      return roleName === 'ROLE_STUDENT' || roleName === 'STUDENT';
    });
  }
  
  return userRole === 'ROLE_STUDENT' || userRole === 'STUDENT';
};

/**
 * Check if the user is a guest
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user is a guest
 */
export const isGuest = (userRole) => {
  if (!userRole) {
    return false;
  }
  
  if (Array.isArray(userRole)) {
    const result = userRole.some(role => {
      const roleName = typeof role === 'object' && role !== null ? role.name : role;
      const isGuestRole = roleName === 'ROLE_GUEST' || roleName === 'GUEST';
      return isGuestRole;
    });
    return result;
  }
  
  return userRole === 'ROLE_GUEST' || userRole === 'GUEST';
};

/**
 * Check if the user can edit personal information
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user can edit personal information
 */
export const canEditPersonalInfo = (userRole) => {
  return isAdmin(userRole) || isRecruiter(userRole) || isHR(userRole) || 
         isTeacher(userRole) || isStudent(userRole) || isGuest(userRole) || isSuperAdmin(userRole);
};

/**
 * Check if a specific field is editable by the user
 * @param {Array|string} userRole - The user's role(s)
 * @param {string} fieldName - The name of the field
 * @returns {boolean} - Whether the field is editable
 */
export const isFieldEditable = (userRole, fieldName) => {
  // Superadmin can edit everything
  if (isSuperAdmin(userRole)) {
    return true;
  }
  
  // Only admin can edit email
  if (fieldName === 'email') return isAdmin(userRole);
  
  // Portfolio URL can be edited by students and admins
  if (fieldName === 'portfolioUrl') return isStudent(userRole) || isAdmin(userRole);
  
  // Other fields follow regular permissions
  if (isAdmin(userRole)) return true;
  if (isRecruiter(userRole)) {
    return ['phoneNumber', 'linkedinUrl'].includes(fieldName);
  }
  if (isHR(userRole) || isTeacher(userRole) || isStudent(userRole) || isGuest(userRole)) {
    return ['phoneNumber', 'linkedinUrl'].includes(fieldName);
  }
  return false;
};

/**
 * Check if the user can edit address information
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user can edit address information
 */
export const canEditAddress = (userRole) => {
  // Only admins and guests can edit addresses (guests can only edit their own in the UI)
  const isAdminResult = isAdmin(userRole);
  const isSuperAdminResult = isSuperAdmin(userRole);
  const isGuestResult = isGuest(userRole);
  
  return isAdminResult || isSuperAdminResult || isGuestResult;
};

/**
 * Check if the LinkedIn section should be visible
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the LinkedIn section should be visible
 */
export const showLinkedIn = (userRole) => {
  return isAdmin(userRole) || isRecruiter(userRole) || isHR(userRole) || 
         isTeacher(userRole) || isStudent(userRole) || isGuest(userRole) || isSuperAdmin(userRole);
};

/**
 * Check if the user can edit academic information
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user can edit academic information
 */
export const canEditAcademic = (userRole) => {
  return isAdmin(userRole) || isStudent(userRole) || isGuest(userRole) || isSuperAdmin(userRole);
};

/**
 * Check if the user can edit portfolio URL
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the user can edit portfolio URL
 */
export const canEditPortfolioUrl = (userRole) => {
  return isStudent(userRole) || isAdmin(userRole) || isSuperAdmin(userRole);
};

/**
 * Check if the portfolio URL section should be visible
 * @param {Array|string} userRole - The user's role(s)
 * @returns {boolean} - Whether the portfolio URL section should be visible
 */
export const showPortfolioUrl = (userRole) => {
  return isStudent(userRole) || isAdmin(userRole) || isTeacher(userRole) || isHR(userRole) || isSuperAdmin(userRole);
}; 