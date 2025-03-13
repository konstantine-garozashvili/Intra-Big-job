import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRound, Camera, Upload, Loader2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useProfilePicture } from '../../hooks/useProfilePicture';
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton component for the profile picture
const ProfilePictureSkeleton = () => {
  return (
    <div className="p-0 sm:p-1">
      <div className="flex justify-center">
        <div className="relative">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full" />
          <Skeleton className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
        </div>
      </div>
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
  }, [refetch]);

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
            forceRefresh();
          }, 300);
          
          setIsUploading(false);
        },
        onError: (error) => {
          // En cas d'erreur, revenir à l'URL précédente
          setLocalProfilePictureUrl(previousUrl);
          URL.revokeObjectURL(tempUrl);
          
          toast.error('Erreur lors de la mise à jour de la photo de profil');
          // console.error('Error uploading profile picture:', error);
          setIsUploading(false);
        }
      });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la photo de profil');
      // console.error('Error uploading profile picture:', error);
      setIsUploading(false);
    }
  };
  
  const handleDeleteProfilePicture = async () => {
    try {
      // Confirmation avant suppression
      if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
        return;
      }
      
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
    }
  };

  // Déterminer si le composant est en cours de chargement
  const componentIsLoading = isLoading || isDeleting || isUploading || externalLoading;
  
  // If in initial loading state, show skeleton
  if (isLoading && !initialLoadComplete) {
    return <ProfilePictureSkeleton />;
  }

  return (
    <div className="p-0 sm:p-1">
      <div className="flex items-center justify-center">
        <div className="relative">
          <div 
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden group relative cursor-pointer border-2 border-white dark:border-gray-700 shadow-sm"
            onClick={handleProfilePictureClick}
          >
            {componentIsLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400 animate-spin" />
            ) : localProfilePictureUrl ? (
              <img 
                src={localProfilePictureUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <UserRound className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePictureChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full p-0.5 sm:p-1 bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={handleProfilePictureClick}
            disabled={componentIsLoading}
          >
            <Upload className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
          
          {/* Icône de suppression */}
          {localProfilePictureUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteProfilePicture}
              disabled={componentIsLoading}
              className="absolute top-0 right-0 rounded-full p-0.5 sm:p-1 bg-white dark:bg-gray-700 shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
              ) : (
                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePicture; 