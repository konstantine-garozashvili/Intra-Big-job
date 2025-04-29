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
    userDataManager.requestRegistry.registerRouteUser('/profile/picture', SERVICE_ID);
    userDataManager.requestRegistry.registerRouteUser('/api/profile', SERVICE_ID);
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
        '/profile/user-data',
        SERVICE_ID,
        () => apiService.get('/profile/user-data')
      );
      
      // Mettre en cache les données
      profileCache.userData = response.data;
      profileCache.userDataTimestamp = now;
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData, onSuccess) {
    try {
      // If portfolioUrl is present, use the student profile endpoint
      if (profileData.portfolioUrl !== undefined) {
        const response = await apiService.put('/student/profile/portfolio-url', {
          portfolioUrl: profileData.portfolioUrl
        });
        this.invalidateCache('profile_data');
        if (onSuccess) onSuccess();
        return response.data;
      }
      
      // Otherwise use the regular profile update endpoint
      const response = await apiService.put('/profile', profileData);
      this.invalidateCache('profile_data');
      if (onSuccess) onSuccess();
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDiplomas() {
    try {
      const response = await apiService.get('/profile/diplomas');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAddresses() {
    try {
      const response = await apiService.get('/profile/addresses');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get statistics for the profile
   */
  async getStats(options = {}) {
    const { preventRecursion = true, forceRefresh = false } = options;
    try {
      let endpoint = '/api/profile/stats';
      if (forceRefresh) {
        endpoint = `${endpoint}?_t=${Date.now()}`;
      }
      const response = await apiService.get(endpoint, {
        ...apiService.withAuth(),
        preventRecursion,
        forceRefresh,
        headers: forceRefresh ? {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } : undefined
      });
      // Do not set localStorage for acknowledgment anymore
      return {
        stats: response.stats || { profile: { completionPercentage: 0 } }
      };
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      return {
        stats: { profile: { completionPercentage: 0 } }
      };
    }
  }

  /**
   * Acknowledge profile completion
   * This will mark the profile completion message as seen
   */
  async acknowledgeProfileCompletion() {
    try {
      // Do not set localStorage for acknowledgment anymore
      const response = await apiService.post('/api/profile/acknowledge-completion', {}, {
        ...apiService.withAuth(),
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      await this.getStats({ forceRefresh: true });
      this.invalidateCache('profile_data');
      apiService.invalidateCache('/api/profile/stats');
      return response;
    } catch (error) {
      console.error('Error acknowledging profile completion:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les données de profil consolidées
   * @param {Object} options - Options de récupération
   * @param {boolean} options.forceRefresh - Force une nouvelle requête
   * @returns {Promise<Object>} - Données de profil
   */
  async getAllProfileData(options = {}) {
    const routeToUse = '/api/profile'; // Define the correct route
    try {
      // Vérifier si une requête est déjà en cours pour cette route
      if (userDataManager.requestRegistry.getActiveRequest(routeToUse) && !options.forceRefresh) {
        const activeRequest = userDataManager.requestRegistry.getActiveRequest(routeToUse);
        if (activeRequest) {
          return activeRequest;
        }
      }
      
      // Vérifier si nous avons des données valides en cache local
      const now = Date.now();
      if (!options.forceRefresh && 
          profileCache.consolidatedData && 
          (now - profileCache.consolidatedDataTimestamp) < profileCache.cacheDuration) {
        console.log('Utilisation des données consolidées en cache local');
        return profileCache.consolidatedData;
      }
      
      // Add unique timestamp to URL to ensure we bypass browser cache when forceRefresh is true
      const url = options.forceRefresh ? 
        `${routeToUse}?_t=${Date.now()}` : 
        routeToUse;
      
      // Utiliser le gestionnaire centralisé des données utilisateur avec coordination
      const response = await userDataManager.coordinateRequest(
        url, // Use the URL with cache buster if needed
        SERVICE_ID,
        () => userDataManager.getUserData({
          routeKey: url, // Use the URL with cache buster if needed
          forceRefresh: options.forceRefresh,
          useCache: !options.forceRefresh,
          // Add additional parameters to ensure fresh data
          fetchOptions: options.forceRefresh ? {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          } : undefined
        })
      );
      
      // Normaliser les données pour assurer une structure cohérente
      let normalizedData;
      
      if (response) {
        // Cas 1: La réponse est déjà normalisée avec une structure "user"
        if (response.user && typeof response.user === 'object') {
          normalizedData = response;
        } 
        // Cas 2: La réponse contient directement les données utilisateur
        else if (response.id || response.email) {
          normalizedData = {
            ...response,
            // Assurer que les champs essentiels existent
            firstName: response.firstName || response.first_name || "",
            lastName: response.lastName || response.last_name || "",
            email: response.email || "",
            profilePictureUrl: response.profilePictureUrl || response.profile_picture_url || "",
            linkedinUrl: response.linkedinUrl || "",
            hasCvDocument: response.hasCvDocument || false,
            // Assurer que les collections sont des tableaux
            diplomas: Array.isArray(response.diplomas) ? response.diplomas : [],
            addresses: Array.isArray(response.addresses) ? response.addresses : [],
            // Assurer que stats existe
            stats: response.stats || { profile: { completionPercentage: 0 } }
          };
        }
        // Cas 3: La réponse est dans un format API avec data ou success
        else if ((response.data && typeof response.data === 'object') || response.success) {
          const userData = response.data || {};
          normalizedData = {
            ...userData,
            // Assurer que les champs essentiels existent
            firstName: userData.firstName || userData.first_name || "",
            lastName: userData.lastName || userData.last_name || "",
            email: userData.email || "",
            profilePictureUrl: userData.profilePictureUrl || userData.profile_picture_url || "",
            linkedinUrl: userData.linkedinUrl || "",
            // Assurer que les collections sont des tableaux
            diplomas: Array.isArray(userData.diplomas) ? userData.diplomas : [],
            addresses: Array.isArray(userData.addresses) ? userData.addresses : [],
            // Assurer que stats existe
            stats: userData.stats || { profile: { completionPercentage: 0 } }
          };
        }
        // Cas 4: Format inconnu, utiliser tel quel
        else {
          normalizedData = response;
        }
      } else {
        // Si pas de données, créer un objet vide mais avec la structure attendue
        normalizedData = {
          firstName: "",
          lastName: "",
          email: "",
          profilePictureUrl: "",
          diplomas: [],
          addresses: [],
          stats: { profile: { completionPercentage: 0 } }
        };
      }
      
      // Mettre à jour le cache local pour la compatibilité
      profileCache.consolidatedData = normalizedData;
      profileCache.consolidatedDataTimestamp = now;
      
      // Mettre à jour également le localStorage pour une persistance plus longue
      try {
        localStorage.setItem('user', JSON.stringify(normalizedData));
      } catch (e) {
        // Ignorer l'erreur silencieusement
      }
      
      return normalizedData;
    } catch (error) {
      // FALLBACK: Essayer d'utiliser les données en cache local si disponibles
      if (profileCache.consolidatedData) {
        return profileCache.consolidatedData;
      }
      
      // Sinon, récupérer les données depuis localStorage
      try {
        // Utiliser directement la méthode getCachedUserData de userDataManager
        const cachedData = userDataManager.getCachedUserData();
        if (cachedData) {
          return cachedData;
        }
        
        // Dernier recours: essayer de récupérer directement depuis localStorage
        const storedData = localStorage.getItem('user');
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            return parsedData;
          } catch (e) {
            // Ignorer l'erreur silencieusement
          }
        }
      } catch (e) {
        // Ignorer l'erreur silencieusement
      }
      
      // Si tout échoue, lancer l'erreur
      throw error;
    }
  }
  
  // Get public profile by user ID
  async getPublicProfile(userId) {
    if (!userId) {
      throw new Error('User ID is required to fetch public profile');
    }
    
    try {
      const response = await apiService.get(`/profile/public/${userId}`);
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
          const result = await apiService.get('/profile/picture', {
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
      
      const response = await apiService.post('/profile/picture', formData, {
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
      const response = await apiService.delete(`/profile/picture?t=${timestamp}`);
      
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
      let response;
      
      if (addressData.id) {
        // Update existing address
        response = await apiService.put(`/profile/addresses/${addressData.id}`, addressData);
      } else {
        // Create new address
        response = await apiService.post('/profile/addresses', addressData);
      }
      
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