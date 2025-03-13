import axios from 'axios';

// Utiliser une constante pour l'URL de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Créer une instance axios avec des configurations par défaut
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 secondes de timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Gérer les erreurs spécifiques (401, 403, etc.)
    if (error.response) {
      if (error.response.status === 401) {
        // Rediriger vers la page de connexion ou rafraîchir le token
        // Utiliser un système d'événements ou un contexte pour gérer cela
      }
    }
    return Promise.reject(error);
  }
);

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
      const response = await apiClient.get('/student/profile');
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
      
      const response = await apiClient.patch('/student/profile/job-seeking-status', validData);
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
      const response = await apiClient.patch('/student/profile/toggle-internship-seeking');
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
      const response = await apiClient.patch('/student/profile/toggle-apprenticeship-seeking');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 