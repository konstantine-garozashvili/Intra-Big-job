/**
 * Utility functions for profile-related operations
 */

/**
 * Generates a complete URL for a profile picture path
 * @param {string|null} picturePath - The profile picture path from the API
 * @returns {string|null} - The complete URL or null if no path is provided
 */
export const getProfilePictureUrl = (picturePath) => {
  console.log('Profile picture path:', picturePath);
  
  if (!picturePath) {
    console.log('No profile picture path provided');
    return null;
  }
  
  // If the path already starts with http, it's already a complete URL
  if (picturePath.startsWith('http')) {
    console.log('Path is already a complete URL');
    return picturePath;
  }
  
  // Get the API base URL from environment variables
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const apiBaseUrl = baseUrl.replace(/\/api$/, ''); // Remove /api if it exists at the end
  console.log('API Base URL:', apiBaseUrl);
  
  // If the path is just a filename (no slashes or backslashes)
  if (!picturePath.includes('/') && !picturePath.includes('\\')) {
    console.log('Path is just a filename:', picturePath);
    // Try different possible locations
    const possibleUrls = [
      `${apiBaseUrl}/uploads/documents/${picturePath}`,
      `${apiBaseUrl}/uploads/profile-pictures/${picturePath}`,
      `${apiBaseUrl}/uploads/${picturePath}`
    ];
    
    console.log('Trying these URLs:', possibleUrls);
    
    // Return the first URL (we'll try them all in the component)
    return possibleUrls[0];
  }
  
  // Handle local file paths (which might be absolute paths)
  if (picturePath.includes('/var/www/') || picturePath.includes('C:\\') || picturePath.includes('/public/uploads/')) {
    console.log('Path appears to be a local file path');
    
    // Extract the relevant part of the path
    let relativePath;
    
    if (picturePath.includes('/public/uploads/')) {
      // Extract the path after /public/
      relativePath = picturePath.split('/public/')[1];
      console.log('Extracted relative path from public directory:', relativePath);
    } else if (picturePath.includes('/var/www/')) {
      // Extract the path after /var/www/html/ or similar
      const parts = picturePath.split('/var/www/');
      const afterVarWww = parts[1];
      // Skip the first directory (usually html or the project name)
      const pathParts = afterVarWww.split('/');
      relativePath = pathParts.slice(1).join('/');
      console.log('Extracted relative path from /var/www/:', relativePath);
    } else {
      // Extract the filename from the path for Windows paths
      const parts = picturePath.split('\\');
      // Look for 'uploads' directory in the path
      const uploadsIndex = parts.findIndex(part => part === 'uploads');
      if (uploadsIndex !== -1) {
        relativePath = 'uploads/' + parts.slice(uploadsIndex + 1).join('/');
      } else {
        relativePath = 'uploads/' + parts[parts.length - 1];
      }
      console.log('Extracted relative path from Windows path:', relativePath);
    }
    
    // Construct URL with the relative path
    const fullUrl = `${apiBaseUrl}/${relativePath}`;
    console.log('Constructed profile picture URL from local path:', fullUrl);
    return fullUrl;
  }
  
  // Ensure the path starts with a slash
  const normalizedPath = picturePath.startsWith('/') ? picturePath : `/${picturePath}`;
  
  // If the path includes 'uploads', it's likely a file path
  if (normalizedPath.includes('uploads')) {
    const fullUrl = `${apiBaseUrl}${normalizedPath}`;
    console.log('Constructed profile picture URL with uploads path:', fullUrl);
    return fullUrl;
  }
  
  // If the path doesn't include 'uploads', it might be a relative path to the API
  const fullUrl = `${apiBaseUrl}/uploads/${normalizedPath}`;
  console.log('Constructed profile picture URL with default path:', fullUrl);
  return fullUrl;
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