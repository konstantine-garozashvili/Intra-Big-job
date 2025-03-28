import apiService from './apiService';

/**
 * Récupère toutes les candidatures depuis l'API
 * @returns {Promise<Array>} Liste des candidatures
 */
export const fetchCandidatures = async () => {
  try {
    console.log('Début de la requête fetchCandidatures');
    const response = await apiService.get('/api/candidatures');
    console.log('Réponse brute de fetchCandidatures:', response);
    
    // Si response est déjà un tableau (pas enveloppé dans un objet data)
    if (Array.isArray(response)) {
      console.log('Réponse est déjà un tableau');
      return response;
    }
    
    // Si response contient un champ data qui est un tableau
    if (response && Array.isArray(response.data)) {
      console.log('Réponse contient un tableau data');
      return response.data;
    }
    
    // Si response est un objet mais pas un tableau
    if (response && typeof response === 'object') {
      console.log('Réponse est un objet:', response);
      return response;
    }
    
    // Fallback - retourner un tableau vide
    console.log('Aucun format valide détecté, renvoi tableau vide');
    return [];
  } catch (error) {
    console.error('Erreur dans fetchCandidatures:', error);
    // Return empty array instead of propagating the error to prevent component crashes
    return [];
  }
};

/**
 * Récupère tous les types de situation disponibles
 * @returns {Promise<Object>} Objet contenant les types de situation
 */
export const fetchSituationTypes = async () => {
  try {
    console.log('Début de la requête fetchSituationTypes');
    const response = await apiService.get('/api/situation-types');
    console.log('Réponse brute de fetchSituationTypes:', response);
    
    // Ensure we return an object with the expected structure
    if (response && response.success === true && Array.isArray(response.situationTypes)) {
      console.log('Format correct reçu directement');
      return response;
    }
    
    // Unwrap data if needed
    if (response && response.data && response.data.success === true && Array.isArray(response.data.situationTypes)) {
      console.log('Format correct à l\'intérieur de data');
      return response.data;
    }
    
    // Return default data structure if the response is not valid
    console.log('Format invalide, renvoi structure par défaut');
    return { success: false, situationTypes: [], count: 0 };
  } catch (error) {
    console.error('Erreur dans fetchSituationTypes:', error);
    // Return safe default data
    return { success: false, situationTypes: [], count: 0 };
  }
};

/**
 * Récupère les étudiants par type de situation
 * @param {number} situationId - ID du type de situation
 * @returns {Promise<Object>} Objet contenant les étudiants avec le type de situation spécifié
 */
export const fetchStudentsBySituation = async (situationId) => {
  try {
    if (!situationId) {
      console.log('fetchStudentsBySituation: ID manquant');
      return { success: false, students: [], count: 0 };
    }
    
    console.log(`Début de la requête fetchStudentsBySituation pour ID: ${situationId}`);
    const response = await apiService.get(`/api/students-by-situation/${situationId}`);
    console.log('Réponse brute de fetchStudentsBySituation:', response);
    
    // Ensure we return an object with the expected structure
    if (response && response.success === true && Array.isArray(response.students)) {
      console.log('Format correct reçu directement');
      return response;
    }
    
    // Unwrap data if needed
    if (response && response.data && response.data.success === true && Array.isArray(response.data.students)) {
      console.log('Format correct à l\'intérieur de data');
      return response.data;
    }
    
    // Return default data structure if the response is not valid
    console.log('Format invalide, renvoi structure par défaut');
    return { success: false, students: [], count: 0 };
  } catch (error) {
    console.error(`Erreur dans fetchStudentsBySituation (ID: ${situationId}):`, error);
    // Return safe default data
    return { success: false, students: [], count: 0 };
  }
};