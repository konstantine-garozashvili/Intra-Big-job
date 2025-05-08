/**
 * Utilitaires pour la gestion des réponses API
 */

export const ApiResponse = {
  success: (data) => ({ success: true, data }),
  error: (message) => ({ success: false, message })
};

/**
 * Gère la réponse de l'API de manière standardisée
 * @param {Object} response - Réponse de l'API
 * @returns {Object} Données normalisées
 * @throws {Error} Si la réponse n'est pas valide
 */
export const handleApiResponse = (response) => {
  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Erreur serveur');
  }
  return response.data.data;
};

/**
 * Standardizes API response data structure
 * @param {Object} response - Raw API response
 * @returns {Object} Standardized data object
 */
export const normalizeResponse = (response) => {
  if (!response) return null;

  // Handle standard response format
  if (response.success && response.data) {
    return response.data;
  }

  // Handle direct data format
  if (response.data) {
    return response.data;
  }

  // Handle array format
  if (Array.isArray(response)) {
    return response;
  }

  // Return raw response as fallback
  return response;
};

/**
 * Cleans and standardizes image URLs
 * @param {string} imageUrl - Raw image URL
 * @returns {string|null} Cleaned image URL
 */
export const cleanImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Decode URL to prevent double encoding
  const decodedUrl = decodeURIComponent(imageUrl);

  // Return decoded URL if it's already a full URL
  if (decodedUrl.startsWith('http')) {
    return decodedUrl;
  }

  // Return null for invalid URLs
  return null;
};

/**
 * Handles API errors consistently
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 * @returns {string} Error message to display
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'Une erreur est survenue';
}; 