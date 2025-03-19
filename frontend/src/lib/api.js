import { addressApiInstance } from './axios';

// Configuration de l'API Adresse du gouvernement français
const API_ADRESSE_URL = 'https://api-adresse.data.gouv.fr';

/**
 * Service pour l'API Adresse du gouvernement français
 */
export const adresseApi = {
  /**
   * Recherche d'adresses par autocomplétion
   * @param {string} query - Texte de recherche
   * @param {number} limit - Nombre maximum de résultats (défaut: 5)
   * @returns {Promise} - Promesse contenant les résultats de la recherche
   */
  searchAddress: async (query, limit = 5) => {
    if (!query || query.length < 3) return [];
    
    try {
      const response = await addressApiInstance.get('/search', {
        params: {
          q: query,
          limit,
          type: 'housenumber',
          autocomplete: 1
        }
      });
      
      return response.data.features.map(feature => ({
        id: feature.properties.id,
        label: feature.properties.label,
        houseNumber: feature.properties.housenumber || '',
        street: feature.properties.street || '',
        postcode: feature.properties.postcode || '',
        city: feature.properties.city || '',
        context: feature.properties.context || '',
        coordinates: feature.geometry.coordinates,
        score: feature.properties.score
      }));
    } catch (error) {
      // console.error('Erreur lors de la recherche d\'adresse:', error);
      return [];
    }
  },
  
  /**
   * Recherche inverse (coordonnées vers adresse)
   * @param {number} lon - Longitude
   * @param {number} lat - Latitude
   * @returns {Promise} - Promesse contenant les résultats de la recherche
   */
  reverseGeocode: async (lon, lat) => {
    try {
      const response = await addressApiInstance.get('/reverse', {
        params: {
          lon,
          lat
        }
      });
      
      if (response.data.features.length === 0) {
        return null;
      }
      
      const feature = response.data.features[0];
      return {
        id: feature.properties.id,
        label: feature.properties.label,
        houseNumber: feature.properties.housenumber || '',
        street: feature.properties.street || '',
        postcode: feature.properties.postcode || '',
        city: feature.properties.city || '',
        context: feature.properties.context || '',
        coordinates: feature.geometry.coordinates
      };
    } catch (error) {
      // console.error('Erreur lors de la géolocalisation inverse:', error);
      return null;
    }
  }
}; 
