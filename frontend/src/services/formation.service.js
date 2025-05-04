import { formationApi } from '../api/formation.api';
import { normalizeResponse, cleanImageUrl, handleApiError } from '../utils/api.utils';

/**
 * Service for handling formation business logic
 */
export const formationService = {
  /**
   * Get all formations with normalized data
   */
  getAllFormations: async () => {
    try {
      const response = await formationApi.getAll();
      const data = normalizeResponse(response.data);
      return data?.formations?.map(formation => ({
        ...formation,
        image_url: cleanImageUrl(formation.image_url)
      })) || [];
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
        image_url: cleanImageUrl(formation.image_url)
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

      const response = await formationApi.uploadImage(formationId, formData);
      const data = normalizeResponse(response.data);

      // Check if the response indicates success
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors du téléchargement de l\'image');
      }

      // Return the normalized data
      return {
        success: true,
        image_url: data.data?.image_url || data.image_url
      };
    } catch (error) {
      console.error('[FormationService] Error uploading image:', error);
      throw new Error(error.message || 'Erreur lors du téléchargement de l\'image');
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
      console.log('[FormationService] Raw specializations response:', response);
      
      // La réponse est au format { success: true, data: { specializations: [] } }
      if (response?.success && response?.data?.specializations) {
        return response.data.specializations;
      }
      
      return [];
    } catch (error) {
      console.error('[FormationService] Error loading specializations:', error);
      throw new Error(handleApiError(error));
    }
  }
}; 