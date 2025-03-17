import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRound, Camera, Upload, Loader2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useProfilePicture } from '../../hooks/useProfilePicture';
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Skeleton component for the profile picture
const ProfilePictureSkeleton = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-2">
        <Skeleton className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full" />
        <Skeleton className="absolute bottom-2 right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
      </div>
      <Skeleton className="h-6 w-32 mb-1" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
};

const ProfilePicture = ({ userData, onProfilePictureChange, isLoading: externalLoading = false }) => {
  const fileInputRef = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localProfilePictureUrl, setLocalProfilePictureUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Accès direct au client de requête pour forcer l'invalidation
  const queryClient = useQueryClient();
  
  // Use the custom hook for profile picture operations
  const {
    profilePictureUrl,
    isLoading,
    refetch,
    uploadProfilePicture,
    deleteProfilePicture
  } = useProfilePicture();

  // Synchroniser l'état local avec l'état de React Query sans animation au chargement initial
  useEffect(() => {
    if (profilePictureUrl !== localProfilePictureUrl && !isUploading && !isDeleting) {
      // Mise à jour directe sans animation lors du chargement initial
      if (!initialLoadComplete) {
        setLocalProfilePictureUrl(profilePictureUrl);
        setInitialLoadComplete(true);
      } else {
        // Animations uniquement pour les mises à jour après le chargement initial
        if (localProfilePictureUrl && profilePictureUrl) {
          // Transition pour les changements d'image
          setPreviousUrl(localProfilePictureUrl);
          setTimeout(() => {
            setLocalProfilePictureUrl(profilePictureUrl);
          }, 150);
        } else {
          // Mise à jour directe pour les ajouts/suppressions
          setLocalProfilePictureUrl(profilePictureUrl);
        }
      }
    }
  }, [profilePictureUrl, localProfilePictureUrl, isUploading, isDeleting, initialLoadComplete]);

  // Notify parent component when profile picture changes
  useEffect(() => {
    if (onProfilePictureChange && localProfilePictureUrl !== undefined) {
      onProfilePictureChange(localProfilePictureUrl);
    }
  }, [localProfilePictureUrl, onProfilePictureChange]);

  // Fonction pour forcer le rafraîchissement des données
  const forceRefresh = useCallback(() => {
    // console.log("Forçage du rafraîchissement des données de la photo de profil");
    refetch();
    
    // Invalider également les requêtes de profil public et profil courant
    queryClient.invalidateQueries({ queryKey: ['currentProfile'] });
    queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
  }, [refetch, queryClient]);

  const handleProfilePictureClick = () => {
    if (isUploading || isDeleting) return; // Éviter les clics pendant les opérations
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type on client side
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    // Check MIME type
    if (!validTypes.includes(file.type)) {
      toast.error(`Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WEBP`);
      return;
    }
    
    // Check file extension
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      toast.error(`Extension de fichier non autorisée. Extensions acceptées: JPG, PNG, GIF, WEBP`);
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error(`La taille du fichier dépasse la limite autorisée (5MB)`);
      return;
    }

    try {
      setIsUploading(true);
      
      // Create a new file with a proper name and extension to ensure correct MIME type detection
      const fileNameParts = file.name.split('.');
      const extension = fileNameParts.pop().toLowerCase();
      const baseName = fileNameParts.join('.');
      const newFileName = `${baseName}.${extension}`;
      
      // Create a new file object with the corrected name
      const renamedFile = new File([file], newFileName, { type: file.type });
      
      const formData = new FormData();
      formData.append('profile_picture', renamedFile);
      
      // Optimistic update - montrer immédiatement un aperçu de l'image
      const tempUrl = URL.createObjectURL(file);
      
      // Sauvegarder l'URL précédente pour une éventuelle restauration
      if (localProfilePictureUrl) {
        setPreviousUrl(localProfilePictureUrl);
      }
      
      // Mise à jour directe sans animation
      setLocalProfilePictureUrl(tempUrl);
      
      // Use the mutation from the hook
      uploadProfilePicture(formData, {
        onSuccess: (data) => {
          // Libérer l'URL temporaire après un délai
          setTimeout(() => {
            URL.revokeObjectURL(tempUrl);
          }, 500);
          
          // Forcer le rafraîchissement après un court délai
          setTimeout(() => {
            refetch();
          }, 1000);
          
          setIsUploading(false);
        },
        onError: (error) => {
          // Restaurer l'URL précédente en cas d'erreur
          if (previousUrl) {
            setLocalProfilePictureUrl(previousUrl);
          } else {
            setLocalProfilePictureUrl(null);
          }
          
          setIsUploading(false);
        }
      });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la photo de profil');
      // console.error('Error uploading profile picture:', error);
      setIsUploading(false);
    }
  };
  
  const handleDeleteProfilePicture = () => {
    // Ouvrir le dialogue de confirmation
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteProfilePicture = async () => {
    try {
      setIsDeleting(true);
      
      // Optimistic update - supprimer immédiatement l'image dans l'UI
      setPreviousUrl(localProfilePictureUrl);
      setLocalProfilePictureUrl(null);
      
      // Use the mutation from the hook
      await deleteProfilePicture(null, {
        onSuccess: () => {
          // Forcer le rafraîchissement après un court délai
          setTimeout(() => {
            forceRefresh();
          }, 300);
        },
        onError: (error) => {
          // En cas d'erreur, restaurer l'URL précédente
          setLocalProfilePictureUrl(previousUrl);
          
          toast.error('Erreur lors de la suppression de la photo de profil');
          // console.error('Error deleting profile picture:', error);
        }
      });
    } catch (error) {
      toast.error('Erreur lors de la suppression de la photo de profil');
      // console.error('Error deleting profile picture:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Déterminer si le composant est en cours de chargement
  const componentIsLoading = isLoading || isDeleting || isUploading || externalLoading;
  
  // If in initial loading state, show skeleton
  if (isLoading && !initialLoadComplete) {
    return <ProfilePictureSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div className="flex flex-col items-center">
        <div className="relative mb-3">
          <div 
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden group relative cursor-pointer border-2 border-white dark:border-gray-700 shadow-sm"
            onClick={handleProfilePictureClick}
          >
            {componentIsLoading ? (
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400 animate-spin" />
            ) : localProfilePictureUrl ? (
              <img 
                src={localProfilePictureUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <UserRound className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePictureChange}
          />
          
          {/* Icône d'upload - positionnée en bas à droite */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full p-1 sm:p-1.5 md:p-2 bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={handleProfilePictureClick}
            disabled={componentIsLoading}
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </Button>
          
          {/* Icône de suppression - positionnée en haut à droite avec un espacement */}
          {localProfilePictureUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteProfilePicture}
              disabled={componentIsLoading}
              className="absolute top-0 right-0 rounded-full p-1 sm:p-1.5 md:p-2 bg-white dark:bg-gray-700 shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              )}
            </Button>
          )}
        </div>
        
        {/* Texte intégré directement dans le composant */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Photo de profil</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Mettre à jour votre photo</p>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => !isDeleting && setDeleteDialogOpen(open)}>
          <DialogContent className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden rounded-2xl border-0 shadow-xl">
            <div className="overflow-y-auto max-h-[70vh] fade-in-up">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Confirmation de suppression</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Êtes-vous sûr de vouloir supprimer votre photo de profil ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
            </div>
            <DialogFooter className="mt-6 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="rounded-full border-2 hover:bg-gray-100 transition-all duration-200"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteProfilePicture}
                disabled={isDeleting}
                className={`rounded-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-200 ${isDeleting ? 'opacity-80' : ''}`}
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProfilePicture; 