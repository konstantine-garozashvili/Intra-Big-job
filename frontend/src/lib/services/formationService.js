import apiService from './apiService';

export const formationService = {
    async getAllFormations() {
        return await apiService.get('/formations');
    },

    async getFormationById(id) {
        return await apiService.get(`/formations/${id}`);
    },

    async createFormation(formationData) {
        return await apiService.post('/formations', formationData);
    },

    async addStudentToFormation(formationId, studentId) {
        return await apiService.post(`/formations/${formationId}/students`, {
            studentId: studentId
        });
    },

    async getFormationStudents(formationId) {
        return await apiService.get(`/formations/${formationId}/students`);
    },

    async getAvailableStudents(formationId) {
        return await apiService.get(`/formations/available-students`, {
            params: { formationId }
        });
    }
};
