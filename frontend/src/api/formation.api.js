import apiService from '../lib/services/apiService';

const API_URL = '/api/formations';
const SPECIALIZATION_URL = '/api/specializations';

/**
 * Service API pour les formations
 */
export const formationApi = {
  /**
   * Récupère toutes les formations avec pagination
   * @param {Object} options - Options de requête
   * @param {Object} options.params - Paramètres de pagination
   * @param {number} options.params.page - Numéro de page
   * @param {number} options.params.limit - Nombre d'éléments par page
   * @param {string} options.params.search - Terme de recherche
   */
  getAll: (options = {}) => apiService.get(API_URL, options),

  /**
   * Récupère une formation par son ID
   * @param {number} id - ID de la formation
   */
  getById: (id) => apiService.get(`${API_URL}/${id}`),

  /**
   * Crée une nouvelle formation
   * @param {FormData} formData - Données de la formation avec l'image
   */
  create: (formData) => apiService.post(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  /**
   * Met à jour une formation
   * @param {number} id - ID de la formation
   * @param {Object} data - Données à mettre à jour
   */
  update: (id, data) => apiService.put(`${API_URL}/${id}`, data),

  /**
   * Supprime une formation
   * @param {number} id - ID de la formation
   */
  delete: (id) => apiService.delete(`${API_URL}/${id}`),

  /**
   * Upload une image pour une formation
   * @param {number} id - ID de la formation
   * @param {FormData} formData - Données de l'image
   */
  uploadImage: (id, formData) => apiService.post(`${API_URL}/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  /**
   * Supprime l'image d'une formation
   * @param {number} id - ID de la formation
   */
  deleteImage: (id) => apiService.delete(`${API_URL}/${id}/image`),

  /**
   * Récupère les étudiants disponibles pour une formation
   * @param {number} id - ID de la formation
   */
  getAvailableStudents: (id) => apiService.get(`${API_URL}/${id}/available-students`),

  /**
   * Ajoute un étudiant à une formation
   * @param {number} formationId - ID de la formation
   * @param {number} studentId - ID de l'étudiant
   */
  addStudent: (formationId, studentId) => apiService.post(`${API_URL}/${formationId}/students/${studentId}`),

  /**
   * Récupère toutes les spécialisations
   */
  getSpecializations: () => apiService.get(SPECIALIZATION_URL),

  /**
   * Soumet une demande d'inscription à une formation
   * @param {number} formationId - ID de la formation
   */
  requestEnrollment: (formationId) => apiService.post(`${API_URL}/${formationId}/enrollment-request`),

  /**
   * Accepte ou refuse une demande d'inscription à une formation
   * @param {number} requestId - ID de la demande
   * @param {boolean} status - true = accepter, false = refuser
   * @param {string} comment - commentaire optionnel
   */
  processEnrollmentRequest: (requestId, status, comment = '') =>
    apiService.patch(`/api/formation-requests/${requestId}`, { status, comment })
}; 