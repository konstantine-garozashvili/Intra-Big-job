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

    async updateFormation(id, formationData) {
        // New method for updating a formation
        return await apiService.put(`/formations/${id}`, formationData);
    },

    async deleteFormation(id) {
        // New method for deleting a formation
        return await apiService.delete(`/formations/${id}`);
    },

    async addStudentToFormation(formationId, studentId) {
        return await apiService.post(`/formations/${formationId}/students`, { studentId });
    },

    async getFormationStudents(formationId) {
        return await apiService.get(`/formations/${formationId}/students`);
    },

    async getAvailableStudents(formationId) {
        return await apiService.get(`/formations/available-students`, {
            params: { formationId }
        });
    },

    // New method for removing a student from a formation
    async removeStudentFromFormation(formationId, studentId) {
        return await apiService.delete(`/formations/${formationId}/students/${studentId}`);
    }
};
