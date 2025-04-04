import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export const fetchUsers = async (filters = {}) => {
  try {
    const response = await axios.get('/api/users/list', {
      params: {
        ...filters,
        // Add any default filters here
      }
    });
    return response.data;
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
