import apiService from '@/lib/services/apiService';

class ProfileService {
  async getUserProfile() {
    try {
      const response = await apiService.get('/api/profil/user-data');
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
        return response.data;
      }
      
      // Otherwise use the regular profile update endpoint
      const response = await apiService.put('/api/profile', profileData);
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
      const response = await apiService.get('/api/profil/consolidated');
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
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  async updateAddress(addressData) {
    try {
      const response = await apiService.put('/api/profil/address', addressData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const profileService = new ProfileService(); 