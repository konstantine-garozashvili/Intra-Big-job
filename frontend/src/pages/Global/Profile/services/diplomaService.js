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

/**
 * Service for managing user diplomas
 */
class DiplomaService {
  /**
   * Get all available diplomas
   * @returns {Promise<Object>} The response data
   */
  async getAvailableDiplomas() {
    try {
      const response = await apiService.get('/api/user-diplomas/available');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all diplomas for the current user
   * @returns {Promise<Object>} The response data
   */
  async getUserDiplomas() {
    try {
      const response = await apiService.get('/api/user-diplomas');
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
  async addDiploma(diplomaData) {
    try {
      const response = await apiService.post('/api/user-diplomas', diplomaData);
      
      // Notify subscribers about the update
      diplomaEvents.notify();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a user diploma
   * @param {number} id - The ID of the user diploma
   * @param {Object} diplomaData - The updated diploma data
   * @returns {Promise<Object>} The response data
   */
  async updateDiploma(id, diplomaData) {
    try {
      const response = await apiService.put(`/api/user-diplomas/${id}`, diplomaData);
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
  async deleteDiploma(id) {
    try {
      const response = await apiService.delete(`/api/user-diplomas/${id}`);
      
      // Notify subscribers about the update
      diplomaEvents.notify();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const diplomaService = new DiplomaService();
export { diplomaService };
export default diplomaService; 