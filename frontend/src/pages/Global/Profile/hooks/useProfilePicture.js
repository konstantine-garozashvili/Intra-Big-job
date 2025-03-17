import { useApiQuery, useApiMutation } from '@/hooks/useReactQuery';
import { profileService } from '../services/profileService';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';

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
 * Extract profile picture URL from API response data
 * @param {Object} data - Data received from API
 * @returns {string|null} Profile picture URL or null
 */
function getProfilePictureUrl(data) {
  if (!data) return null;
  if (data.success === false) return null;
  if (!data.data) return null;
  
  const { has_profile_picture, profile_picture_url } = data.data;
  return has_profile_picture ? profile_picture_url : null;
}

/**
 * Custom hook for managing profile picture operations with React Query
 * @returns {Object} Profile picture data and operations
 */
export function useProfilePicture() {
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);
  
  // Reset isMountedRef on component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Query for profile picture
  const profilePictureQuery = useApiQuery(
    '/api/profile/picture',
    PROFILE_QUERY_KEYS.profilePicture,
    {
      staleTime: 0, // Always consider data stale to ensure fresh data
      cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true
    }
  );

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
        }
        
        return { previousData };
      },
      onSuccess: async (data) => {
        if (!isMountedRef.current) return;
        
        try {
          // Verify data is valid
          if (!data || !data.success) {
            throw new Error('Invalid data received from server');
          }
          
          // Update cache with server data
          queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, data);
          
          // Force refresh to ensure consistency
          await forceRefresh();
        } catch (error) {
          // Error handled silently
        }
      },
      onError: (error, variables, context) => {
        // Restore previous state on error
        if (context?.previousData) {
          queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, context.previousData);
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
        
        return { previousData };
      },
      onSuccess: async () => {
        if (!isMountedRef.current) return;
        
        try {
          // Force refresh to ensure consistency
          await forceRefresh();
        } catch (error) {
          // Error handled silently
        }
      },
      onError: (error, variables, context) => {
        // Restore previous state on error
        if (context?.previousData) {
          queryClient.setQueryData(PROFILE_QUERY_KEYS.profilePicture, context.previousData);
        }
      }
    }
  );

  return {
    // Profile picture data
    profilePictureUrl: getProfilePictureUrl(profilePictureQuery.data),
    isLoading: profilePictureQuery.isLoading,
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