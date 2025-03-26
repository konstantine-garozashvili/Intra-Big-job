import apiService from './apiService';

export const fetchCandidatures = async () => {
  try {
    return await apiService.get('/candidatures');
  } catch (error) {
    console.error('Erreur dans fetchCandidatures:', error);
    throw error;
  }
};