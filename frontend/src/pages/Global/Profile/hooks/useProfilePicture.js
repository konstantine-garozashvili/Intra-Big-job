import { useState, useCallback } from 'react';
// Suppression de l'import qui crée la dépendance circulaire
// import { profileService } from '../services/profileService';

/**
 * Événements liés à la photo de profil pour la communication entre les composants
 */
export const profilePictureEvents = {
  UPLOADED: 'profile_picture_uploaded',
  DELETED: 'profile_picture_deleted',
  ERROR: 'profile_picture_error'
};

/**
 * Hook personnalisé pour gérer la photo de profil
 * @returns {Object} Méthodes et états pour gérer la photo de profil
 */
export const useProfilePicture = () => {
  // États pour gérer les différentes opérations
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  /**
   * Téléverser une nouvelle photo de profil
   * @param {File} file - Fichier image à téléverser
   * @returns {Promise<Object>} Résultat du téléversement
   */
  const uploadProfilePicture = useCallback(async (file) => {
    if (!file) return null;
    
    try {
      setIsUploading(true);
      
      // Valider le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Le format du fichier doit être JPG ou PNG');
      }
      
      // Valider la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La taille du fichier ne doit pas dépasser 5MB');
      }
      
      // Préparer les données du formulaire
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      // Import dynamique du service pour éviter la dépendance circulaire
      const { profileService } = await import('../services/profileService');
      
      // Envoyer la requête
      const result = await profileService.uploadProfilePicture(formData);
      
      // Révoquer l'URL de prévisualisation si elle existe
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      return result;
    } catch (error) {
      console.error("Erreur lors du téléversement de la photo de profil:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [previewUrl]);
  
  /**
   * Supprimer la photo de profil
   * @returns {Promise<Object>} Résultat de la suppression
   */
  const deleteProfilePicture = useCallback(async () => {
    try {
      setIsDeleting(true);
      
      // Import dynamique du service pour éviter la dépendance circulaire
      const { profileService } = await import('../services/profileService');
      
      const result = await profileService.deleteProfilePicture();
      
      // Révoquer l'URL de prévisualisation si elle existe
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
                return result;
    } catch (error) {
      console.error("Erreur lors de la suppression de la photo de profil:", error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [previewUrl]);
  
  /**
   * Créer une URL de prévisualisation pour une image
   * @param {File} file - Fichier image
   */
  const createPreview = useCallback((file) => {
    if (!file) return;
    
    // Révoquer l'URL précédente si elle existe
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Créer une nouvelle URL de prévisualisation
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, [previewUrl]);
  
  /**
   * Nettoyer les ressources lors du démontage du composant
   */
  const cleanup = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  return {
    uploadProfilePicture,
    deleteProfilePicture,
    createPreview,
    cleanup,
    isUploading,
    isDeleting,
    previewUrl
  };
}; 