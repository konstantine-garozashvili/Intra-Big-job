import { useApiQuery, useApiMutation } from '@/hooks/useReactQuery';
import { profileService } from '../services/profileService';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

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

/**
 * Custom hook for managing profile picture operations with React Query
 */
export function useProfilePicture() {
  // Accès direct au client de requête pour forcer l'invalidation
  const queryClient = useQueryClient();
  
  // État local pour suivre les opérations en cours
  const [isOperationPending, setIsOperationPending] = useState(false);

  // Query for fetching profile picture
  const profilePictureQuery = useApiQuery(
    '/api/profile/picture',
    ['profilePicture'],
    {
      staleTime: 0, // Toujours considérer les données comme périmées pour forcer le rafraîchissement
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Limiter les tentatives de nouvelle requête en cas d'échec
      onError: (error) => {
        // console.error('Erreur lors de la récupération de la photo de profil:', error);
        // Ne pas afficher de toast pour éviter de spammer l'utilisateur
      },
      // Désactiver le refetch automatique pendant les opérations
      enabled: !isOperationPending
    }
  );

  // Fonction pour invalider toutes les requêtes liées au profil
  const invalidateProfileQueries = () => {
    // Invalider la requête de photo de profil
    queryClient.invalidateQueries({ queryKey: ['profilePicture'] });
    
    // Invalider également les requêtes de profil public et profil courant
    queryClient.invalidateQueries({ queryKey: ['currentProfile'] });
    queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
    
    // Forcer le rafraîchissement des requêtes actives
    queryClient.refetchQueries({ queryKey: ['profilePicture'], type: 'active' });
    queryClient.refetchQueries({ queryKey: ['currentProfile'], type: 'active' });
    queryClient.refetchQueries({ queryKey: ['publicProfile'], type: 'active' });
    
    // Notifier tous les composants abonnés
    profilePictureEvents.notify();
  };

  // Mutation for uploading profile picture
  const uploadProfilePictureMutation = useApiMutation(
    '/api/profile/picture',
    'post',
    ['profilePicture'],
    {
      onMutate: async (formData) => {
        setIsOperationPending(true);
        
        // Annuler les requêtes en cours
        await queryClient.cancelQueries({ queryKey: ['profilePicture'] });
        
        // Sauvegarder l'état précédent
        const previousData = queryClient.getQueryData(['profilePicture']);
        
        // Extraire le fichier du FormData pour l'aperçu
        const file = formData.get('profile_picture');
        if (file && file instanceof File) {
          // Créer une URL temporaire pour l'aperçu
          const tempUrl = URL.createObjectURL(file);
          
          // Mettre à jour le cache avec l'URL temporaire
          queryClient.setQueryData(['profilePicture'], {
            success: true,
            data: {
              has_profile_picture: true,
              profile_picture_url: tempUrl,
              is_temp_url: true // Marquer comme URL temporaire
            }
          });
        }
        
        return { previousData };
      },
      onSuccess: (data) => {
        toast.success('Photo de profil mise à jour avec succès');
        
        // Forcer l'invalidation et le rafraîchissement immédiat
        setTimeout(() => {
          invalidateProfileQueries();
          setIsOperationPending(false);
        }, 300);
      },
      onError: (error, variables, context) => {
        toast.error('Erreur lors de la mise à jour de la photo de profil');
        
        // Restaurer l'état précédent en cas d'erreur
        if (context?.previousData) {
          queryClient.setQueryData(['profilePicture'], context.previousData);
        }
        
        setIsOperationPending(false);
      },
      onSettled: () => {
        // Libérer les URL temporaires
        const data = queryClient.getQueryData(['profilePicture']);
        if (data?.data?.is_temp_url && data?.data?.profile_picture_url) {
          URL.revokeObjectURL(data.data.profile_picture_url);
        }
      }
    }
  );

  // Mutation for deleting profile picture - Utiliser le service direct pour contourner les problèmes CORS
  const deleteProfilePictureMutation = {
    mutate: async (_, options = {}) => {
      try {
        setIsOperationPending(true);
        
        // Annuler les requêtes en cours
        await queryClient.cancelQueries({ queryKey: ['profilePicture'] });
        
        // Sauvegarder l'état précédent
        const previousData = queryClient.getQueryData(['profilePicture']);
        
        // Mettre à jour le cache immédiatement (optimistic update)
        queryClient.setQueryData(['profilePicture'], {
          success: true,
          data: {
            has_profile_picture: false,
            profile_picture_url: null
          }
        });
        
        // Utiliser directement le service profileService au lieu de useApiMutation
        // pour avoir plus de contrôle sur la requête
        const response = await profileService.deleteProfilePicture();
        
        if (response && response.success) {
          // Forcer l'invalidation et le rafraîchissement immédiat après un délai
          setTimeout(() => {
            invalidateProfileQueries();
            setIsOperationPending(false);
            
            if (options.onSuccess) {
              options.onSuccess(response);
            }
            
            toast.success('Photo de profil supprimée avec succès');
          }, 300);
        } else {
          // Restaurer l'état précédent en cas d'erreur
          queryClient.setQueryData(['profilePicture'], previousData);
          setIsOperationPending(false);
          throw new Error(response?.message || 'Erreur lors de la suppression de la photo de profil');
        }
      } catch (error) {
        // Restaurer l'état précédent en cas d'erreur
        const previousData = queryClient.getQueryData(['profilePicture']);
        if (previousData) {
          queryClient.setQueryData(['profilePicture'], previousData);
        }
        
        setIsOperationPending(false);
        
        if (options.onError) {
          options.onError(error);
        }
        
        toast.error('Erreur lors de la suppression de la photo de profil');
      }
    },
    isPending: isOperationPending
  };

  // Helper function to get profile picture URL
  const getProfilePictureUrl = () => {
    const data = profilePictureQuery.data;
    
    if (!data) return null;
    
    // Check if the response has success property, otherwise assume it's the direct data
    if (data.success !== undefined) {
      // Response follows the {success: true, data: {...}} structure
      if (data.success && data.data && data.data.has_profile_picture) {
        return data.data.profile_picture_url;
      }
    } else {
      // Response is the direct data object
      if (data.has_profile_picture) {
        return data.profile_picture_url;
      }
    }
    
    return null;
  };

  // Fonction pour forcer un rafraîchissement manuel
  const forceRefresh = () => {
    if (!isOperationPending) {
      return profilePictureQuery.refetch();
    }
    return Promise.resolve();
  };
  
  // Écouter les événements de mise à jour
  useEffect(() => {
    // S'abonner aux événements de mise à jour
    const unsubscribe = profilePictureEvents.subscribe(() => {
      forceRefresh();
    });
    
    // Se désabonner lors du démontage du composant
    return () => unsubscribe();
  }, []);

  return {
    profilePictureUrl: getProfilePictureUrl(),
    isLoading: profilePictureQuery.isLoading || uploadProfilePictureMutation.isPending || isOperationPending,
    isError: profilePictureQuery.isError,
    error: profilePictureQuery.error,
    refetch: forceRefresh,
    uploadProfilePicture: uploadProfilePictureMutation.mutate,
    deleteProfilePicture: deleteProfilePictureMutation.mutate,
  };
} 