import { useApiQuery, useApiMutation } from '@/hooks/useReactQuery';
import { profileService } from '../services/profileService';
import { toast } from 'sonner';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';
import { queryClient } from '@/App';  // Import the shared queryClient
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
      console.log('[Debug] Saving profile picture to cache:', pictureUrl);
      localStorage.setItem(CACHE_KEYS.PROFILE_PICTURE, pictureUrl);
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
      console.log('[Debug] Cache saved successfully');
    } catch (error) {
      console.error('[Debug] Error saving to cache:', error);
    }
  },
  
  // Get profile picture from localStorage if still valid
  getFromCache: () => {
    try {
      const cachedUrl = localStorage.getItem(CACHE_KEYS.PROFILE_PICTURE);
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      
      console.log('[Debug] Getting from cache:', { cachedUrl, timestamp });
      
      if (!cachedUrl || !timestamp) {
        console.log('[Debug] No cache found');
        return null;
      }
      
      // Check if cache is still valid
      const isExpired = Date.now() - Number(timestamp) > CACHE_DURATION;
      console.log('[Debug] Cache status:', { isExpired, age: Date.now() - Number(timestamp) });
      
      if (isExpired) {
        console.log('[Debug] Cache expired, clearing');
        profilePictureCache.clearCache();
        return null;
      }
      
      return cachedUrl;
    } catch (error) {
      console.error('[Debug] Error reading from cache:', error);
      return null;
    }
  },
  
  // Clear profile picture cache
  clearCache: () => {
    try {
      localStorage.removeItem(CACHE_KEYS.PROFILE_PICTURE);
      localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
    } catch (error) {
      console.error('Error clearing profile picture cache:', error);
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
  // Use the shared queryClient instead of creating a new one
  const isMountedRef = useRef(true);
  const queryClient = useQueryClient();
  
  // Générer un ID unique pour ce composant
  const [componentId] = useState(() => 
    `profile_picture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
  const [cachedUrl, setCachedUrl] = useState(() => {
    const url = profilePictureCache.getFromCache();
    console.log('[Debug] Initial cached URL:', url);
    return url;
  });
  
  // Reset isMountedRef on component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Enregistrer ce composant comme utilisateur de la route au montage
    userDataManager.requestRegistry.registerRouteUser('/api/profile/picture', componentId);
    
    // Check if we have a valid cached URL on mount
    const url = profilePictureCache.getFromCache();
    if (url) {
      setCachedUrl(url);
    }
    
    return () => {
      isMountedRef.current = false;
      // Désenregistrer ce composant comme utilisateur de la route au démontage
      userDataManager.requestRegistry.unregisterRouteUser('/api/profile/picture', componentId);
    };
  }, [componentId]);

  // Fonction pour récupérer la photo de profil en utilisant la coordination
  const fetchProfilePicture = useCallback(async () => {
    // Utiliser le système de coordination des requêtes
    return userDataManager.coordinateRequest(
      '/api/profile/picture',
      componentId,
      () => {
        console.log(`[Debug] Component ${componentId} initiating profile picture request`);
        return apiService.get('/api/profile/picture', { 
          params: { _t: Date.now() }, // Ajouter un timestamp pour éviter le cache du navigateur
          timeout: 5000, // Timeout court pour les images
          retries: 1 // Limiter les retries
        });
      }
    );
  }, [componentId]);

  // Query for profile picture with enhanced debugging - Utiliser notre fonction de fetch coordonnée
  const profilePictureQuery = useQuery({
    queryKey: PROFILE_QUERY_KEYS.profilePicture,
    queryFn: fetchProfilePicture,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: profilePictureCache.isCacheValid() ? false : true,
    refetchInterval: null,
    onSuccess: (data) => {
      console.log('[Debug] Query success:', data);
      const url = getProfilePictureUrl(data);
      if (url) {
        console.log('[Debug] New URL from query:', url);
        console.log('[Debug] Updating React Query cache with:', {
          queryKey: PROFILE_QUERY_KEYS.profilePicture,
          data: data
        });
        queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, data);
        profilePictureCache.saveToCache(url);
        
        // Notifier avec le type approprié mais limiter la propagation
        try {
          // Ne déclencher l'invalidation que si ce composant est le seul utilisateur de la route
          // ou si c'est une première requête (pas dans le cadre d'une mise à jour)
          if (!userDataManager.requestRegistry.isRouteShared('/api/profile/picture')) {
            console.log('[Debug] Not a shared route, safe to invalidate cache with type');
            userDataManager.invalidateCache('profile_picture');
          } else {
            console.log('[Debug] Shared route, skipping invalidation to prevent recursive fetching');
          }
        } catch (e) {
          // Ignorer les erreurs silencieusement
        }
      }
    },
    onError: (error) => {
      console.error('[Debug] Query error:', error);
    },
    placeholderData: cachedUrl ? {
      success: true,
      data: {
        has_profile_picture: true,
        profile_picture_url: cachedUrl
      }
    } : undefined
  });

  // Log detailed query state changes
  useEffect(() => {
    const queryData = queryClient.getQueryData(PROFILE_QUERY_KEYS.profilePicture);
    console.log('[Debug] Detailed Query State:', {
      isLoading: profilePictureQuery.isLoading,
      isFetching: profilePictureQuery.isFetching,
      isError: profilePictureQuery.isError,
      data: profilePictureQuery.data,
      cachedUrl,
      queryClientCache: queryData,
      localStorage: {
        profilePicture: localStorage.getItem(CACHE_KEYS.PROFILE_PICTURE),
        timestamp: localStorage.getItem(CACHE_KEYS.TIMESTAMP)
      }
    });
  }, [profilePictureQuery.data, profilePictureQuery.isLoading, profilePictureQuery.isFetching, profilePictureQuery.isError, cachedUrl]);

  // Ajouter un état pour contrôler la fréquence des actualisations
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const REFRESH_THROTTLE_MS = 2000; // 2 secondes minimum entre les rafraîchissements

  // Modifier la fonction forceRefresh pour limiter la fréquence des actualisations
  const forceRefresh = useCallback(async (skipThrottle = false) => {
    // Vérifier si nous devons respecter la limite de fréquence et si le temps minimum est écoulé
    const now = Date.now();
    if (!skipThrottle && now - lastRefreshTime < REFRESH_THROTTLE_MS) {
      console.log(`[Debug] Throttling profile picture refresh (last refresh: ${now - lastRefreshTime}ms ago)`);
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
      })
    ]);
    
    // Forcer un rafraîchissement immédiat
    return await profilePictureQuery.refetch();
  }, [queryClient, profilePictureQuery, lastRefreshTime]);

  // Upload profile picture mutation
  const uploadProfilePictureMutation = useApiMutation(
    '/api/profile/picture',
    'post',
    PROFILE_QUERY_KEYS.profilePicture,
    {
      onMutate: async (formData) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEYS.profilePicture });
        
        // Save previous state
        const previousData = queryClient.getQueryData(PROFILE_QUERY_KEYS.profilePicture);
        
        // Create temporary URL for optimistic update
        const file = formData.get('profile_picture');
        if (file instanceof File) {
          const tempUrl = URL.createObjectURL(file);
          
          // Update cache immediately with optimistic data
          queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, {
            success: true,
            data: {
              has_profile_picture: true,
              profile_picture_url: tempUrl,
              is_temp_url: true
            }
          });
          
          // Also update our local state with the temporary URL
          setCachedUrl(tempUrl);
        }
        
        return { previousData };
      },
      onSuccess: async (data) => {
        console.log('[Debug] Upload success:', data);
        
        // Notifier le gestionnaire de données utilisateur de l'invalidation
        userDataManager.invalidateCache('profile_picture'); // Passer un type spécifique
        
        // Notify all subscribers
        profilePictureEvents.notify();
        
        // Show success message
        toast.success('Photo de profil mise à jour avec succès');
        
        // Force refresh to get latest picture
        forceRefresh();
      },
      onError: (error, variables, context) => {
        // Restore previous state on error
        if (context?.previousData) {
          queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, context.previousData);
          
          // Restore cached URL from previous data
          const prevUrl = getProfilePictureUrl(context.previousData);
          if (prevUrl) {
            setCachedUrl(prevUrl);
          }
        }
      },
      onSettled: () => {
        // Clean up temporary URLs
        const data = queryClient.getQueryData(PROFILE_QUERY_KEYS.profilePicture);
        if (data?.data?.is_temp_url && data?.data?.profile_picture_url) {
          URL.revokeObjectURL(data.data.profile_picture_url);
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
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEYS.profilePicture });
        
        // Save previous state
        const previousData = queryClient.getQueryData(PROFILE_QUERY_KEYS.profilePicture);
        
        // Update cache immediately with optimistic data
        queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, {
          success: true,
          data: {
            has_profile_picture: false,
            profile_picture_url: null
          }
        });
        
        // Clear the cached URL
        setCachedUrl(null);
        profilePictureCache.clearCache();
        
        return { previousData };
      },
      onSuccess: async () => {
        // Notifier le gestionnaire de données utilisateur de l'invalidation
        userDataManager.invalidateCache('profile_picture'); // Passer un type spécifique
        
        // Notify all subscribers
        profilePictureEvents.notify();
        
        // Clear local cache 
        profilePictureCache.clearCache();
        
        // Show success message
        toast.success('Photo de profil supprimée avec succès');
        
        // Force refresh to get latest picture status
        forceRefresh();
      },
      onError: (error, variables, context) => {
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

  // Modifier l'abonnement aux événements pour mieux gérer les mises à jour
  useEffect(() => {
    // Variables pour suivre les événements récents
    let recentUpdateTimestamp = 0;
    const UPDATE_THROTTLE_MS = 1000; // 1 seconde minimum entre les mises à jour
    
    // Fonction de rappel pour rafraîchir la photo de profil si les données utilisateur sont mises à jour
    const handleUserDataUpdate = (updateType) => {
      // Ne déclencher le forceRefresh que si la mise à jour n'est pas liée à la photo de profil
      // Cela empêche la boucle infinie où la mise à jour de la photo déclenche une mise à jour des données
      if (updateType === 'profile_picture') {
        console.log('[Debug] Ignoring profile_picture update to prevent recursive fetching');
        return;
      }
      
      // Vérifier si la route est partagée entre plusieurs composants
      // Si oui, être encore plus prudent pour éviter les cascades de mises à jour
      if (userDataManager.requestRegistry.isRouteShared('/api/profile/picture')) {
        console.log('[Debug] Route is shared, being extra cautious with updates');
        
        // Si un autre composant est en train de faire une requête, ne pas en lancer une nouvelle
        if (userDataManager.requestRegistry.getActiveRequest('/api/profile/picture')) {
          console.log('[Debug] Active request detected, skipping update');
          return;
        }
      }
      
      // Vérifier la fréquence des mises à jour
      const now = Date.now();
      if (now - recentUpdateTimestamp < UPDATE_THROTTLE_MS) {
        console.log('[Debug] Throttling update event, too many updates');
        return;
      }
      
      recentUpdateTimestamp = now;
      
      // Utiliser la version throttled de forceRefresh
      forceRefresh(false);
    };
    
    // S'abonner à l'événement UPDATED du gestionnaire de données utilisateur
    const unsubscribe = userDataManager.subscribe(USER_DATA_EVENTS.UPDATED, handleUserDataUpdate);
    
    // Se désabonner lors du démontage du composant
    return unsubscribe;
  }, [forceRefresh]);

  // Determine the profile picture URL to return, prioritizing:
  // 1. API data if available
  // 2. Local cached URL otherwise
  const finalProfilePictureUrl = getProfilePictureUrl(profilePictureQuery.data) || cachedUrl;

  return {
    // Profile picture data
    profilePictureUrl: finalProfilePictureUrl,
    isLoading: profilePictureQuery.isLoading && !cachedUrl, // Not loading if we have a cached URL
    isFetching: profilePictureQuery.isFetching,
    isError: profilePictureQuery.isError,
    error: profilePictureQuery.error,
    
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