import apiService from './apiService';

export const formationService = {
    async getAllFormations() {
        return await apiService.get('/formations');
    },

    async getFormationById(id) {
        return await apiService.get(`/formations/${id}`);
    },

    async createFormation(formationData) {
        const response = await apiService.post('/formations', formationData);
        if (response.success === false) {
            return response;
        }
        return {
            id: response.id,
            name: response.name,
            promotion: response.promotion,
            description: response.description,
            students: response.students || []
        };
    },

    async addStudentToFormation(formationId, studentId) {
        const response = await apiService.post(`/formations/${formationId}/students`, {
            studentId: studentId
        });
        if (response.success === false) {
            return response;
        }
        return {
            success: true,
            message: 'Student added successfully'
        };
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
