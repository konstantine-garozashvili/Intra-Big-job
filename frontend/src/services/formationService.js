import axios from 'axios';
import apiService from '../lib/services/apiService';

const API_URL = '/api/formations';

const formationService = {
  // Get all formations
  getAllFormations: async () => {
    try {
      const response = await apiService.get(API_URL);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw error;
    }
  },

  // Get formation by ID
  getFormation: async (id) => {
    try {
      const response = await apiService.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new formation
  createFormation: async (formationData) => {
    try {
      const response = await apiService.post(API_URL, formationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update formation
  updateFormation: async (id, formationData) => {
    try {
      const response = await apiService.put(`${API_URL}/${id}`, formationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete formation
  deleteFormation: async (id) => {
    try {
      await apiService.delete(`${API_URL}/${id}`);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default formationService; 