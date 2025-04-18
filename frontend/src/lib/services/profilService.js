import apiService from './apiService';

/**
 * Service pour gérer les données du profil
 */
const profilService = {
  /**
   * Récupère les données utilisateur pour le profil
   * @returns {Promise<Object>} Les données de l'utilisateur
   */
  getUserData: async () => {
    try {
      const response = await apiService.get('/api/profile/user-data');
      return response.data.data.user;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      throw error;
    }
  },

  /**
   * Récupère la liste des diplômes de l'utilisateur
   * @returns {Promise<Array>} Liste des diplômes
   */
  getUserDiplomas: async () => {
    try {
      const response = await apiService.get('/api/profile/diplomas');
      return response.data.data.diplomas;
    } catch (error) {
      console.error('Erreur lors de la récupération des diplômes:', error);
      throw error;
    }
  },

  /**
   * Récupère la liste des adresses de l'utilisateur
   * @returns {Promise<Array>} Liste des adresses
   */
  getUserAddresses: async () => {
    try {
      const response = await apiService.get('/api/profile/addresses');
      return response.data.data.addresses;
    } catch (error) {
      console.error('Erreur lors de la récupération des adresses:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques de l'utilisateur
   * @returns {Promise<Object>} Statistiques utilisateur
   */
  getUserStats: async () => {
    try {
      const response = await apiService.get('/api/profile/stats');
      return response.data.data.stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  /**
   * Récupère toutes les données du profil en une seule requête
   * @returns {Promise<Object>} Toutes les données du profil normalisées
   */
  getAllProfilData: async () => {
    try {
      const response = await apiService.get('/api/profile/all');
      
      // Normalisation des données pour garantir une structure cohérente
      let normalizedData = {};
      
      if (response && response.data) {
        const data = response.data.data;
        
        // Si la structure est data.user
        if (data.user) {
          normalizedData = {
            ...data.user,
            // S'assurer que addresses est toujours un tableau
            addresses: Array.isArray(data.user.addresses) ? data.user.addresses : [],
            // S'assurer que diplomas est toujours un tableau
            diplomas: Array.isArray(data.user.diplomas) ? data.user.diplomas : 
                     (Array.isArray(data.diplomas) ? data.diplomas : []),
            // Récupérer les stats
            stats: data.stats || { profile: { completionPercentage: 0 } }
          };
        } 
        // Si la structure est data directement
        else {
          normalizedData = {
            ...data,
            addresses: Array.isArray(data.addresses) ? data.addresses : [],
            diplomas: Array.isArray(data.diplomas) ? data.diplomas : [],
            stats: data.stats || { profile: { completionPercentage: 0 } }
          };
        }
        
        // S'assurer que studentProfile existe même si vide
        if (!normalizedData.studentProfile) {
          normalizedData.studentProfile = {
            portfolioUrl: null,
            isSeekingInternship: false,
            isSeekingApprenticeship: false,
            currentInternshipCompany: null,
            internshipStartDate: null,
            internshipEndDate: null,
            situationType: null
          };
        }
      }
      
      // Stocker en localStorage pour la persistance
      try {
        localStorage.setItem('user', JSON.stringify(normalizedData));
      } catch (e) {
        console.error('Error storing user data in localStorage:', e);
      }
      
      return normalizedData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données du profil:', error);
      
      // En cas d'échec, on essaie de récupérer depuis le localStorage
      try {
        const localData = localStorage.getItem('user');
        if (localData) {
          return JSON.parse(localData);
        }
      } catch (e) {
        console.error('Error getting user data from localStorage:', e);
      }
      
      // Si le fallback localStorage échoue, essayer de récupérer les données individuellement
      try {
        const [user, diplomas, addresses, stats] = await Promise.all([
          profilService.getUserData(),
          profilService.getUserDiplomas(),
          profilService.getUserAddresses(),
          profilService.getUserStats()
        ]);

        const fallbackData = {
          ...user,
          diplomas,
          addresses,
          stats
        };
        
        try {
          localStorage.setItem('user', JSON.stringify(fallbackData));
        } catch (e) {
          console.error('Error storing fallback user data in localStorage:', e);
        }
        
        return fallbackData;
      } catch (fallbackError) {
        console.error('Échec du fallback pour récupérer les données:', fallbackError);
        throw error; // Renvoyer l'erreur originale
      }
    }
  },
  
  /**
   * Désactive le compte de l'utilisateur connecté
   * @returns {Promise<Object>} Résultat de l'opération
   */
  deactivateAccount: async () => {
    try {
      const response = await apiService.post('/api/profile/deactivate');
      return response;
    } catch (error) {
      console.error('Erreur lors de la désactivation du compte:', error);
      throw error;
    }
  },
  
  /**
   * Récupère le statut actuel de l'utilisateur connecté
   * @returns {Promise<Object>} Informations sur le statut
   */
  getCurrentStatus: async () => {
    try {
      const response = await apiService.get('/api/profile/status');
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      throw error;
    }
  }
};

export default profilService; 