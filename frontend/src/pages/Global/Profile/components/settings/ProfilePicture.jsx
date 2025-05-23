import React, { useState, useRef, useEffect } from 'react';
import { UserRound, Camera, Upload, Loader2, Trash2, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useProfilePicture } from '../../hooks/useProfilePicture';
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
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

  // Debounce function to prevent multiple calls
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Use a ref to track the previous URL to avoid unnecessary updates
  const previousUrlRef = useRef(null);
  
  // Only notify parent when the URL actually changes and is not a blob URL
  const shouldNotifyParent = (newUrl) => {
    // Don't notify for blob URLs
    if (newUrl && newUrl.startsWith('blob:')) {
      return false;
    }
    
    // Don't notify if the URL hasn't changed
    if (newUrl === previousUrlRef.current) {
      return false;
    }
    
    // Update the ref to track the latest URL
    previousUrlRef.current = newUrl;
    return true;
  };
  
  // Notify parent component when profile picture changes - with debounce
  const debouncedNotify = useRef(
    debounce((url) => {
      if (onProfilePictureChange && shouldNotifyParent(url)) {
        onProfilePictureChange(url);
      }
    }, 2000) // 2 second debounce
  ).current;

  // Use effect to detect changes
  React.useEffect(() => {
    // TEMPORARILY DISABLED TO BREAK CIRCULAR DEPENDENCY
    // This notification was causing an infinite loop with user data updates
    /*
    if (profilePictureUrl !== undefined && profilePictureUrl !== previousUrlRef.current) {
      console.log("ProfilePicture - Profile picture URL changed");
      
      // Only notify if the URL is valid and has changed
      if (profilePictureUrl && !profilePictureUrl.startsWith('blob:')) {
        debouncedNotify(profilePictureUrl);
      }
    }
    */
  }, [profilePictureUrl]);

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
    
    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast.error(`La taille du fichier dépasse la limite autorisée (2MB)`);
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
      toast.error('Erreur lors de la mise à jour de la photo de profil');
    }
  };
  
  const confirmDeleteProfilePicture = async () => {
    try {
      // Close dialog immediately for fluid interaction
      setDeleteDialogOpen(false);
      
      setIsDeleting(true);
      
      // Optimistic update - supprimer immédiatement l'image dans l'UI
      refetch();
      
      // Use the mutation from the hook
      await deleteProfilePicture(null, {
        onSuccess: () => {
          // Forcer le rafraîchissement après un court délai
          setTimeout(() => {
            refetch();
          }, 300);
        },
        onError: (error) => {
          // En cas d'erreur, restaurer l'URL précédente
          refetch();
          
          toast.error('Erreur lors de la suppression de la photo de profil');
        }
      });
    } catch (error) {
      toast.error('Erreur lors de la suppression de la photo de profil');
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine if component is loading
  const componentIsLoading = isLoading || isFetching || deleteStatus.isPending || uploadStatus.isPending || externalLoading;
  
  // If in initial loading state, show skeleton
  if (isLoading && !profilePictureUrl) {
    return <ProfilePictureSkeleton />;
  }

  // Determine the image source to display
  const getImageSrc = () => {
    if (!profilePictureUrl) {
      return null; // Will use the UserRound fallback
    }
    
    // Check if the URL is a blob URL - but don't try to fetch it as that causes errors
    if (profilePictureUrl.startsWith('blob:')) {
      // Just log it and return null - we'll use the fallback
      return null;
    }
    
    return profilePictureUrl;
  };

  // Handle image load error
  const handleImageError = (e) => {
    e.target.style.display = 'none'; // Hide the broken image
    e.target.onerror = null; // Prevent infinite error loop
    
    // Show the fallback icon
    const fallbackIcon = document.createElement('div');
    fallbackIcon.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
    e.target.parentNode.appendChild(fallbackIcon.firstChild);
  };

  console.log("RENDER ProfilePicture", { userData, profilePictureUrl });

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto">
      <div className="flex flex-col items-center">
        <div className="relative mb-3">
          <div 
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden group relative cursor-pointer border-2 border-white dark:border-gray-700 shadow-sm"
            onClick={handleProfilePictureClick}
          >
            {(uploadStatus.isPending || isDeleting) ? (
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400 animate-spin" />
            ) : profilePictureUrl ? (
              <img 
                src={getImageSrc()} 
                alt="Photo de profil" 
                className="object-cover w-full h-full"
                onError={handleImageError}
              />
            ) : (
              <Avatar className="w-full h-full">
                <AvatarFallback className="bg-gradient-to-r from-[#02284f] to-[#03386b] text-white">
                  <User className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16" />
                </AvatarFallback>
              </Avatar>
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
              onClick={() => setDeleteDialogOpen(true)}
              disabled={componentIsLoading}
              className="absolute top-0 right-0 rounded-full p-1 sm:p-1.5 md:p-2 bg-white dark:bg-gray-700 shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              {deleteStatus.isPending ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              )}
            </Button>
          )}
        </div>
        
        {/* Text integrated directly in the component */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Photo de profil</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Mettre à jour votre photo</p>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !deleteStatus.isPending && setDeleteDialogOpen(open)}>
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
              disabled={deleteStatus.isPending}
              className="rounded-full border-2 hover:bg-gray-100 transition-all duration-200"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProfilePicture}
              disabled={deleteStatus.isPending}
              className={`rounded-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-200 ${deleteStatus.isPending ? 'opacity-80' : ''}`}
            >
              {deleteStatus.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePicture;