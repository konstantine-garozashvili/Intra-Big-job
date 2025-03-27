import axios from 'axios';

export const fetchCandidatures = async () => {
  try {
    // Essayer plusieurs URLs possibles pour résoudre l'erreur 404
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
        console.log(`Tentative avec l'URL: ${url}`);
        const response = await axios.get(url);
        console.log(`Réponse reçue de ${url}:`, response.data);
        return response.data;
      } catch (error) {
        console.log(`Erreur lors de l'appel à ${url}:`, error.message);
        lastError = error;
      }
    }
    
    // Si toutes les tentatives ont échoué, lancer la dernière erreur
    throw lastError;
  } catch (error) {
    console.error('Erreur dans fetchCandidatures:', error);
    throw error;
  }
};