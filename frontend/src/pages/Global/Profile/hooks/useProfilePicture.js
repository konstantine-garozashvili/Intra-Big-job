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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  
  // Get current user data
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userDataManager.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const userId = userData?.id;

  // Query for profile picture data
  const { data: profilePictureData, isLoading, isFetching } = useQuery({
    queryKey: PROFILE_QUERY_KEYS.profilePicture,
    queryFn: async () => {
      try {
        const response = await apiService.get('/api/profile/picture');
        if (response.data.success) {
          const pictureUrl = response.data.data.profile_picture_url;
          // Mettre à jour le cache local
          if (pictureUrl) {
            setCachedUrl(pictureUrl);
            profilePictureCache.saveToCache(pictureUrl);
          }
          return {
            success: true,
            data: {
              has_profile_picture: true,
              profile_picture_url: pictureUrl,
              is_temp_url: false
            }
          };
        }
        return {
          success: false,
          data: {
            has_profile_picture: false,
            profile_picture_url: null,
            is_temp_url: false
          }
        };
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        // En cas d'erreur, utiliser le cache si disponible
        const cachedUrl = profilePictureCache.getFromCache();
        if (cachedUrl) {
          return {
            success: true,
            data: {
              has_profile_picture: true,
              profile_picture_url: cachedUrl,
              is_temp_url: false
            }
          };
        }
        return {
          success: false,
          data: {
            has_profile_picture: false,
            profile_picture_url: null,
            is_temp_url: false
          }
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId, // Only run query if we have a userId
    retry: 3, // Réessayer 3 fois en cas d'échec
    retryDelay: 1000, // Attendre 1 seconde entre chaque tentative
  });

  // Ajouter un état pour contrôler la fréquence des actualisations
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const REFRESH_THROTTLE_MS = 2000; // 2 secondes minimum entre les rafraîchissements

  // Modifier la fonction forceRefresh pour limiter la fréquence des actualisations
  const forceRefresh = useCallback(async (skipThrottle = false) => {
    // Vérifier si nous devons respecter la limite de fréquence et si le temps minimum est écoulé
    const now = Date.now();
    if (!skipThrottle && now - lastRefreshTime < REFRESH_THROTTLE_MS) {
      return null; // Ne pas rafraîchir si trop récent
    }
    
    // Mettre à jour l'horodatage du dernier rafraîchissement
    setLastRefreshTime(now);
    
    // Invalider les requêtes pertinentes
    await Promise.all([
      queryClient.invalidateQueries({ 
        queryKey: PROFILE_QUERY_KEYS.profilePicture,
        refetchType: 'all'
      }),
      queryClient.invalidateQueries({ 
        queryKey: PROFILE_QUERY_KEYS.currentProfile,
        refetchType: 'all'
      }),
      queryClient.invalidateQueries({ 
        queryKey: PROFILE_QUERY_KEYS.publicProfile,
        refetchType: 'all'
      }),
      queryClient.invalidateQueries({ 
        queryKey: ['currentUser'],
        refetchType: 'all'
      })
    ]);
    
    // Forcer un rafraîchissement immédiat
    return await profilePictureData.refetch();
  }, [queryClient, profilePictureData, lastRefreshTime]);

  // Upload profile picture mutation
  const uploadProfilePictureMutation = useApiMutation(
    '/api/profile/picture',
    'post',
    PROFILE_QUERY_KEYS.profilePicture,
    {
      onMutate: async (formData) => {
        await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEYS.profilePicture });
        
        const previousData = queryClient.getQueryData(PROFILE_QUERY_KEYS.profilePicture);
        
        const file = formData.get('profile_picture');
        if (file instanceof File) {
          const tempUrl = URL.createObjectURL(file);
          
          queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, {
            success: true,
            data: {
              has_profile_picture: true,
              profile_picture_url: tempUrl,
              is_temp_url: true
            }
          });
          
          setCachedUrl(tempUrl);
        }
        
        return { previousData };
      },
      onSuccess: async (data) => {
        // Mettre à jour le cache local avec la nouvelle URL
        if (data.data?.profile_picture_url) {
          setCachedUrl(data.data.profile_picture_url);
          profilePictureCache.saveToCache(data.data.profile_picture_url);
        }
        
        // Invalider tous les caches pertinents
        userDataManager.invalidateCache('profile_picture');
        profilePictureEvents.notify();
        toast.success('Photo de profil mise à jour avec succès');
        
        // Forcer le rafraîchissement
        await forceRefresh(true);
      },
      onError: (error, variables, context) => {
        // Restore previous data on error
        if (context?.previousData) {
          queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, context.previousData);
        }
        toast.error('Erreur lors de la mise à jour de la photo de profil');
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