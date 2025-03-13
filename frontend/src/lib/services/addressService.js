import axios from 'axios';

// Configuration de l'API d'adresses
const API_BASE_URL = 'https://api-adresse.data.gouv.fr';

/**
 * Service pour la recherche et la gestion des adresses
 */
export const addressService = {
  /**
   * Recherche des adresses basées sur une requête
   * @param {string} query - Texte de recherche
   * @param {number} limit - Nombre maximum de résultats (défaut: 5)
   * @returns {Promise<Array>} - Liste des adresses correspondantes
   */
  async searchAddresses(query, limit = 5) {
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: {
          q: query,
          limit,
          type: 'housenumber',
          autocomplete: 1
        }
      });
      
      return response.data.features || [];
    } catch (error) {
      // console.error('Erreur lors de la recherche d\'adresses:', error);
      throw error;
    }
  },
  
  /**
   * Recherche une adresse par ses coordonnées (géocodage inverse)
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} - Adresse correspondante
   */
  async reverseGeocode(lat, lon) {
    try {
      const response = await axios.get(`${API_BASE_URL}/reverse`, {
        params: {
          lat,
          lon
        }
      });
      
      return response.data.features[0] || null;
    } catch (error) {
      // console.error('Erreur lors du géocodage inverse:', error);
      throw error;
    }
  },
  
  /**
   * Formate une adresse pour l'affichage
   * @param {Object} addressData - Données d'adresse
   * @returns {string} - Adresse formatée
   */
  formatAddress(addressData) {
    if (!addressData || !addressData.properties) {
      return '';
    }
    
    const { name, housenumber, street, postcode, city } = addressData.properties;
    
    // Construire l'adresse formatée
    const parts = [];
    
    if (housenumber) parts.push(housenumber);
    if (street) parts.push(street);
    if (name && !street) parts.push(name);
    
    const streetPart = parts.join(' ');
    const cityPart = [postcode, city].filter(Boolean).join(' ');
    
    return [streetPart, cityPart].filter(Boolean).join(', ');
  },
  
  /**
   * Extrait les composants d'une adresse
   * @param {Object} addressData - Données d'adresse
   * @returns {Object} - Composants de l'adresse
   */
  extractAddressComponents(addressData) {
    if (!addressData || !addressData.properties) {
      return {
        street: '',
        city: '',
        postalCode: '',
        fullAddress: ''
      };
    }
    
    const { name, housenumber, street, postcode, city } = addressData.properties;
    
    // Construire la rue
    let streetValue = '';
    if (housenumber && street) {
      streetValue = `${housenumber} ${street}`;
    } else if (street) {
      streetValue = street;
    } else if (name) {
      streetValue = name;
    }
    
    return {
      street: streetValue,
      city: city || '',
      postalCode: postcode || '',
      fullAddress: this.formatAddress(addressData)
    };
  }
};

export default addressService; 