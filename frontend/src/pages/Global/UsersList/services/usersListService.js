import apiService from '@/lib/services/apiService';

const usersListService = {
  /**
   * Récupère la liste complète des utilisateurs
   * @returns {Promise<Array>} Liste des utilisateurs
   */
  getAllUsers: async () => {
    try {
      const response = await apiService.get('users/list');
      return response;
    } catch (error) {
      console.error('Error fetching users list:', error);
      throw error;
    }
  }
};

export default usersListService;