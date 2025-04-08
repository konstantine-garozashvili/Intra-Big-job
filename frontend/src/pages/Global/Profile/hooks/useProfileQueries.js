import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

/**
 * Clés de requête pour React Query
 */
export const PROFILE_QUERY_KEYS = {
  profile: ['profile'],
  publicProfile: (userId) => ['profile', userId],
  profileDocument: ['profileDocument']
};

/**
 * Hook personnalisé pour gérer les requêtes liées au profil
 * @returns {Object} Requêtes et mutations pour le profil utilisateur
 */
export const useProfileQueries = () => {
  const queryClient = useQueryClient();
  
  /**
   * Récupérer le profil de l'utilisateur actuel
   */
  const useProfileQuery = () => useQuery({
    queryKey: PROFILE_QUERY_KEYS.profile,
    queryFn: async () => {
      return await profileService.getAllProfileData();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });
  
  /**
   * Récupérer le profil public d'un utilisateur
   * @param {number} userId - ID de l'utilisateur à consulter
   */
  const usePublicProfileQuery = (userId) => useQuery({
    queryKey: PROFILE_QUERY_KEYS.publicProfile(userId),
    queryFn: async () => {
      return await profileService.getPublicProfile(userId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: !!userId // N'exécuter que si userId est fourni
  });
  
  /**
   * Mutation pour mettre à jour le profil
   */
  const useUpdateProfileMutation = () => useMutation({
    mutationFn: async (data) => {
      return await profileService.updateProfile(data);
    },
    onSuccess: () => {
      // Invalider le cache pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.profile });
    }
  });
  
  /**
   * Mutation pour mettre à jour l'adresse
   */
  const useUpdateAddressMutation = () => useMutation({
    mutationFn: async (addressData) => {
      return await profileService.updateAddress(addressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.profile });
    }
  });
  
  /**
   * Mutation pour mettre à jour le profil étudiant
   */
  const useUpdateStudentProfileMutation = () => useMutation({
    mutationFn: async (data) => {
      return await profileService.updateStudentProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.profile });
    }
  });
  
  return {
    useProfileQuery,
    usePublicProfileQuery,
    useUpdateProfileMutation,
    useUpdateAddressMutation,
    useUpdateStudentProfileMutation
  };
}; 