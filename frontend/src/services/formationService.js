import axios from 'axios';
import apiService from '../lib/services/apiService';

const API_URL = '/api/formations';
const SPECIALIZATION_URL = '/api/specializations';

const formationService = {
  // Get all formations
  getAllFormations: async () => {
    try {
      console.log('Calling getAllFormations API...');
      const response = await apiService.get(API_URL);
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('Error in getAllFormations:', error);
      throw error;
    }
  },

  // Get formation by ID
  getFormation: async (id) => {
    try {
      console.log('Fetching formation with ID:', id);
      const response = await apiService.get(`${API_URL}/${id}`);
      console.log('Formation response:', response);
      
      // Si la réponse est une chaîne JSON, la parser
      if (typeof response === 'string') {
        return JSON.parse(response);
      }
      
      // Si la réponse est déjà un objet, le retourner directement
      return response;
    } catch (error) {
      console.error('Error in getFormation:', error);
      throw error;
    }
  },

  // Get all specializations
  getSpecializations: async () => {
    try {
      const response = await apiService.get(SPECIALIZATION_URL);
      return response.data || [];
    } catch (error) {
      console.error('Error in getSpecializations:', error);
      throw error;
    }
  },

  // Create new formation
  createFormation: async (formationData) => {
    try {
      const response = await apiService.post(API_URL, formationData);
      return response;
    } catch (error) {
      console.error('Error in createFormation:', error);
      throw error;
    }
  },

  // Update formation
  updateFormation: async (id, formationData) => {
    try {
      const response = await apiService.put(`${API_URL}/${id}`, formationData);
      return response;
    } catch (error) {
      console.error('Error in updateFormation:', error);
      throw error;
    }
  },

  // Delete formation
  deleteFormation: async (id) => {
    try {
      console.log('Deleting formation with ID:', id);
      const response = await apiService.delete(`${API_URL}/${id}`);
      console.log('Delete response:', response);
      return response;
    } catch (error) {
      console.error('Error in deleteFormation:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Erreur lors de la suppression');
      }
      throw error;
    }
  },

  // Get available students for a formation
  getAvailableStudents: async (formationId) => {
    try {
      const response = await apiService.get(`${API_URL}/${formationId}/available-students`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add student to formation
  addStudentToFormation: async (formationId, studentId) => {
    try {
      const response = await apiService.post(`${API_URL}/${formationId}/students/${studentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default formationService; 