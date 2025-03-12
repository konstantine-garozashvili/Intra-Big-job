import apiService from './apiService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Service for fetching user autocomplete suggestions
 */
export const userAutocompleteService = {
  /**
   * Retrieves autocomplete suggestions for users based on the provided query.
   * @param {string} query - The search query.
   * @returns {Promise<Array>} - An array of user suggestion objects.
   */
  async getSuggestions(query) {
    try {
      console.log('[userAutocompleteService] Fetching suggestions for query:', query);
      
      // Perform a GET request to the /user-autocomplete endpoint with the query parameter.
      const response = await apiService.get('/user-autocomplete', { params: { q: query } });
      
      console.log('[userAutocompleteService] Fetched suggestions:', response);
      
      // Assuming the API returns an array of suggestions, return the response directly.
      return response;
    } catch (error) {
      console.error('[userAutocompleteService] Error fetching suggestions:', error);
      console.error('[userAutocompleteService] Error details:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default userAutocompleteService;
