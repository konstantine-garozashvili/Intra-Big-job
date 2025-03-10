import apiService from './services/apiService';

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
    
    console.log("Recherche d'adresse pour:", query);
    
    try {
      // Utiliser directement l'API avec CORS-Anywhere
      const url = `https://api-adresse.data.gouv.fr/search?q=${encodeURIComponent(query)}&limit=${limit}&type=housenumber&autocomplete=1`;
      console.log("URL de l'API:", url);
      
      // Créer une requête avec fetch pour éviter les problèmes CORS
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors', // Mode CORS explicite
      });
      
      if (!response.ok) {
        console.error('Erreur HTTP:', response.status);
        return [];
      }
      
      const data = await response.json();
      console.log("Résultats reçus:", data);
      
      if (!data.features || !Array.isArray(data.features)) {
        console.error('Format de réponse inattendu:', data);
        return [];
      }
      
      return data.features.map(feature => ({
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
      console.error('Erreur lors de la recherche d\'adresse:', error);
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
      // Utiliser directement l'API avec fetch
      const url = `https://api-adresse.data.gouv.fr/reverse?lon=${lon}&lat=${lat}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors', // Mode CORS explicite
      });
      
      if (!response.ok) {
        console.error('Erreur HTTP:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (data.features.length === 0) {
        return null;
      }
      
      const feature = data.features[0];
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
      console.error('Erreur lors de la géolocalisation inverse:', error);
      return null;
    }
  }
};