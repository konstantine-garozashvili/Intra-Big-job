/**
 * Utility functions for handling user roles and permissions
 */

/**
 * Check if the user is an admin
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user is an admin
 */
export const isAdmin = (userRole) => {
  return userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN' ||
         userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' ||
         userRole === 'SUPERADMIN';
};

/**
 * Check if the user is a recruiter
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user is a recruiter
 */
export const isRecruiter = (userRole) => {
  return userRole === 'ROLE_RECRUITER';
};

/**
 * Check if the user is an HR
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user is an HR
 */
export const isHR = (userRole) => {
  return userRole === 'ROLE_HR';
};

/**
 * Check if the user is a teacher
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user is a teacher
 */
export const isTeacher = (userRole) => {
  return userRole === 'ROLE_TEACHER';
};

/**
 * Check if the user is a student
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user is a student
 */
export const isStudent = (userRole) => {
  return userRole === 'ROLE_STUDENT';
};

/**
 * Check if the user is a guest
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user is a guest
 */
export const isGuest = (userRole) => {
  // console.log('isGuest called with:', userRole);
  const result = userRole === 'ROLE_GUEST' || userRole === 'GUEST';
  // console.log('isGuest result:', result);
  return result;
};

/**
 * Check if the user can edit personal information
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user can edit personal information
 */
export const canEditPersonalInfo = (userRole) => {
  return isAdmin(userRole) || isRecruiter(userRole) || isHR(userRole) || 
         isTeacher(userRole) || isStudent(userRole) || isGuest(userRole);
};

/**
 * Check if a specific field is editable by the user
 * @param {string} userRole - The user's role
 * @param {string} fieldName - The name of the field
 * @returns {boolean} - Whether the field is editable
 */
export const isFieldEditable = (userRole, fieldName) => {
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
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user can edit address information
 */
export const canEditAddress = (userRole) => {
  return isAdmin(userRole) || userRole === 'ROLE_SUPER_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
};

/**
 * Check if the LinkedIn section should be visible
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the LinkedIn section should be visible
 */
export const showLinkedIn = (userRole) => {
  return isAdmin(userRole) || isRecruiter(userRole) || isHR(userRole) || 
         isTeacher(userRole) || isStudent(userRole) || isGuest(userRole);
};

/**
 * Check if the user can edit academic information
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user can edit academic information
 */
export const canEditAcademic = (userRole) => {
  return isAdmin(userRole) || isStudent(userRole) || isGuest(userRole);
};

/**
 * Check if the user can edit portfolio URL
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the user can edit portfolio URL
 */
export const canEditPortfolioUrl = (userRole) => {
  return isStudent(userRole) || isAdmin(userRole);
};

/**
 * Check if the portfolio URL section should be visible
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether the portfolio URL section should be visible
 */
export const showPortfolioUrl = (userRole) => {
  return isStudent(userRole) || isAdmin(userRole) || isTeacher(userRole) || isHR(userRole);
}; 