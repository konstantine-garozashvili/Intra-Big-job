import apiService from '../lib/services/apiService';

const API_URL = '/api/formations';
const SPECIALIZATION_URL = '/api/specializations';

const handleApiError = (error, defaultMessage) => {
  console.error('[FormationService] API Error details:', {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    responseData: error.response?.data,
    stack: error.stack
  });
  
  if (error.response?.data?.message) {
    console.error(`[FormationService] Server error message: ${error.response.data.message}`);
    throw new Error(error.response.data.message);
  }
  console.error(`[FormationService] Default error message: ${defaultMessage}`);
  throw new Error(defaultMessage);
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
    console.log('[FormationService] getAllFormations called');
    try {
      const response = await apiService.get(API_URL);
      console.log('[FormationService] Raw response:', response);
      console.log('[FormationService] Response data structure:', JSON.stringify(response.data, null, 2));
      
      // Vérification du format de réponse avec plus de tolérance
      let formations = [];
      
      if (response?.data?.success && response?.data?.data?.formations) {
        console.log('[FormationService] Using standard response format');
        formations = response.data.data.formations;
      } else if (response?.data?.formations) {
        console.log('[FormationService] Using direct formations format');
        formations = response.data.formations;
      } else if (Array.isArray(response?.data)) {
        console.log('[FormationService] Using array format');
        formations = response.data;
      }

      // Nettoyer les URLs d'images
      formations = formations.map(formation => ({
        ...formation,
        image_url: cleanImageUrl(formation.image_url)
      }));
      
      return formations;
    } catch (error) {
      console.error('[FormationService] Error in getAllFormations:', error);
      throw new Error('Erreur lors du chargement des formations');
    }
  },

  // Get formation by ID
  getFormation: async (id) => {
    console.log(`[FormationService] getFormation called for id: ${id}`);
    try {
      const response = await apiService.get(`${API_URL}/${id}`);
      console.log('[FormationService] Formation response:', response);
      console.log('[FormationService] Response data structure:', JSON.stringify(response.data, null, 2));
      
      // Vérification du format de réponse avec plus de tolérance
      let formation = null;
      
      if (response?.data?.success && response?.data?.data?.formation) {
        console.log('[FormationService] Using standard response format');
        formation = response.data.data.formation;
      } else if (response?.data?.formation) {
        console.log('[FormationService] Using direct formation format');
        formation = response.data.formation;
      } else if (response?.data) {
        console.log('[FormationService] Using raw data format');
        formation = response.data;
      }

      if (!formation) {
        console.error('[FormationService] No formation data found in response');
        throw new Error('Aucune donnée de formation trouvée');
      }

      return {
        ...formation,
        image_url: cleanImageUrl(formation.image_url)
      };
    } catch (error) {
      console.error(`[FormationService] Error in getFormation:`, error);
      throw new Error('Erreur lors du chargement de la formation');
    }
  },

  // Get specializations
  getSpecializations: async () => {
    console.log('[FormationService] getSpecializations called');
    try {
      const response = await apiService.get(SPECIALIZATION_URL);
      console.log('[FormationService] Raw specializations response:', response);
      console.log('[FormationService] Response data structure:', JSON.stringify(response.data, null, 2));
      
      // Si la réponse est dans le format standard
      if (response?.data?.success && response?.data?.data?.specializations) {
        console.log('[FormationService] Using standard response format');
        return response.data.data;
      }
      
      // Si la réponse contient directement les spécialisations
      if (response?.data?.specializations) {
        console.log('[FormationService] Using direct specializations format');
        return {
          specializations: response.data.specializations
        };
      }
      
      // Si la réponse est un tableau de spécialisations
      if (Array.isArray(response?.data)) {
        console.log('[FormationService] Using array format');
        return {
          specializations: response.data
        };
      }
      
      console.error('[FormationService] Unexpected response format:', response?.data);
      throw new Error('Format de réponse inattendu pour les spécialisations');
    } catch (error) {
      console.error('[FormationService] Error in getSpecializations:', error);
      throw new Error('Erreur lors du chargement des spécialisations');
    }
  },

  // Create new formation
  createFormation: async (formationData) => {
    try {
      console.log('[FormationService] Creating formation with data:', formationData);

      // Validation des champs requis
      const requiredFields = ['name', 'promotion', 'capacity', 'duration', 'dateStart', 'specializationId'];
      const missingFields = requiredFields.filter(field => !formationData[field]);
      if (missingFields.length > 0) {
        console.error('[FormationService] Missing required fields:', missingFields);
        throw new Error(`Champs requis manquants : ${missingFields.join(', ')}`);
      }

      // Création du FormData
      const formData = new FormData();
      formData.append('name', formationData.name);
      formData.append('promotion', formationData.promotion);
      formData.append('description', formationData.description || '');
      formData.append('capacity', formationData.capacity.toString());
      formData.append('duration', formationData.duration.toString());
      formData.append('dateStart', formationData.dateStart);
      formData.append('location', formationData.location || '');
      formData.append('specializationId', formationData.specializationId);

      // Ajout de l'image si présente
      if (formationData.imageFile) {
        formData.append('image', formationData.imageFile);
      }

      console.log('[FormationService] Sending FormData payload');
      const response = await apiService.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[FormationService] Create formation response:', response);

      return response.data;
    } catch (error) {
      console.error('[FormationService] Error creating formation:', error);
      handleApiError(error, 'Erreur lors de la création de la formation');
    }
  },

  // Update formation
  updateFormation: async (id, formationData) => {
    console.log(`[FormationService] updateFormation called for id: ${id}`, formationData);
    try {
      if (!id) {
        console.error('[FormationService] Missing formation ID');
        throw new Error('ID de formation manquant');
      }

      const payload = {
        ...formationData,
        image_url: formationData.imageUrl || null
      };
      console.log('[FormationService] Update payload:', payload);

      const response = await apiService.put(`${API_URL}/${id}`, payload);
      console.log(`[FormationService] Update response:`, response);
      console.log(`[FormationService] Update response structure:`, JSON.stringify(response.data, null, 2));

      let updatedFormation = null;
      
      if (response?.data?.success && response?.data?.data?.formation) {
        console.log('[FormationService] Using standard response format');
        updatedFormation = response.data.data.formation;
      } else if (response?.data?.formation) {
        console.log('[FormationService] Using direct formation format');
        updatedFormation = response.data.formation;
      } else if (response?.data) {
        console.log('[FormationService] Using raw data format');
        updatedFormation = response.data;
      }

      if (!updatedFormation) {
        console.error('[FormationService] No formation data in response:', response?.data);
        throw new Error('Erreur lors de la mise à jour de la formation');
      }

      return updatedFormation;
    } catch (error) {
      console.error('[FormationService] Error in updateFormation:', error);
      handleApiError(error, 'Erreur lors de la mise à jour de la formation');
    }
  },

  // Delete formation
  deleteFormation: async (id) => {
    console.log(`[FormationService] deleteFormation called for id: ${id}`);
    try {
      if (!id) {
        console.error('[FormationService] Missing formation ID');
        throw new Error('ID de formation manquant');
      }

      const response = await apiService.delete(`${API_URL}/${id}`);
      console.log(`[FormationService] Delete response:`, response);
      console.log(`[FormationService] Delete response structure:`, JSON.stringify(response.data, null, 2));
      
      // Si la requête réussit, on considère que la suppression est un succès
      return {
        success: true,
        message: response?.data?.message || 'Formation supprimée avec succès'
      };
    } catch (error) {
      console.error('[FormationService] Error deleting formation:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la formation');
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
  },

  // Upload formation image
  uploadFormationImage: async (formationId, imageFile) => {
    console.log('[FormationService] Uploading image for formation:', formationId);
    try {
      if (!formationId || !imageFile) {
        console.error('[FormationService] Missing formation ID or image file');
        throw new Error('ID de formation ou fichier image manquant');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      console.log('[FormationService] Image file details:', {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size
      });

      const response = await apiService.post(
        `${API_URL}/${formationId}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('[FormationService] Image upload response:', response);
      console.log('[FormationService] Image upload response structure:', JSON.stringify(response.data, null, 2));

      if (!response?.data?.success) {
        console.error('[FormationService] Image upload failed:', response?.data);
        throw new Error(response?.data?.message || 'Erreur lors du téléchargement de l\'image');
      }

      return response.data;
    } catch (error) {
      console.error('[FormationService] Error uploading image:', error);
      handleApiError(error, 'Erreur lors du téléchargement de l\'image');
    }
  },

  // Delete formation image
  deleteFormationImage: async (formationId) => {
    try {
      if (!formationId) {
        throw new Error('ID de formation manquant');
      }

      const response = await apiService.delete(`${API_URL}/${formationId}/image`);
      
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Échec de la suppression de l\'image');
      }

      return response.data;
    } catch (error) {
      handleApiError(error, 'Erreur lors de la suppression de l\'image');
    }
  }
};

export default formationService; 