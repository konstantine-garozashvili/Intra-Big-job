import apiService from '../lib/services/apiService';

const API_URL = '/api/formations';
const SPECIALIZATION_URL = '/api/specializations';

const handleApiError = (error, defaultMessage) => {
  // ... existing code ...
};

const cleanImageUrl = (url) => {
  if (!url) return null;
  // Supprimer les doubles https://
  let cleanUrl = url.replace(/https:\/\/bigproject-storage\.s3.*?\/https:\/\//, 'https://');
  // Décoder l'URL
  return decodeURIComponent(cleanUrl);
};

const formationService = {
  // Get all formations
  getAllFormations: async () => {
    // ... existing code ...
  },

  // Get formation by ID
  getFormation: async (id) => {
    // ... existing code ...
  },

  // Get specializations
  getSpecializations: async () => {
    // ... existing code ...
  },

  // Create new formation
  createFormation: async (formationData) => {
    // ... existing code ...
  },

  // Update formation
  updateFormation: async (id, formationData) => {
    // ... existing code ...
  },

  // Delete formation
  deleteFormation: async (id) => {
    // ... existing code ...
  },

  // Get available students for a formation
  getAvailableStudents: async (formationId) => {
    // ... existing code ...
  },

  // Add student to formation
  addStudentToFormation: async (formationId, studentId) => {
    // ... existing code ...
  },

  // Upload formation image
  uploadFormationImage: async (formationId, imageFile) => {
    // ... existing code ...
  },

  // Delete formation image
  deleteFormationImage: async (formationId) => {
    // ... existing code ...
  }
};

export default formationService; 