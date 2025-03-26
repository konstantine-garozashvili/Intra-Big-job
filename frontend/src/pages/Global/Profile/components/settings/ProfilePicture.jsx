import React, { useState, useRef } from 'react';
import { UserRound, Camera, Upload, Loader2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useProfilePicture } from '../../hooks/useProfilePicture';
import { Skeleton } from "@/components/ui/skeleton";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previousUrl, setPreviousUrl] = useState(null);
  
  // Use the custom hook for profile picture operations
  const {
    profilePictureUrl,
    isLoading,
    isFetching,
    refetch,
    uploadProfilePicture,
    deleteProfilePicture,
    uploadStatus,
    deleteStatus
  } = useProfilePicture();

  // Notify parent component when profile picture changes
  React.useEffect(() => {
    if (onProfilePictureChange && profilePictureUrl !== undefined) {
      onProfilePictureChange(profilePictureUrl);
    }
  }, [profilePictureUrl, onProfilePictureChange]);

  const handleProfilePictureClick = () => {
    if (uploadStatus.isPending || deleteStatus.isPending) return; // Prevent clicks during operations
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
      // Create a new file with a proper name and extension to ensure correct MIME type detection
      const fileNameParts = file.name.split('.');
      const extension = fileNameParts.pop().toLowerCase();
      const baseName = fileNameParts.join('.');
      const newFileName = `${baseName}.${extension}`;
      
      // Create a new file object with the corrected name
      const renamedFile = new File([file], newFileName, { type: file.type });
      
      const formData = new FormData();
      formData.append('profile_picture', renamedFile);
      
      // Use the mutation from the hook
      uploadProfilePicture(formData, {
        onSuccess: () => {
          toast.success('Photo de profil mise à jour avec succès');
        },
        onError: () => {
          toast.error('Erreur lors de la mise à jour de la photo de profil');
        }
      });
    } catch (error) {
      console.error("Erreur non gérée lors de l'upload:", error);
      toast.error('Erreur lors de la mise à jour de la photo de profil');
    }
  };

  const handleDeleteProfilePicture = async () => {
    setIsDeleting(true);
    try {
      await deleteProfilePicture();
      toast.success('Photo de profil supprimée avec succès');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
      toast.error('Erreur lors de la suppression de la photo de profil');
    } finally {
      setIsDeleting(false);
    }
  };

  const componentIsLoading = isLoading || isFetching || externalLoading;

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
            ) : profilePictureUrl ? (
              <img 
                src={profilePictureUrl} 
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
          
          {/* Upload icon - positioned at bottom right */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full p-1 sm:p-1.5 md:p-2 bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={handleProfilePictureClick}
            disabled={componentIsLoading}
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </Button>
          
          {/* Delete icon - positioned at top right with spacing */}
          {profilePictureUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 rounded-full p-1 sm:p-1.5 md:p-2 bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={componentIsLoading}
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la photo de profil</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer votre photo de profil ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProfilePicture}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePicture; 