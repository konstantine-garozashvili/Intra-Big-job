import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/documentService';

/**
 * Hook personnalisé pour gérer les opérations liées aux documents
 * Simplifie l'utilisation des documents dans les différents composants
 * 
 * @returns {Object} Méthodes pour manipuler les documents et états associés
 */
export const useDocuments = () => {
  const queryClient = useQueryClient();
  
  // États de chargement pour les différentes opérations
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Récupérer tous les documents d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Array>} Liste des documents
   */
  const getUserDocuments = async (userId) => {
    try {
      return await documentService.getUserDocuments(userId);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      return [];
    }
  };

  /**
   * Télécharger un document
   * @param {number} documentId - ID du document à télécharger
   * @returns {Promise<Blob>} Le document téléchargé
   */
  const downloadDocument = async (documentId) => {
    setIsDownloading(true);
    try {
      const result = await documentService.downloadDocument(documentId);
      return result;
    } catch (error) {
      console.error("Erreur lors du téléchargement du document:", error);
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Supprimer un document
   * @param {number} documentId - ID du document à supprimer
   * @returns {Promise<boolean>} Résultat de la suppression
   */
  const deleteDocument = async (documentId) => {
    setIsDeleting(true);
    try {
      const result = await documentService.deleteDocument(documentId);
      // Rafraîchir les données de documents après suppression
      queryClient.invalidateQueries(['userDocuments']);
      return result;
    } catch (error) {
      console.error("Erreur lors de la suppression du document:", error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Envoyer un nouveau document
   * @param {FormData} formData - Données du formulaire contenant le document
   * @returns {Promise<Object>} Le document ajouté
   */
  const uploadDocument = async (formData) => {
    setIsUploading(true);
    try {
      const result = await documentService.uploadDocument(formData);
      // Rafraîchir les données de documents après ajout
      queryClient.invalidateQueries(['userDocuments']);
      return result;
    } catch (error) {
      console.error("Erreur lors de l'envoi du document:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    getUserDocuments,
    downloadDocument,
    deleteDocument,
    uploadDocument,
    isDownloading,
    isUploading,
    isDeleting
  };
}; 