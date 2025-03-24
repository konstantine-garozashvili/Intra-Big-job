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
    // Ne pas faire de requête si la requête est trop courte
    if (!query || query.length < 3) return [];
    
    // Filtres améliorés pour éviter les requêtes problématiques
    const trimmedQuery = query.trim();
    
    // Cas spécial: si c'est un code postal complet (5 chiffres), on l'accepte
    const isFullPostalCode = /^\d{5}$/.test(trimmedQuery);
    
    // Cas problématiques à filtrer:
    // 1. Code postal partiel
    // 2. Requête trop courte avec un seul mot
    if (!isFullPostalCode) {
      if (/^\d+$/.test(trimmedQuery) && trimmedQuery.length < 5) {
        return [];
      }
      if (trimmedQuery.split(/\s+/).length === 1 && trimmedQuery.length < 4) {
        return [];
      }
    }
    
    try {
      // Paramètres optimisés selon la documentation officielle
      const params = {
        q: trimmedQuery,
        limit: limit,
        // Paramètres qui aident à améliorer la qualité des résultats
        autocomplete: 1
      };
      
      const response = await axios.get(`${API_ADRESSE_URL}/search`, { params });
      
      if (!response.data || !response.data.features || response.data.features.length === 0) {
        return [];
      }
      
      // Transformer les résultats en format utilisable
      return response.data.features.map(feature => {
        const properties = feature.properties || {};
        return {
          id: properties.id || `temp-${Math.random()}`,
          label: properties.label || '',
          houseNumber: properties.housenumber || '',
          street: properties.street || '',
          postcode: properties.postcode || '',
          city: properties.city || '',
          context: properties.context || '',
          coordinates: feature.geometry?.coordinates || [0, 0],
          score: properties.score || 0
        };
      });
    } catch (error) {
      // Gestion silencieuse des erreurs en production
      if (import.meta.env.DEV) {
        console.error('Erreur lors de la recherche d\'adresse:', error);
      }
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
      console.error('Erreur lors de la géolocalisation inverse:', error);
      return null;
    }
  }
}; 
