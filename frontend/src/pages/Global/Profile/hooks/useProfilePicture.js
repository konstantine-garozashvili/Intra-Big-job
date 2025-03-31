import { useApiMutation } from '@/hooks/useReactQuery';
import { toast } from 'sonner';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';
import userDataManager, { USER_DATA_EVENTS } from '@/lib/services/userDataManager';
import apiService from '@/lib/services/apiService';

// Cache keys for localStorage
const CACHE_KEYS = {
  PROFILE_PICTURE: 'cached_profile_picture',
  TIMESTAMP: 'cached_profile_picture_timestamp'
};

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Créer un système d'événements pour les mises à jour de photo de profil
export const profilePictureEvents = {
  listeners: new Set(),
  
  // S'abonner aux mises à jour de photo de profil
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  // Notifier tous les abonnés des mises à jour
  notify() {
    this.listeners.forEach(callback => callback());
  }
};

// Define constant query keys at module level
export const PROFILE_QUERY_KEYS = {
  profilePicture: ['profilePicture'],
  currentProfile: ['currentProfile'],
  publicProfile: ['publicProfile']
};

/**
 * Functions to manage profile picture caching in localStorage
 */
export const profilePictureCache = {
  // Save profile picture to localStorage
  saveToCache: (pictureUrl) => {
    if (!pictureUrl) return;
    
    try {
      localStorage.setItem(CACHE_KEYS.PROFILE_PICTURE, pictureUrl);
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      // Error saving to cache
    }
  },
  
  // Get profile picture from localStorage if still valid
  getFromCache: () => {
    try {
      const cachedUrl = localStorage.getItem(CACHE_KEYS.PROFILE_PICTURE);
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      
      if (!cachedUrl || !timestamp) {
        return null;
      }
      
      // Check if cache is still valid
      const isExpired = Date.now() - Number(timestamp) > CACHE_DURATION;
      
      if (isExpired) {
        profilePictureCache.clearCache();
        return null;
      }
      
      return cachedUrl;
    } catch (error) {
      return null;
    }
  },
  
  // Clear profile picture cache
  clearCache: () => {
    try {
      localStorage.removeItem(CACHE_KEYS.PROFILE_PICTURE);
      localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
    } catch (error) {
      // Error clearing profile picture cache
    }
  },
  
  // Check if cache is valid
  isCacheValid: () => {
    try {
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      if (!timestamp) return false;
      
      return Date.now() - Number(timestamp) <= CACHE_DURATION;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Extract profile picture URL from API response data
 * @param {Object} data - Data received from API
 * @returns {string|null} Profile picture URL or null
 */
function getProfilePictureUrl(data) {
  if (!data) return null;
  if (data.success === false) return null;
  if (!data.data) return null;
  
  const { has_profile_picture, profile_picture_url } = data.data;
  const url = has_profile_picture ? profile_picture_url : null;
  
  // If we have a valid URL from the API, update the cache
  if (url) {
    profilePictureCache.saveToCache(url);
  }
  
  return url;
}

/**
 * Custom hook for managing profile picture operations with React Query
 * @returns {Object} Profile picture data and operations
 */
export function useProfilePicture() {
  const queryClient = useQueryClient();
  const [cachedUrl, setCachedUrl] = useState(() => {
    // Initialiser avec le cache existant au montage du composant
    return profilePictureCache.getFromCache();
  });
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  // Créer un identifiant unique pour le composant
  const componentIdRef = useRef(`profile_picture_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  
  // Get current user data
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userDataManager.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const userId = userData?.id;

  // Fonction pour récupérer la photo de profil en utilisant la coordination
  const fetchProfilePicture = useCallback(async () => {
    // Utiliser le système de coordination des requêtes
    try {
      const response = await userDataManager.coordinateRequest(
        '/api/profile/picture',
        componentIdRef.current,
        async () => {
          const result = await apiService.get('/api/profile/picture', { 
            params: { _t: Date.now() }, // Ajouter un timestamp pour éviter le cache du navigateur
            timeout: 15000, // Timeout court pour les images
            retries: 1 // Limiter les retries
          });
          
          // Normaliser les données pour assurer un format cohérent
          // Le format attendu par getProfilePictureUrl est { data: { has_profile_picture: bool, profile_picture_url: string } }
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
              // Le format est déjà correct, assurer juste qu'on a bien has_profile_picture
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
          // en s'assurant qu'il a la structure minimale attendue
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
  }, [componentIdRef]);

  // Query for profile picture with enhanced debugging - Utiliser notre fonction de fetch coordonnée
  const { data: profilePictureData, isLoading, isFetching, refetch: profilePictureRefetch } = useQuery({
    queryKey: PROFILE_QUERY_KEYS.profilePicture,
    queryFn: fetchProfilePicture,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: profilePictureCache.isCacheValid() ? false : true,
    refetchInterval: null,
    onSuccess: (data) => {
      const url = getProfilePictureUrl(data);
      if (url) {
        queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, data);
        profilePictureCache.saveToCache(url);
        
        // Notifier avec le type approprié mais limiter la propagation
        try {
          // Ne déclencher l'invalidation que si ce composant est le seul utilisateur de la route
          // ou si c'est une première requête (pas dans le cadre d'une mise à jour)
          if (!userDataManager.requestRegistry.isRouteShared('/api/profile/picture')) {
            userDataManager.invalidateCache('profile_picture'); // Passer un type spécifique
          }
        } catch (e) {
          // Ignorer les erreurs silencieusement
        }
      }
    },
    onError: (error) => {
      // Query error
    },
    placeholderData: cachedUrl ? {
      success: true,
      data: {
        has_profile_picture: true,
        profile_picture_url: cachedUrl
      }
    } : undefined
  });

  // Ajouter un état pour contrôler la fréquence des actualisations
  const lastRefreshTime = useRef(0);
  const isRefreshing = useRef(false);

  // Fonction pour forcer le rafraîchissement des données de la photo de profil
  const forceRefresh = useCallback((showToast = true) => {
    const now = Date.now();
    
    // Vérifier si un rafraîchissement est en cours
    if (isRefreshing.current) {
      console.log("Profile picture refresh already in progress, skipping");
      return Promise.resolve();
    }
    
    // Vérifier si on a rafraîchi récemment
    if (now - lastRefreshTime.current < 3000) { // 3 secondes entre les rafraîchissements
      console.log("Profile picture refresh throttled - too soon since last refresh");
      return Promise.resolve();
    }
    
    // Vérifier si la route est en cours de traitement
    if (userDataManager.requestRegistry.isRouteProcessing('/api/profile/picture')) {
      console.log("Profile picture refresh skipped - route is currently being processed");
      return Promise.resolve();
    }
    
    // Mettre à jour le timestamp du dernier rafraîchissement
    lastRefreshTime.current = now;
    
    // Marquer le début du rafraîchissement
    isRefreshing.current = true;
    console.log("Refreshing profile picture data");
    
    // Effectuer la requête
    return profilePictureRefetch()
      .then(response => {
        // Traiter la réponse
        const data = response.data?.data;
        if (data?.profile_picture_url) {
          setCachedUrl(data.profile_picture_url);
          profilePictureCache.saveToCache(data.profile_picture_url);
          if (showToast) {
            toast.success('Photo de profil mise à jour');
          }
        }
        return response;
      })
      .catch(error => {
        console.error("Error refreshing profile picture:", error);
        if (showToast) {
          toast.error('Erreur lors du rafraîchissement de la photo de profil');
        }
        throw error;
      })
      .finally(() => {
        // Marquer la fin du rafraîchissement après un court délai
        // pour éviter les rafraîchissements successifs trop rapides
        setTimeout(() => {
          isRefreshing.current = false;
        }, 1000);
      });
  }, [profilePictureRefetch, setCachedUrl]);

  // Upload profile picture mutation
  const uploadProfilePictureMutation = useApiMutation(
    '/api/profile/picture',
    'post',
    PROFILE_QUERY_KEYS.profilePicture,
    {
      onMutate: async (formData) => {
        await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEYS.profilePicture });
        
        const previousData = queryClient.getQueryData(PROFILE_QUERY_KEYS.profilePicture);
        
        // Don't create a temporary URL for optimistic update - it causes issues
        // Just return the previous data and wait for the real response
        return { previousData };
      },
      onSuccess: async (data, variables, context) => {
        // Extract the real URL from the response
        const serverUrl = data?.data?.profile_picture_url;
        
        if (serverUrl) {
          // Update the cache with the real URL from the server
          queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, {
            success: true,
            data: {
              has_profile_picture: true,
              profile_picture_url: serverUrl,
              is_temp_url: false
            }
          });
          
          // Update our local state with the real URL
          setCachedUrl(serverUrl);
          
          // Save to localStorage cache
          profilePictureCache.saveToCache(serverUrl);
          
          // IMPORTANT: Also update the user data cache directly to avoid circular dependencies
          // This ensures the profile picture is updated everywhere without triggering additional requests
          try {
            const userData = userDataManager.getCachedUserData();
            if (userData) {
              userData.profilePictureUrl = serverUrl;
              // Update the cache directly
              try {
                localStorage.setItem('user', JSON.stringify(userData));
              } catch (e) {
                console.warn('Error storing user data in localStorage:', e);
              }
            }
          } catch (e) {
            console.warn('Error updating user data cache:', e);
          }
        }
        
        // Notifier le gestionnaire de données utilisateur de l'invalidation
        // Use a special flag to prevent circular updates
        try {
          userDataManager.invalidateCache('profile_picture', { skipRefresh: true });
        } catch (e) {
          console.warn('Error invalidating user data cache:', e);
        }
        
        // Notify all subscribers
        profilePictureEvents.notify();
        toast.success('Photo de profil mise à jour avec succès');
        
        // Forcer le rafraîchissement
        await forceRefresh(true);
      },
      onError: (error, variables, context) => {
        // Show error message based on the error type
        if (error.response && error.response.status === 413) {
          toast.error('La taille du fichier est trop grande. Veuillez utiliser une image plus petite (max 2MB).');
        } else {
          toast.error('Erreur lors de la mise à jour de la photo de profil');
        }
        
        // Restore previous state on error
        if (context?.previousData) {
          queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, context.previousData);
          
          // Restore cached URL from previous data
          const prevUrl = getProfilePictureUrl(context.previousData);
          if (prevUrl) {
            setCachedUrl(prevUrl);
            profilePictureCache.saveToCache(prevUrl);
          }
        }
      }
    }
  );

  // Delete profile picture mutation
  const deleteProfilePictureMutation = useApiMutation(
    '/api/profile/picture',
    'delete',
    PROFILE_QUERY_KEYS.profilePicture,
    {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEYS.profilePicture });
        
        const previousData = queryClient.getQueryData(PROFILE_QUERY_KEYS.profilePicture);
        
        queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, {
          success: true,
          data: {
            has_profile_picture: false,
            profile_picture_url: null
          }
        });
        
        setCachedUrl(null);
        profilePictureCache.clearCache();
        
        return { previousData };
      },
      onSuccess: async () => {
        userDataManager.invalidateCache('profile_picture');
        profilePictureEvents.notify();
        profilePictureCache.clearCache();
        toast.success('Photo de profil supprimée avec succès');
        await forceRefresh(true);
      },
      onError: (error, variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, context.previousData);
        }
      }
    }
  );

  // Modifier l'abonnement aux événements pour mieux gérer les mises à jour
  useEffect(() => {
    // TEMPORARILY DISABLED TO BREAK CIRCULAR DEPENDENCY
    // This subscription was causing an infinite loop with user data updates
    
    // Return a no-op unsubscribe function
    return () => {};
    
    /* Original code commented out
    // Variables pour suivre les événements récents
    let recentUpdateTimestamp = 0;
    const UPDATE_THROTTLE_MS = 10000; // Increased to 10s to reduce update frequency
    let isProcessingUpdate = false; // Flag to prevent recursive updates
    
    // Fonction de rappel pour rafraîchir la photo de profil si les données utilisateur sont mises à jour
    const handleUserDataUpdate = (updateType, userData) => {
      // Ne pas traiter les mises à jour si nous sommes déjà en train d'en traiter une
      if (isProcessingUpdate) {
        console.log("Skipping user data update handler - already processing an update");
        return;
      }
      
      // Ne déclencher le forceRefresh que si la mise à jour n'est pas liée à la photo de profil
      // Cela empêche la boucle infinie où la mise à jour de la photo déclenche une mise à jour des données
      if (updateType === 'profile_picture' || updateType === 'profile') {
        console.log("Ignoring profile update event to prevent infinite loop");
        return;
      }
      
      // Vérifier si la route est déjà en cours de traitement
      if (userDataManager.requestRegistry.isRouteProcessing('/api/profile/picture')) {
        console.log("Skipping profile picture refresh - route is already being processed");
        return;
      }
      
      // Vérifier la fréquence des mises à jour
      const now = Date.now();
      if (now - recentUpdateTimestamp < UPDATE_THROTTLE_MS) {
        console.log("Skipping profile picture update - too soon since last update");
        return;
      }
      
      // Vérifier si les données contiennent déjà l'URL de la photo de profil
      if (userData && userData.profilePictureUrl) {
        // Si l'URL est déjà dans les données, mettre à jour notre cache local
        setCachedUrl(userData.profilePictureUrl);
        profilePictureCache.saveToCache(userData.profilePictureUrl);
        console.log("Using profile picture URL from user data:", userData.profilePictureUrl);
        return;
      }
      
      recentUpdateTimestamp = now;
      console.log("Triggering profile picture refresh due to user data update:", updateType);
      
      // Marquer que nous sommes en train de traiter une mise à jour
      isProcessingUpdate = true;
      
      // Utiliser la version throttled de forceRefresh
      forceRefresh(false).finally(() => {
        // Réinitialiser le flag une fois la mise à jour terminée
        setTimeout(() => {
          isProcessingUpdate = false;
        }, 1000); // Attendre 1 seconde avant de permettre de nouvelles mises à jour
      });
    };
    
    // S'abonner à l'événement UPDATED du gestionnaire de données utilisateur
    const unsubscribe = userDataManager.subscribe(USER_DATA_EVENTS.UPDATED, handleUserDataUpdate);
    
    // Se désabonner lors du démontage du composant
    return unsubscribe;
    */
  }, []);

  // Determine the profile picture URL to return, prioritizing:
  // 1. API data if available
  // 2. Local cached URL otherwise
  const finalProfilePictureUrl = profilePictureData?.data?.profile_picture_url || cachedUrl;

  return {
    // Profile picture data
    profilePictureUrl: finalProfilePictureUrl,
    isLoading: isLoading && !cachedUrl, // Not loading if we have a cached URL
    isFetching: isFetching,
    isError: false,
    error: null,
    
    // Operations
    refetch: forceRefresh,
    uploadProfilePicture: uploadProfilePictureMutation.mutate,
    deleteProfilePicture: deleteProfilePictureMutation.mutate,
    
    // Mutation states
    uploadStatus: {
      isPending: uploadProfilePictureMutation.isPending,
      isSuccess: uploadProfilePictureMutation.isSuccess,
      isError: uploadProfilePictureMutation.isError,
      error: uploadProfilePictureMutation.error
    },
    deleteStatus: {
      isPending: deleteProfilePictureMutation.isPending,
      isSuccess: deleteProfilePictureMutation.isSuccess,
      isError: deleteProfilePictureMutation.isError,
      error: deleteProfilePictureMutation.error
    }
  };
}