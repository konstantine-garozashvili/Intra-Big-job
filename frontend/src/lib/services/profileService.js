import { apiService } from './apiService';

/**
 * Service pour gérer les profils utilisateurs
 */
export const profileService = {
  /**
   * Récupérer les données du profil utilisateur
   * @param {Object} options - Options de requête
   * @returns {Promise<Object>} Données du profil
   */
  async getProfileData(options = {}) {
    try {
      const response = await apiService.get('/profile', options);
      
      // Debug: check for linkedinUrl in response
      console.log('profileService.getProfileData - Response data:', {
        hasLinkedinUrl: response.data.hasOwnProperty('linkedinUrl'),
        linkedinUrl: response.data.linkedinUrl,
        fields: Object.keys(response.data)
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching profile data:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour les données du profil
   * @param {string} field - Le champ à mettre à jour
   * @param {any} value - La nouvelle valeur
   * @returns {Promise<Object>} Réponse de l'API
   */
  async updateProfileField(field, value) {
    try {
      // For LinkedIn URL, ensure we have a valid value
      if (field === 'linkedinUrl') {
        console.log('profileService.updateProfileField - Updating LinkedIn URL:', { value });
        
        // Ensure we're not sending undefined
        if (value === undefined) {
          value = '';
        }
      }
      
      const data = { [field]: value };
      const response = await apiService.put('/profile', data);
      return response.data;
    } catch (error) {
      console.error(`Error updating profile field ${field}:`, error);
      throw error;
    }
  },
}; 