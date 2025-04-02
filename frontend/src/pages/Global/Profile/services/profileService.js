import apiService from '@/lib/services/apiService';
import { profilePictureEvents } from '../hooks/useProfilePicture';
import userDataManager from '@/lib/services/userDataManager';

// Cache local pour les données fréquemment utilisées
const profileCache = {
  userData: null,
  userDataTimestamp: 0,
  consolidatedData: null,
  consolidatedDataTimestamp: 0,
  // Durée de validité du cache en ms (2 minutes)
  cacheDuration: 2 * 60 * 1000
};

// Identifiant unique pour ce service
const SERVICE_ID = `profile_service_${Date.now()}`;

class ProfileService {
  constructor() {
    // Enregistrer le service comme utilisateur des routes qu'il utilise fréquemment
    userDataManager.requestRegistry.registerRouteUser('/api/profile/picture', SERVICE_ID);
    userDataManager.requestRegistry.registerRouteUser('/api/profile/consolidated', SERVICE_ID);
  }

  async getUserProfile() {
    try {
      // Vérifier si les données sont en cache et toujours valides
      const now = Date.now();
      if (profileCache.userData && 
          (now - profileCache.userDataTimestamp) < profileCache.cacheDuration) {
        return profileCache.userData;
      }
      
      // Utiliser le système de coordination pour éviter les requêtes dupliquées
      const response = await userDataManager.coordinateRequest(
        '/api/profile/user-data',
        SERVICE_ID,
        () => apiService.get('/api/profile/user-data')
      );
      
      // Mettre en cache les données
      profileCache.userData = response.data;
      profileCache.userDataTimestamp = now;
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      // If portfolioUrl is present, use the student profile endpoint
      if (profileData.portfolioUrl !== undefined) {
        const response = await apiService.put('/api/student/profile/portfolio-url', {
          portfolioUrl: profileData.portfolioUrl
        });
        
        // Invalider le cache après une mise à jour
        this.invalidateCache('profile_data');
        
        return response.data;
      }
      
      // Otherwise use the regular profile update endpoint
      const response = await apiService.put('/api/profile', profileData);
      
      // Invalider le cache après une mise à jour
      this.invalidateCache('profile_data');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDiplomas() {
    try {
      const response = await apiService.get('/api/profile/diplomas');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAddresses() {
    try {
      const response = await apiService.get('/api/profile/addresses');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await apiService.get('/api/profile/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Récupère toutes les données de profil consolidées
   * @param {Object} options - Options de récupération
   * @param {boolean} options.forceRefresh - Force une nouvelle requête
   * @param {boolean} options.bypassThrottle - Ignorer les règles de limitation de fréquence
   * @returns {Promise<Object>} - Données de profil
   */
  async getAllProfileData(options = {}) {
    try {
      console.group('ProfileService - getAllProfileData');
      console.log('Options:', options);
      
      // Clear cache if force refresh is requested
      if (options.forceRefresh) {
        profileCache.consolidatedData = null;
        profileCache.consolidatedDataTimestamp = 0;
        console.log("Profile cache cleared due to force refresh");
      }
      
      // Check cache status
      const now = Date.now();
      if (!options.forceRefresh && 
          profileCache.consolidatedData && 
          (now - profileCache.consolidatedDataTimestamp) < profileCache.cacheDuration) {
        console.log('Returning cached profile data:', profileCache.consolidatedData);
        console.groupEnd();
        return profileCache.consolidatedData;
      }
      
      console.log('Fetching fresh profile data...');
      // Use the centralized user data manager with coordination
      const response = await userDataManager.coordinateRequest(
        '/api/profile/consolidated',
        SERVICE_ID,
        () => userDataManager.getUserData({
          routeKey: '/api/profile/consolidated',
          forceRefresh: options.forceRefresh,
          bypassThrottle: options.bypassThrottle,
          useCache: !options.forceRefresh
        })
      );
      
      console.log('Raw response from consolidated:', response);

      // Normaliser les données pour assurer une structure cohérente
      let normalizedData;
      
      if (response) {
        if (response.data) {
          console.log('Processing response.data structure');
          normalizedData = {
            ...response.data,
            // Ensure we preserve the roles from the original data
            roles: response.data.roles || (response.user ? response.user.roles : []),
            // Ensure we have the correct city
            city: response.data.city || 
                  (response.data.addresses && response.data.addresses[0] ? 
                   response.data.addresses[0].city.name : 'Non renseignée'),
            // Preserve other important fields
            addresses: response.data.addresses || [],
            _dataSource: 'consolidated',
            _timestamp: Date.now()
          };
        } else if (response.user) {
          console.log('Processing response.user structure');
          normalizedData = {
            ...response.user,
            _dataSource: 'user',
            _timestamp: Date.now()
          };
        }
        
        console.log('Normalized data:', normalizedData);
      }

      // Update cache
      if (normalizedData) {
        profileCache.consolidatedData = normalizedData;
        profileCache.consolidatedDataTimestamp = now;
        console.log('Updated cache with new data');
      }

      console.groupEnd();
      return normalizedData;
    } catch (error) {
      console.error('Error in getAllProfileData:', error);
      console.groupEnd();
      throw error;
    }
  }
  
  // Get public profile by user ID
  async getPublicProfile(userId) {
    if (!userId) {
      throw new Error('User ID is required to fetch public profile');
    }
    
    try {
      const response = await apiService.get(`/api/profile/public/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Profile picture methods
  async getProfilePicture() {
    try {
      // Utiliser la coordination des requêtes
      const response = await userDataManager.coordinateRequest(
        '/api/profile/picture',
        SERVICE_ID,
        async () => {
          const result = await apiService.get('/api/profile/picture', {
            params: { _t: Date.now() }, // Éviter le cache navigateur
            timeout: 5000 // Timeout court pour les images
          });
          
          // Normaliser les données pour assurer un format cohérent
          // Format attendu: { data: { has_profile_picture: bool, profile_picture_url: string } }
          if (result) {
            // Si le résultat est une string, c'est probablement une URL directe
            if (typeof result === 'string') {
              return { 
                success: true,
                data: { 
                  has_profile_picture: true, 
                  profile_picture_url: result 
                } 
              };
            }
            
            // Si on a direct la propriété url ou profile_picture_url
            if (result.url || result.profile_picture_url) {
              const url = result.url || result.profile_picture_url;
              return { 
                success: true, 
                data: { 
                  has_profile_picture: true, 
                  profile_picture_url: url 
                } 
              };
            }
            
            // Si on a data.profile_picture_url
            if (result.data && (result.data.profile_picture_url || result.data.url)) {
              const profileData = { ...result.data };
              if (profileData.profile_picture_url || profileData.url) {
                profileData.has_profile_picture = true;
                profileData.profile_picture_url = profileData.profile_picture_url || profileData.url;
              }
              return { success: true, data: profileData };
            }
            
            // Si on a un autre format (mais toujours un objet), essayer de normaliser
            if (typeof result === 'object' && result !== null) {
              if (result.success === true && result.data) {
                // Le format est probablement déjà correct
                return result;
              }
              
              // Dernier recours: chercher une URL à n'importe quel niveau
              const findUrlInObject = (obj) => {
                for (const key in obj) {
                  if (typeof obj[key] === 'string' && 
                      (key.includes('url') || key.includes('picture')) && 
                      (obj[key].startsWith('http') || obj[key].startsWith('/'))) {
                    return obj[key];
                  } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    const nestedUrl = findUrlInObject(obj[key]);
                    if (nestedUrl) return nestedUrl;
                  }
                }
                return null;
              };
              
              const url = findUrlInObject(result);
              if (url) {
                return { 
                  success: true, 
                  data: { 
                    has_profile_picture: true, 
                    profile_picture_url: url 
                  } 
                };
              }
            }
          }
          
          // Si aucune normalisation n'a fonctionné, retourner le résultat tel quel
          return result && typeof result === 'object' 
            ? result 
            : { success: false, data: { has_profile_picture: false } };
        }
      );
      
      return response;
    } catch (error) {
      // En cas d'erreur, retourner un objet avec le format attendu
      return { 
        success: false, 
        data: { has_profile_picture: false },
        error: error.message
      };
    }
  }
  
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      
      const response = await apiService.post('/api/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Invalider le cache après une mise à jour
      this.invalidateCache('profile_picture');
      
      // Notifier tous les composants abonnés
      profilePictureEvents.notify();
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  async deleteProfilePicture() {
    try {
      // Ajouter un timestamp pour éviter les problèmes de cache
      const timestamp = new Date().getTime();
      const response = await apiService.delete(`/api/profile/picture?t=${timestamp}`);
      
      // Invalider le cache après une mise à jour
      this.invalidateCache('profile_picture');
      
      // Notifier tous les composants abonnés
      profilePictureEvents.notify();
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  async updateAddress(addressData) {
    try {
      const response = await apiService.put('/api/profile/address', addressData);
      
      // Invalider le cache après une mise à jour
      this.invalidateCache('address');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Invalide le cache des données de profil
   * @param {string} [updateType] - Type de mise à jour (ex: 'profile_picture', 'address', 'profile_data')
   */
  invalidateCache(updateType = null) {
    // Ne pas déclencher l'invalidation trop fréquemment
    if (updateType === 'profile_picture' && 
        userDataManager.requestRegistry.isRouteShared('/api/profile/picture')) {
      // Vider uniquement notre cache local sans propager
      profileCache.userData = null;
      profileCache.userDataTimestamp = 0;
      profileCache.consolidatedData = null;
      profileCache.consolidatedDataTimestamp = 0;
      
      // Notifier directement les abonnés au lieu de passer par userDataManager
      // pour éviter de déclencher des cascades de mises à jour
      profilePictureEvents.notify();
      return;
    }
    
    // Si ce n'est pas un cas spécial, procéder normalement
    profileCache.userData = null;
    profileCache.userDataTimestamp = 0;
    profileCache.consolidatedData = null;
    profileCache.consolidatedDataTimestamp = 0;
    
    // Invalider également le cache centralisé avec le type de mise à jour
    userDataManager.invalidateCache(updateType);
  }
}

export const profileService = new ProfileService();
export default profileService; 