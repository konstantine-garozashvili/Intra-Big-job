import apiService from './apiService';

/**
 * Récupère toutes les candidatures depuis l'API
 * @returns {Promise<Array>} Liste des candidatures
 */
export const fetchCandidatures = async () => {
  try {
    console.log("Début de fetchCandidatures");
    
    // Liste des URLs à essayer
    const urls = [
      '/api/candidatures',
      'http://localhost:8000/api/candidatures',
      'http://localhost:8080/api/candidatures',
      '/candidatures'
    ];
    
    let lastError = null;
    
    // Essayer chaque URL jusqu'à ce qu'une fonctionne
    for (const url of urls) {
      try {
        console.log(`Tentative de récupération des candidatures avec l'URL: ${url}`);
        const response = await apiService.get(url);
        console.log(`Réponse reçue de ${url}:`, response.data);
        
        if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.log(`Erreur lors de l'appel à ${url}:`, error.message);
        lastError = error;
      }
    }
    
    // Si toutes les tentatives ont échoué, lancer la dernière erreur
    throw lastError || new Error('Impossible de récupérer les candidatures');
  } catch (error) {
    console.error('Erreur dans fetchCandidatures:', error);
    throw error;
  }
};