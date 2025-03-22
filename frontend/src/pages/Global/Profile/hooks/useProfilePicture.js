import { useApiQuery, useApiMutation } from '@/hooks/useReactQuery';
import { profileService } from '../services/profileService';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';
import { queryClient } from '@/App';  // Import the shared queryClient
import userDataManager, { USER_DATA_EVENTS } from '@/lib/services/userDataManager';

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
  const [cachedUrl, setCachedUrl] = useState(() => {
    const url = profilePictureCache.getFromCache();
    console.log('[Debug] Initial cached URL:', url);
    return url;
  });
  
  // Reset isMountedRef on component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Check if we have a valid cached URL on mount
    const url = profilePictureCache.getFromCache();
    if (url) {
      setCachedUrl(url);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Query for profile picture with enhanced debugging
  const profilePictureQuery = useApiQuery(
    '/api/profile/picture',
    PROFILE_QUERY_KEYS.profilePicture,
    {
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
          
          // Notifier userDataManager qu'une nouvelle photo de profil est disponible
          // Cela permettra aux composants qui utilisent useUserDataCentralized
          // de recevoir la mise à jour de la photo de profil
          try {
            userDataManager.invalidateCache();
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
    }
  );

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

  // Force refresh function
  const forceRefresh = useCallback(async () => {
    // Invalidate all related queries
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
    
    // Force immediate refetch
    return await profilePictureQuery.refetch();
  }, [queryClient, profilePictureQuery]);

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
        userDataManager.invalidateCache();
        
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
        userDataManager.invalidateCache();
        
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

  // S'abonner aux événements de mise à jour des données utilisateur
  useEffect(() => {
    // Fonction de rappel pour rafraîchir la photo de profil si les données utilisateur sont mises à jour
    const handleUserDataUpdate = () => {
      forceRefresh();
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