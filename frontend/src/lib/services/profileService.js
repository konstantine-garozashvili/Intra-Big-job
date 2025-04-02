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
      const response = await apiService.get('/api/profile', options);
      
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
      const response = await apiService.put('/api/profile', data);
      return response.data;
    } catch (error) {
      console.error(`Error updating profile field ${field}:`, error);
      throw error;
    }
  },

  async getProfile(options = {}) {
    try {
      const response = await apiService.get('/api/profile', options);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(data = {}) {
    try {
      const response = await apiService.put('/api/profile', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProfilePicture() {
    try {
      const response = await apiService.get('/api/profile/picture');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      
      const response = await apiService.post('/api/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteProfilePicture() {
    try {
      const response = await apiService.delete('/api/profile/picture');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProfileStats() {
    try {
      const response = await apiService.get('/api/profile/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProfileDiplomas() {
    try {
      const response = await apiService.get('/api/profile/diplomas');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProfileAddresses() {
    try {
      const response = await apiService.get('/api/profile/addresses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateProfileAddress(addressData) {
    try {
      const response = await apiService.put('/api/profile/address', addressData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getConsolidatedProfile() {
    try {
      const response = await apiService.get('/api/profile/consolidated');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 