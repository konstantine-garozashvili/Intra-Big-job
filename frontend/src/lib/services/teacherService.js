import teacherData from '@/data/teacherData.json';
import { authService } from './authService';

class TeacherService {
  constructor() {
    this.data = teacherData;
  }

  /**
   * Vérifie si l'utilisateur est authentifié et a le rôle de formateur
   * @returns {boolean}
   */
  async isAuthorized() {
    try {
      if (!authService.isLoggedIn()) {
        return false;
      }

      const userData = await authService.getCurrentUser();
      return userData.roles.includes('ROLE_TEACHER');
    } catch (error) {
      console.error('Erreur lors de la vérification des autorisations:', error);
      return false;
    }
  }

  /**
   * Récupère les informations de la formation
   * @returns {Promise<Object>}
   */
  async getFormationInfo() {
    if (!await this.isAuthorized()) {
      throw new Error('Non autorisé');
    }
    return this.data.formation;
  }

  /**
   * Récupère la liste des cours
   * @returns {Promise<Array>}
   */
  async getCourses() {
    if (!await this.isAuthorized()) {
      throw new Error('Non autorisé');
    }
    return this.data.courses;
  }

  /**
   * Récupère les données de présence
   * @returns {Promise<Array>}
   */
  async getAttendance() {
    if (!await this.isAuthorized()) {
      throw new Error('Non autorisé');
    }
    return this.data.attendance;
  }

  /**
   * Récupère les notes des étudiants
   * @returns {Promise<Array>}
   */
  async getGrades() {
    if (!await this.isAuthorized()) {
      throw new Error('Non autorisé');
    }
    return this.data.grades;
  }

  /**
   * Récupère les alertes importantes
   * @returns {Promise<Array>}
   */
  async getAlerts() {
    if (!await this.isAuthorized()) {
      throw new Error('Non autorisé');
    }
    return this.data.alerts;
  }

  /**
   * Récupère toutes les données du tableau de bord
   * @returns {Promise<Object>}
   */
  async getDashboardData() {
    if (!await this.isAuthorized()) {
      throw new Error('Non autorisé');
    }
    return this.data;
  }
}

export const teacherService = new TeacherService(); 