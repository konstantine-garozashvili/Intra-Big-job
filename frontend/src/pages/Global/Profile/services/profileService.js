import apiService from '@/lib/services/apiService';
import { profilePictureEvents } from '../hooks/useProfilePicture';
import userDataManager from '@/lib/services/userDataManager';

// Cache local pour les données fréquemment utilisées
const profileCache = {
  userData: null,
  userDataTimestamp: 0,
  consolidatedData: null,
  consolidatedDataTimestamp: 0,
  // Durée de validité du cache en ms (2 minutes)
  cacheDuration: 2 * 60 * 1000
};

class ProfileService {
  async getUserProfile() {
    try {
      // Vérifier si les données sont en cache et toujours valides
      const now = Date.now();
      if (profileCache.userData && 
          (now - profileCache.userDataTimestamp) < profileCache.cacheDuration) {
        return profileCache.userData;
      }
      
      const response = await apiService.get('/profile/user-data');
      
      // Mettre en cache les données
      profileCache.userData = response.data;
      profileCache.userDataTimestamp = now;
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      // If portfolioUrl is present, use the student profile endpoint
      if (profileData.portfolioUrl !== undefined) {
        const response = await apiService.put('/student/profile/portfolio-url', {
          portfolioUrl: profileData.portfolioUrl
        });
        
        // Invalider le cache après une mise à jour
        this.invalidateCache();
        
        return response.data;
      }
      
      // Otherwise use the regular profile update endpoint
      const response = await apiService.put('/profile', profileData);
      
      // Invalider le cache après une mise à jour
      this.invalidateCache();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDiplomas() {
    try {
      const response = await apiService.get('/profile/diplomas');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAddresses() {
    try {
      const response = await apiService.get('/profile/addresses');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await apiService.get('/profile/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Récupère toutes les données de profil consolidées
   * @param {Object} options - Options de récupération
   * @param {boolean} options.forceRefresh - Force une nouvelle requête
   * @returns {Promise<Object>} - Données de profil
   */
  async getAllProfileData(options = {}) {
    try {
      // Utiliser le gestionnaire centralisé des données utilisateur
      const data = await userDataManager.getUserData({
        routeKey: '/profile/consolidated',
        forceRefresh: options.forceRefresh,
        useCache: !options.forceRefresh
      });
      
      // Mettre également à jour le cache local pour la compatibilité
      profileCache.consolidatedData = data;
      profileCache.consolidatedDataTimestamp = Date.now();
      
      return data;
    } catch (error) {
      console.warn('Erreur lors de la récupération des données de profil:', error);
      
      // FALLBACK: Essayer d'utiliser les données en cache local si disponibles
      if (profileCache.consolidatedData) {
        return profileCache.consolidatedData;
      }
      
      // Sinon, récupérer les données depuis localStorage
      try {
        // Utiliser directement la méthode getCachedUserData de userDataManager
        const cachedData = userDataManager.getCachedUserData();
        if (cachedData) {
          return cachedData;
        }
      } catch (e) {
        console.error('Erreur lors de la récupération des données en cache:', e);
      }
      
      // Si tout échoue, lancer l'erreur
      throw error;
    }
  }
  
  // Get public profile by user ID
  async getPublicProfile(userId) {
    if (!userId) {
      throw new Error('User ID is required to fetch public profile');
    }
    
    try {
      const response = await apiService.get(`/profile/public/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Profile picture methods
  async getProfilePicture() {
    try {
      const response = await apiService.get('/profile/picture');
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      
      const response = await apiService.post('/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Invalider le cache après une mise à jour
      this.invalidateCache();
      
      // Notifier tous les composants abonnés
      profilePictureEvents.notify();
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  async deleteProfilePicture() {
    try {
      // Ajouter un timestamp pour éviter les problèmes de cache
      const timestamp = new Date().getTime();
      const response = await apiService.delete(`/profile/picture?t=${timestamp}`);
      
      // Invalider le cache après une mise à jour
      this.invalidateCache();
      
      // Notifier tous les composants abonnés
      profilePictureEvents.notify();
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  async updateAddress(addressData) {
    try {
      const response = await apiService.put('/profile/address', addressData);
      
      // Invalider le cache après une mise à jour
      this.invalidateCache();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Invalide le cache des données de profil
   */
  invalidateCache() {
    profileCache.userData = null;
    profileCache.userDataTimestamp = 0;
    profileCache.consolidatedData = null;
    profileCache.consolidatedDataTimestamp = 0;
    
    // Invalider également le cache centralisé
    userDataManager.invalidateCache();
  }
}

export const profileService = new ProfileService();
export default profileService; 