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
  },

  /**
   * Crée une nouvelle signature
   * @param {Object} data - Données de la signature (location, drawing)
   * @returns {Promise<Object>} Réponse du serveur
   */
  createSignature: async (data) => {
    try {
      const response = await apiService.post('/api/signatures', data);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la signature:', error);
      throw error;
    }
  },

  /**
   * Récupère les absents d'une formation pour une date/période
   * @param {number} formationId
   * @param {Object} options {date, period}
   * @returns {Promise<Object>} Réponse de l'API
   */
  getAbsencesByFormation: async (formationId, { date, period } = {}) => {
    try {
      let url = `/api/signatures/absences/formation/${formationId}`;
      const params = [];
      if (date) params.push(`date=${encodeURIComponent(date)}`);
      if (period) params.push(`period=${encodeURIComponent(period)}`);
      if (params.length) url += `?${params.join('&')}`;
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des absences de la formation:', error);
      throw error;
    }
  },

  /**
   * Récupère les absences d'un utilisateur (élève) pour une formation/date/période
   * @param {number} userId
   * @param {Object} options {formationId, date, period}
   * @returns {Promise<Object>} Réponse de l'API
   */
  getAbsencesByUser: async (userId, { formationId, date, period } = {}) => {
    try {
      let url = `/api/signatures/absences/user/${userId}`;
      const params = [];
      if (formationId) params.push(`formationId=${encodeURIComponent(formationId)}`);
      if (date) params.push(`date=${encodeURIComponent(date)}`);
      if (period) params.push(`period=${encodeURIComponent(period)}`);
      if (params.length) url += `?${params.join('&')}`;
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des absences de l\'utilisateur:', error);
      throw error;
    }
  }
};

export default signatureService; 