import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import documentService from '../services/documentService';
import axios from 'axios';
import authService from '@services/authService';

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Query keys
export const profileKeys = {
  all: ['profile'],
  current: () => [...profileKeys.all, 'current'],
  public: (userId) => [...profileKeys.all, 'public', userId],
  diplomas: () => [...profileKeys.all, 'diplomas'],
  addresses: () => [...profileKeys.all, 'addresses'],
  stats: () => [...profileKeys.all, 'stats'],
  picture: () => [...profileKeys.all, 'picture'],
};

// Hook for fetching current user's profile
export const useCurrentProfile = () => {
  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: () => profileService.getAllProfileData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching a public profile by user ID
export const usePublicProfile = (userId) => {
  return useQuery({
    queryKey: profileKeys.public(userId),
    queryFn: () => profileService.getPublicProfile(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!userId, // Only run the query if userId is provided
  });
};

// Hook for fetching user's diplomas
export const useDiplomas = () => {
  return useQuery({
    queryKey: profileKeys.diplomas(),
    queryFn: () => profileService.getDiplomas(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching user's addresses
export const useAddresses = () => {
  return useQuery({
    queryKey: profileKeys.addresses(),
    queryFn: () => profileService.getAddresses(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching user's stats
export const useStats = () => {
  return useQuery({
    queryKey: profileKeys.stats(),
    queryFn: () => profileService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching user's profile picture
export const useProfilePicture = () => {
  return useQuery({
    queryKey: profileKeys.picture(),
    queryFn: () => profileService.getProfilePicture(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for updating user's profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData) => profileService.updateProfile(profileData),
    onSuccess: () => {
      // Invalidate and refetch the current profile data
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    },
  });
};

// Hook for uploading profile picture
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file) => profileService.uploadProfilePicture(file),
    onSuccess: () => {
      // Invalidate and refetch profile picture and current profile
      queryClient.invalidateQueries({ queryKey: profileKeys.picture() });
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    },
  });
};

// Hook for deleting profile picture
export const useDeleteProfilePicture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => profileService.deleteProfilePicture(),
    onSuccess: () => {
      // Invalidate and refetch profile picture and current profile
      queryClient.invalidateQueries({ queryKey: profileKeys.picture() });
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
    },
  });
};

/**
 * Hook to fetch CV document for a user
 * @param {number} userId - The ID of the user to fetch CV for (optional, uses current user if not provided)
 * @returns {Object} Query result with CV document data
 */
export const useUserCV = (userId = null) => {
  return useQuery({
    queryKey: ['userCV', userId],
    queryFn: async () => {
      try {
        // If userId is provided, we need to fetch the CV for that specific user
        // This would require a backend endpoint that supports this
        if (userId) {
          // This assumes there's an endpoint to get documents by user ID and type
          // You might need to implement this endpoint on the backend
          const response = await axios.get(
            `${API_URL}/documents/user/${userId}/type/CV`,
            {
              headers: {
                'Authorization': `Bearer ${authService.getToken()}`
              }
            }
          );
          return response.data;
        } else {
          // For current user, use the existing method
          const documents = await documentService.getDocumentByType('CV');
          return { success: true, data: documents };
        }
      } catch (error) {
        console.error('Error fetching CV document:', error);
        return { success: false, error: error.message };
      }
    },
    enabled: true,
  });
}; 