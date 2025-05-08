import apiService from '@/lib/services/apiService';

// Simple event emitter for diploma updates
export const diplomaEvents = {
  listeners: new Set(),
  
  // Subscribe to diploma updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  // Notify all subscribers about diploma updates
  notify() {
    this.listeners.forEach(callback => callback());
  }
};

// Cache management for diplomas
const diplomaCache = {
  clearUserDiplomas() {
    localStorage.removeItem('user_diplomas_cache');
  },
  
  clearAvailableDiplomas() {
    localStorage.removeItem('available_diplomas_cache');
  },
  
  clearAll() {
    this.clearUserDiplomas();
    this.clearAvailableDiplomas();
  }
};

/**
 * Service for managing user diplomas
 */
class DiplomaService {
  /**
   * Get all available diplomas
   * @param {boolean} [bypassCache=true] - Whether to bypass any potential caching
   * @returns {Promise<Object>} The response data
   */
  async getAvailableDiplomas(bypassCache = true) {
    try {
      const url = bypassCache 
        ? `/api/user-diplomas/available?_=${Date.now()}` 
        : '/api/user-diplomas/available';
        
      const response = await apiService.get(url);
      
      // Always clear cache after fetching
      diplomaCache.clearAvailableDiplomas();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all diplomas for the current user
   * @param {boolean} [bypassCache=true] - Whether to bypass any potential caching
   * @returns {Promise<Object>} The response data
   */
  async getUserDiplomas(bypassCache = true) {
    try {
      const url = bypassCache 
        ? `/api/user-diplomas?_=${Date.now()}` 
        : '/api/user-diplomas';
        
      const response = await apiService.get(url);
      
      // Always clear cache after fetching
      diplomaCache.clearUserDiplomas();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add a diploma to the current user
   * @param {Object} diplomaData - The diploma data
   * @param {number} diplomaData.diplomaId - The ID of the diploma
   * @param {string} diplomaData.obtainedDate - The date the diploma was obtained (YYYY-MM-DD)
   * @returns {Promise<Object>} The response data
   */
  async addUserDiploma(diplomaData) {
    try {
      // Clear caches before operation
      diplomaCache.clearAll();
      
      const response = await apiService.post('/api/user-diplomas', diplomaData);
      
      // Notify subscribers about the update
      diplomaEvents.notify();
      
      // Force refetch after add
      this.getUserDiplomas(true).catch(() => {});
      this.getAvailableDiplomas(true).catch(() => {});
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a user diploma
   * @param {number} id - The ID of the user diploma
   * @returns {Promise<Object>} The response data
   */
  async deleteUserDiploma(id) {
    try {
      // Clear caches before operation
      diplomaCache.clearAll();
      
      const response = await apiService.delete(`/api/user-diplomas/${id}`);
      
      // Notify subscribers about the update
      diplomaEvents.notify();
      
      // Force refetch after delete
      this.getUserDiplomas(true).catch(() => {});
      this.getAvailableDiplomas(true).catch(() => {});
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const diplomaService = new DiplomaService(); 