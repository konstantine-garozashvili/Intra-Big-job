import apiService from '@/lib/services/apiService';
import { profilePictureEvents } from '../hooks/useProfilePicture';

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
      
      const response = await apiService.get('/api/profil/user-data');
      
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
        const response = await apiService.put('/api/student/profile/portfolio-url', {
          portfolioUrl: profileData.portfolioUrl
        });
        
        // Invalider le cache après une mise à jour
        this.invalidateCache();
        
        return response.data;
      }
      
      // Otherwise use the regular profile update endpoint
      const response = await apiService.put('/api/profile', profileData);
      
      // Invalider le cache après une mise à jour
      this.invalidateCache();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDiplomas() {
    try {
      const response = await apiService.get('/api/profil/diplomas');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAddresses() {
    try {
      const response = await apiService.get('/api/profil/addresses');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await apiService.get('/api/profil/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAllProfileData() {
    try {
      // Vérifier si les données sont en cache et toujours valides
      const now = Date.now();
      if (profileCache.consolidatedData && 
          (now - profileCache.consolidatedDataTimestamp) < profileCache.cacheDuration) {
        return profileCache.consolidatedData;
      }
      
      const response = await apiService.get('/api/profil/consolidated');
      
      // Mettre en cache les données
      profileCache.consolidatedData = response.data;
      profileCache.consolidatedDataTimestamp = now;
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get public profile by user ID
  async getPublicProfile(userId) {
    if (!userId) {
      throw new Error('User ID is required to fetch public profile');
    }
    
    try {
      const response = await apiService.get(`/api/profil/public/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Profile picture methods
  async getProfilePicture() {
    try {
      const response = await apiService.get('/api/profile/picture');
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      
      const response = await apiService.post('/api/profile/picture', formData, {
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
      const response = await apiService.delete(`/api/profile/picture?t=${timestamp}`);
      
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
      const response = await apiService.put('/api/profil/address', addressData);
      
      // Invalider le cache après une mise à jour
      this.invalidateCache();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Méthode pour invalider le cache
  invalidateCache() {
    profileCache.userData = null;
    profileCache.userDataTimestamp = 0;
    profileCache.consolidatedData = null;
    profileCache.consolidatedDataTimestamp = 0;
  }
}

export const profileService = new ProfileService(); 