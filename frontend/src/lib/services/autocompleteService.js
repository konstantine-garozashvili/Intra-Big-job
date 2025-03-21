import apiService from './apiService';
import authService from './authService';
import { ROLES } from '../../features/roles/roleContext';
import { matchRoleFromSearchTerm, ROLE_ALIASES } from '../utils/roleUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Map of role constants to their corresponding role values
// This is used for backward compatibility
const ROLE_DISPLAY_MAP = {};

// Populate the role display map from the ROLE_ALIASES
Object.entries(ROLE_ALIASES).forEach(([role, aliases]) => {
  aliases.forEach(alias => {
    ROLE_DISPLAY_MAP[alias] = ROLES[role];
  });
});

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
      // Vérifier si l'utilisateur est connecté
      if (!authService.isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer une recherche.');
      }
      
      // Check if this might be a role-based search using the centralized function
      const matchResult = matchRoleFromSearchTerm(query);
      const isRoleSearch = !!matchResult;
      
      if (isRoleSearch) {
        const roleConstant = ROLES[matchResult.role];
      }
      
      // Perform a GET request to the /user-autocomplete endpoint with the query parameter.
      const response = await apiService.get('/user-autocomplete', { params: { q: query } });
      
      // If no results and this was a role search, try with the original role name
      if (isRoleSearch && (!response || response.length === 0)) {
        // Try with the original role name (without underscore)
        const originalRoleName = matchResult.role.replace('_', '');
        
        // Make a second request with the modified role name
        const secondResponse = await apiService.get('/user-autocomplete', { params: { q: originalRoleName } });
        
        if (secondResponse && secondResponse.length > 0) {
          return secondResponse;
        }
      }
      
      // Assuming the API returns an array of suggestions, return the response directly.
      return response;
    } catch (error) {
      // Gérer spécifiquement les erreurs d'authentification (401)
      if (error.response && error.response.status === 401) {
        // Rediriger vers la page de connexion si nécessaire
        // window.location.href = '/login';
      }
      
      throw error;
    }
  }
};

export default userAutocompleteService;
