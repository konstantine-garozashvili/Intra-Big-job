import axiosInstance from '@/lib/axios';

/**
 * Service pour gérer les profils étudiants
 */
export const studentProfileService = {
  /**
   * Récupère le profil de l'étudiant connecté
   * @returns {Promise} - Promesse contenant le profil étudiant
   */
  getMyProfile: async () => {
    try {
      const response = await axiosInstance.get('/student/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour le statut de recherche d'emploi
   * @param {Object} data - Données à mettre à jour (isSeekingInternship, isSeekingApprenticeship)
   * @returns {Promise} - Promesse contenant le profil mis à jour
   */
  updateJobSeekingStatus: async (data) => {
    try {
      // Valider les données avant l'envoi
      const validData = {};
      if (typeof data.isSeekingInternship === 'boolean') {
        validData.isSeekingInternship = data.isSeekingInternship;
      }
      if (typeof data.isSeekingApprenticeship === 'boolean') {
        validData.isSeekingApprenticeship = data.isSeekingApprenticeship;
      }
      
      const response = await axiosInstance.patch('/student/profile/job-seeking-status', validData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bascule le statut de recherche de stage
   * @returns {Promise} - Promesse contenant le profil mis à jour
   */
  toggleInternshipSeeking: async () => {
    try {
      const response = await axiosInstance.patch('/student/profile/toggle-internship-seeking');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bascule le statut de recherche d'alternance
   * @returns {Promise} - Promesse contenant le profil mis à jour
   */
  toggleApprenticeshipSeeking: async () => {
    try {
      const response = await axiosInstance.patch('/student/profile/toggle-apprenticeship-seeking');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 