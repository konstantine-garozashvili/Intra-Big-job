import apiService from '../lib/services/apiService';

/**
 * @typedef {Object} Teacher
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string|null} profilePicturePath
 */

/**
 * @typedef {Object} FormationTeacher
 * @property {number} id
 * @property {boolean} isMainTeacher
 * @property {Teacher} user
 * @property {Formation} formation
 */

/**
 * @typedef {Object} Formation
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef {Object} Stats
 * @property {number} totalTeachers
 * @property {number} totalFormations
 * @property {Array<FormationTeacherCount>} teachersPerFormation
 */

/**
 * @typedef {Object} FormationTeacherCount
 * @property {number} formation_id
 * @property {string} formation_name
 * @property {number} teacher_count
 */

/**
 * @typedef {Object} BatchUpdateItem
 * @property {number} id
 * @property {boolean} isMainTeacher
 */

/**
 * Custom error class for FormationTeacher service
 */
class FormationTeacherError extends Error {
  constructor(message, code = 'FORMATION_TEACHER_ERROR') {
    super(message);
    this.name = 'FormationTeacherError';
    this.code = code;
  }
}

class FormationTeacherService {
  /**
   * Get all available teachers
   * @returns {Promise<Teacher[]>}
   * @throws {FormationTeacherError}
   */
  async getAvailableTeachers() {
    try {
      const response = await apiService.get('/api/formation-teachers/available-teachers');
      return response.data || [];
    } catch (error) {
      throw new FormationTeacherError(
        'Failed to fetch available teachers',
        'GET_AVAILABLE_TEACHERS_ERROR'
      );
    }
  }

  /**
   * Get all formation teacher relations
   * @returns {Promise<FormationTeacher[]>}
   * @throws {FormationTeacherError}
   */
  async getAllFormationTeachers() {
    try {
      const response = await apiService.get('/api/formation-teachers');
      // Vérifier et nettoyer les données
      const data = response?.data || [];
      return Array.isArray(data) ? data.filter(item => item && item.formation && item.user) : [];
    } catch (error) {
      throw new FormationTeacherError(
        'Failed to fetch all formation teachers',
        'GET_ALL_FORMATION_TEACHERS_ERROR'
      );
    }
  }

  /**
   * Get teachers for a specific formation
   * @param {number} formationId
   * @returns {Promise<FormationTeacher[]>}
   * @throws {FormationTeacherError}
   */
  async getTeachersByFormation(formationId) {
    // Validate formationId
    if (!formationId || typeof formationId !== 'number' || isNaN(formationId)) {
      throw new FormationTeacherError(
        'Formation ID is required and must be a valid number',
        'INVALID_FORMATION_ID'
      );
    }

    try {
      const response = await apiService.get(`/api/formation-teachers/formation/${formationId}`);
      return response.data || [];
    } catch (error) {
      const message = error.response?.data?.message || `Failed to fetch teachers for formation ${formationId}`;
      throw new FormationTeacherError(message, 'GET_TEACHERS_BY_FORMATION_ERROR');
    }
  }

  /**
   * Get formations for a specific teacher
   * @param {number} teacherId
   * @returns {Promise<Formation[]>}
   * @throws {FormationTeacherError}
   */
  async getFormationsByTeacher(teacherId) {
    if (!teacherId || typeof teacherId !== 'number') {
      throw new FormationTeacherError(
        'Teacher ID is required and must be a number',
        'INVALID_TEACHER_ID'
      );
    }

    try {
      const response = await apiService.get(`/api/formation-teachers/teacher/${teacherId}`);
      return response.data || [];
    } catch (error) {
      throw new FormationTeacherError(
        `Failed to fetch formations for teacher ${teacherId}`,
        'GET_FORMATIONS_BY_TEACHER_ERROR'
      );
    }
  }

  /**
   * Get formation teacher statistics
   * @returns {Promise<Stats>}
   * @throws {FormationTeacherError}
   */
  async getStats() {
    try {
      const response = await apiService.get('/api/formation-teachers/stats');
      return response.data || {};
    } catch (error) {
      throw new FormationTeacherError(
        'Failed to fetch formation teacher statistics',
        'GET_STATS_ERROR'
      );
    }
  }

  /**
   * Batch update formation teachers
   * @param {BatchUpdateItem[]} updates
   * @returns {Promise<Array<{id: number, success: boolean, error?: string}>>}
   * @throws {FormationTeacherError}
   */
  async batchUpdate(updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new FormationTeacherError(
        'Updates must be a non-empty array',
        'INVALID_BATCH_UPDATE'
      );
    }

    try {
      const response = await apiService.post('/api/formation-teachers/batch', { updates });
      return response.data || [];
    } catch (error) {
      throw new FormationTeacherError(
        'Failed to perform batch update',
        'BATCH_UPDATE_ERROR'
      );
    }
  }

  /**
   * Create a new formation teacher relation
   * @param {Object} params
   * @param {number} params.formationId
   * @param {number} params.userId
   * @param {boolean} params.isMainTeacher
   * @returns {Promise<FormationTeacher>}
   * @throws {FormationTeacherError}
   */
  async create({ formationId, userId, isMainTeacher }) {
    // Validate parameters
    if (!formationId || typeof formationId !== 'number' || isNaN(formationId)) {
      throw new FormationTeacherError(
        'Formation ID is required and must be a valid number',
        'INVALID_FORMATION_ID'
      );
    }

    if (!userId || typeof userId !== 'number' || isNaN(userId)) {
      throw new FormationTeacherError(
        'User ID is required and must be a valid number',
        'INVALID_USER_ID'
      );
    }

    if (typeof isMainTeacher !== 'boolean') {
      throw new FormationTeacherError(
        'isMainTeacher must be a boolean',
        'INVALID_IS_MAIN_TEACHER'
      );
    }

    try {
      const response = await apiService.post('/api/formation-teachers', {
        formation_id: formationId,
        user_id: userId,
        is_main_teacher: isMainTeacher
      });
      return response.data || null;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create formation teacher relation';
      throw new FormationTeacherError(message, 'CREATE_ERROR');
    }
  }

  /**
   * Update a formation teacher relation
   * @param {number} id
   * @param {boolean} isMainTeacher
   * @returns {Promise<FormationTeacher>}
   * @throws {FormationTeacherError}
   */
  async update(id, isMainTeacher) {
    if (!id || typeof id !== 'number') {
      throw new FormationTeacherError(
        'ID is required and must be a number',
        'INVALID_ID'
      );
    }

    if (typeof isMainTeacher !== 'boolean') {
      throw new FormationTeacherError(
        'isMainTeacher must be a boolean',
        'INVALID_IS_MAIN_TEACHER'
      );
    }

    try {
      const response = await apiService.put(`/api/formation-teachers/${id}`, {
        is_main_teacher: isMainTeacher
      });
      return response.data || null;
    } catch (error) {
      throw new FormationTeacherError(
        'Failed to update formation teacher relation',
        'UPDATE_ERROR'
      );
    }
  }

  /**
   * Delete a formation teacher relation
   * @param {number} id
   * @returns {Promise<boolean>}
   * @throws {FormationTeacherError}
   */
  async delete(id) {
    if (!id || typeof id !== 'number') {
      throw new FormationTeacherError(
        'ID is required and must be a number',
        'INVALID_ID'
      );
    }

    try {
      const response = await apiService.delete(`/api/formation-teachers/${id}`);
      // Handle 204 No Content response
      return response.status === 204;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new FormationTeacherError(
          'Formation teacher relation not found',
          'NOT_FOUND_ERROR'
        );
      }
      throw new FormationTeacherError(
        'Failed to delete formation teacher relation',
        'DELETE_ERROR'
      );
    }
  }
}

export const formationTeacherService = new FormationTeacherService();

// Pour les tests dans la console
if (typeof window !== 'undefined') {
  window.formationTeacherService = formationTeacherService;
} 