/**
 * Utility functions for profile-related operations
 */

/**
 * Generates a complete URL for a profile picture path
 * @param {string|null} picturePath - The profile picture path from the API
 * @param {number|null} userId - The ID of the user whose profile picture we're getting
 * @returns {string|null} - The complete URL or null if no path is provided
 */
export const getProfilePictureUrl = (picturePath, userId = null) => {
  if (!picturePath) {
    return null;
  }
  
  // If the path already starts with http, it's already a complete URL
  if (picturePath.startsWith('http')) {
    return picturePath;
  }
  
  // Get the API base URL from environment variables
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const apiBaseUrl = baseUrl.replace(/\/api$/, ''); // Remove /api if it exists at the end
  
  // If we have a userId and the path doesn't include it, add it to the path
  if (userId && !picturePath.includes(`profile_${userId}_`)) {
    const pathParts = picturePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    picturePath = `profile_pictures/profile_${userId}_${fileName}`;
  }
  
  // If the path is just a filename (no slashes or backslashes)
  if (!picturePath.includes('/') && !picturePath.includes('\\')) {
    // Try different possible locations
    const possibleUrls = [
      `${apiBaseUrl}/uploads/documents/${picturePath}`,
      `${apiBaseUrl}/uploads/profile-pictures/${picturePath}`,
      `${apiBaseUrl}/uploads/${picturePath}`
    ];
    
    return possibleUrls[0];
  }
  
  // Handle local file paths (which might be absolute paths)
  if (picturePath.includes('/var/www/') || picturePath.includes('C:\\') || picturePath.includes('/public/uploads/')) {
    let relativePath;
    
    if (picturePath.includes('/public/uploads/')) {
      relativePath = picturePath.split('/public/')[1];
    } else if (picturePath.includes('/var/www/')) {
      const parts = picturePath.split('/var/www/');
      const afterVarWww = parts[1];
      const pathParts = afterVarWww.split('/');
      relativePath = pathParts.slice(1).join('/');
    } else {
      const parts = picturePath.split('\\');
      const uploadsIndex = parts.findIndex(part => part === 'uploads');
      if (uploadsIndex !== -1) {
        relativePath = 'uploads/' + parts.slice(uploadsIndex + 1).join('/');
      } else {
        relativePath = 'uploads/' + parts[parts.length - 1];
      }
    }
    
    return `${apiBaseUrl}/${relativePath}`;
  }
  
  // Ensure the path starts with a slash
  const normalizedPath = picturePath.startsWith('/') ? picturePath : `/${picturePath}`;
  
  // If the path includes 'uploads', it's likely a file path
  if (normalizedPath.includes('uploads')) {
    return `${apiBaseUrl}${normalizedPath}`;
  }
  
  // If the path doesn't include 'uploads', it might be a relative path to the API
  return `${apiBaseUrl}/uploads/${normalizedPath}`;
};

/**
 * Gets the initials from a user's first and last name
 * @param {Object} user - The user object with firstName and lastName properties
 * @returns {string} - The user's initials
 */
export const getUserInitials = (user) => {
  if (!user) return '';
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
}; 