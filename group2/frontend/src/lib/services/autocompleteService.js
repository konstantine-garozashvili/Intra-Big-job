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
    ROLE_DISPLAY_MAP[alias] = ROLES[role] || (role === 'SUPERADMIN' ? 'ROLE_SUPERADMIN' : null);
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
      
      // Vérifier le rôle de l'utilisateur actuel
      const currentUser = await authService.getCurrentUser();
      const userRoles = currentUser?.roles || [];
      
      const isSuperAdmin = userRoles.includes(ROLES.SUPERADMIN);
      const isAdmin = userRoles.includes(ROLES.ADMIN) && !isSuperAdmin;
      const isTeacher = userRoles.includes(ROLES.TEACHER) && !isSuperAdmin && !isAdmin;
      const isHR = userRoles.includes(ROLES.HR) && !isSuperAdmin && !isAdmin;
      const isRecruiter = userRoles.includes(ROLES.RECRUITER) && !isSuperAdmin && !isAdmin && !isTeacher && !isHR;

      // Check if this might be a role-based search using the centralized function
      const matchResult = matchRoleFromSearchTerm(query);
      const isRoleSearch = !!matchResult;
      
      // Vérifier les restrictions de rôle selon le rôle de l'utilisateur
      if (isRoleSearch) {
        const searchedRole = matchResult.role.toUpperCase();
        
        // Si c'est un admin, il ne peut pas chercher les superadmins
        if (isAdmin && (searchedRole === 'SUPER_ADMIN' || searchedRole === 'SUPERADMIN')) {
          return [];
        }
        
        // Si c'est un teacher, il ne peut chercher que STUDENT et HR
        if (isTeacher && searchedRole !== 'STUDENT' && searchedRole !== 'HR') {
          return [];
        }
        
        // Si c'est un RH, il ne peut chercher que TEACHER, STUDENT et RECRUITER
        if (isHR && searchedRole !== 'TEACHER' && searchedRole !== 'STUDENT' && searchedRole !== 'RECRUITER') {
          return [];
        }
        
        // Si c'est un recruteur, il ne peut chercher que TEACHER et STUDENT
        if (isRecruiter && searchedRole !== 'TEACHER' && searchedRole !== 'STUDENT') {
          return [];
        }
      }
      
      let roleConstant = null;
      if (isRoleSearch) {
        // Gérer explicitement le cas du SUPERADMIN/SUPER_ADMIN pour la recherche
        if (matchResult.role === 'SUPERADMIN' || matchResult.role === 'SUPER_ADMIN') {
          roleConstant = ROLES.SUPERADMIN;
        } else {
          roleConstant = ROLES[matchResult.role];
        }
      }
      
      // Perform a GET request to the /user-autocomplete endpoint with the query parameter.
      const response = await apiService.get('/user-autocomplete', { params: { q: query } });
      
      // If no results and this was a role search, try with alternative role names
      if (isRoleSearch && (!response || response.length === 0)) {
        let alternativeQueries = [];
        
        // Try with the original role name (without underscore)
        if (matchResult.role.includes('_')) {
          alternativeQueries.push(matchResult.role.replace('_', ''));
        }
        
        // Try with the role name in both forms
        if (matchResult.role === 'SUPERADMIN') {
          alternativeQueries.push('SUPER_ADMIN');
          alternativeQueries.push('super admin');
        } else if (matchResult.role === 'SUPER_ADMIN') {
          alternativeQueries.push('SUPERADMIN');
          alternativeQueries.push('superadmin');
        }
        
        // Try with the first alias of the role
        const aliasesForRole = ROLE_ALIASES[matchResult.role];
        if (aliasesForRole && aliasesForRole.length > 0) {
          alternativeQueries.push(aliasesForRole[0]);
        }
        
        // Try with each alternative query
        for (const alternativeQuery of alternativeQueries) {
          const alternativeResponse = await apiService.get('/user-autocomplete', { 
            params: { q: alternativeQuery } 
          });
          
          if (alternativeResponse && alternativeResponse.length > 0) {
            return alternativeResponse;
          }
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
