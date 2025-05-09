import { formationApi } from '../api/formation.api';
import { normalizeResponse, cleanImageUrl, handleApiError } from '../utils/api.utils';

/**
 * Service for handling formation business logic
 */
export const formationService = {
  /**
   * Get all formations with normalized data and pagination
   */
  getAllFormations: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await formationApi.getAll({ 
        params: { 
          page, 
          limit,
          search: search.trim()
        } 
      });
      const data = normalizeResponse(response.data);
      const formations = data?.formations?.map(formation => ({
        ...formation,
        image_url: cleanImageUrl(formation.image_url),
        dateStart: formation.dateStart ? new Date(formation.dateStart) : null,
        students: formation.students || [],
        capacity: parseInt(formation.capacity) || 0,
        duration: parseInt(formation.duration) || 0
      })) || [];

      return {
        formations,
        pagination: data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          limit: 10,
          total: formations.length
        }
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get formation by ID with normalized data
   */
  getFormation: async (id) => {
    try {
      const response = await formationApi.getById(id);
      const data = normalizeResponse(response.data);
      const formation = data?.formation;
      
      if (!formation) {
        throw new Error('Formation non trouvée');
      }

      return {
        ...formation,
        image_url: cleanImageUrl(formation.image_url),
        dateStart: formation.dateStart ? new Date(formation.dateStart) : null,
        students: formation.students || [],
        capacity: parseInt(formation.capacity) || 0,
        duration: parseInt(formation.duration) || 0
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new formation with validation
   */
  createFormation: async (formationData) => {
    try {
      // Validate required fields
      const requiredFields = ['name', 'promotion', 'capacity', 'duration', 'dateStart', 'specializationId'];
      const missingFields = requiredFields.filter(field => !formationData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Champs requis manquants : ${missingFields.join(', ')}`);
      }

      // Create FormData for multipart request
      const formData = new FormData();
      Object.entries(formationData).forEach(([key, value]) => {
        if (key === 'imageFile' && value) {
          formData.append('image', value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const response = await formationApi.create(formData);
      const data = normalizeResponse(response.data);
      return data?.formation;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update formation with validation
   */
  updateFormation: async (id, formationData) => {
    try {
      if (!id) {
        throw new Error('ID de formation manquant');
      }

      const response = await formationApi.update(id, formationData);
      const data = normalizeResponse(response.data);
      return data?.formation;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete formation
   */
  deleteFormation: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de formation manquant');
      }

      const response = await formationApi.delete(id);
      return normalizeResponse(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Upload formation image
   */
  uploadFormationImage: async (formationId, formData) => {
    try {
      if (!formationId || !formData) {
        throw new Error('ID de formation ou fichier image manquant');
      }

      // Validate that formData contains an image file
      const imageFile = formData.get('image');
      if (!imageFile || !(imageFile instanceof File)) {
        throw new Error('Fichier image invalide');
      }

      const response = await formationApi.uploadImage(formationId, formData);
      
      // Check if the response has data
      if (!response?.data) {
        throw new Error('Réponse invalide du serveur');
      }

      // Get the image URL from the response
      const imageUrl = response.data.data?.image_url || response.data.image_url;
      if (!imageUrl) {
        throw new Error('URL de l\'image manquante dans la réponse');
      }

      // Clean and return the image URL
      const cleanedUrl = cleanImageUrl(imageUrl);

      return {
        success: true,
        image_url: cleanedUrl
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erreur lors du téléchargement de l\'image');
    }
  },

  /**
   * Delete formation image
   */
  deleteFormationImage: async (formationId) => {
    try {
      if (!formationId) {
        throw new Error('ID de formation manquant');
      }

      const response = await formationApi.deleteImage(formationId);
      return normalizeResponse(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get available students for a formation
   */
  getAvailableStudents: async (formationId) => {
    try {
      const response = await formationApi.getAvailableStudents(formationId);
      return normalizeResponse(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Add student to formation
   */
  addStudentToFormation: async (formationId, studentId) => {
    try {
      const response = await formationApi.addStudent(formationId, studentId);
      return normalizeResponse(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get all specializations
   */
  getSpecializations: async () => {
    try {
      const response = await formationApi.getSpecializations();
      
      if (response?.success && response?.data?.specializations) {
        return response.data.specializations;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Soumet une demande d'inscription à une formation
   */
  requestEnrollment: async (formationId) => {
    const response = await formationApi.requestEnrollment(formationId);
    if (!response.success) {
      throw new Error(response.message || "Erreur lors de la demande d'inscription à la formation.");
    }
    return response.data;
  },

  /**
   * Accepte ou refuse une demande d'inscription à une formation
   * @param {number} requestId
   * @param {boolean} status
   * @param {string} comment
   */
  processEnrollmentRequest: async (requestId, status, comment = '') => {
    try {
      const response = await formationApi.processEnrollmentRequest(requestId, status, comment);
      return normalizeResponse(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}; 