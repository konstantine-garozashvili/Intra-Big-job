import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export const fetchUsers = async (filters = {}) => {
  try {
    const response = await axios.get('/api/users/list', {
      params: {
        ...filters,
        includeRoles: true, // Ajouter ce paramètre pour inclure les rôles
        // Add any default filters here
      }
    });
    // Ensure we always return an array, even if the API response is unexpected
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    throw error;
  }
};

export const useUsersList = (filters = {}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
