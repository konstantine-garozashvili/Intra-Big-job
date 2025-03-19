import apiService from './apiService';

/**
 * Service pour gérer les signatures
 */
const signatureService = {
  /**
   * Récupère les signatures de l'utilisateur
   * @returns {Promise<Array>} Liste des signatures
   */
  getSignatures: async () => {
    try {
      const response = await apiService.get('/api/signatures');
      return response.signatures;
    } catch (error) {
      console.error('Erreur lors de la récupération des signatures:', error);
      throw error;
    }
  },

  /**
   * Récupère les signatures du jour
   * @returns {Promise<Object>} Données des signatures du jour
   */
  getTodaySignatures: async () => {
    try {
      const response = await apiService.get('/api/signatures/today');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des signatures du jour:', error);
      throw error;
    }
  }
};

export default signatureService; 