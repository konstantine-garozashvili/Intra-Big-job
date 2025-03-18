import apiService from './apiService';

export const formationService = {
    async getAllFormations() {
        return await apiService.get('/api/formations');
    },

    async getFormationById(id) {
        return await apiService.get(`/api/formations/${id}`);
    },

    async addStudentToFormation(formationId, studentId) {
        return await apiService.post(`/api/formations/${formationId}/students`, {
            studentId: studentId
        });
    },

    async getFormationStudents(formationId) {
        return await apiService.get(`/api/formations/${formationId}/students`);
    },

    async getAvailableStudents(formationId) {
        return await apiService.get(`/api/formations/available-students`, {
            params: { formationId }
        });
    }
};
