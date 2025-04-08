import { useCallback } from 'react';
import { documentService } from '../services/documentService';

/**
 * Hook personnalisé pour gérer le CV de l'utilisateur
 * Fournit des méthodes pour récupérer, télécharger et gérer le CV
 * 
 * @returns {Object} Méthodes et états pour manipuler le CV
 */
export const useCV = () => {
  /**
   * Télécharger le CV
   * @param {number} documentId - ID du document CV
   * @param {string} filename - Nom du fichier à télécharger
   */
  const downloadCV = useCallback(async (documentId, filename) => {
    try {
      const blob = await documentService.downloadDocument(documentId);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'CV.pdf';
      
      // Ajouter temporairement à la page, cliquer et nettoyer
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error("Erreur lors du téléchargement du CV:", error);
      return false;
    }
  }, []);

  /**
   * Récupérer le CV actuel de l'utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object|null>} Document CV ou null si non trouvé
   */
  const getCurrentCV = useCallback(async (userId) => {
    try {
      const documents = await documentService.getUserDocuments(userId);
      return documents.find(doc => doc.type === 'CV') || null;
    } catch (error) {
      console.error("Erreur lors de la récupération du CV:", error);
      return null;
    }
  }, []);

  /**
   * Vérifier si l'utilisateur a un CV
   * @param {Object} userData - Données utilisateur
   * @returns {boolean} True si l'utilisateur a un CV
   */
  const hasCV = useCallback((userData) => {
    if (!userData || !userData.documents) return false;
    return userData.documents.some(doc => doc.type === 'CV');
  }, []);

  /**
   * Récupérer l'URL du CV
   * @param {number} documentId - ID du document CV
   * @returns {Promise<string|null>} URL du CV ou null en cas d'erreur
   */
  const getCVUrl = useCallback(async (documentId) => {
    try {
      return await documentService.getDocumentUrl(documentId);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'URL du CV:", error);
      return null;
    }
  }, []);

  /**
   * Téléverser un nouveau CV
   * @param {File} file - Fichier CV à téléverser
   * @returns {Promise<Object>} Résultat du téléversement
   */
  const uploadCV = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', 'CV');
      
      return await documentService.uploadDocument(formData);
    } catch (error) {
      console.error("Erreur lors du téléversement du CV:", error);
      throw error;
    }
  }, []);

  return {
    downloadCV,
    getCurrentCV,
    hasCV,
    getCVUrl,
    uploadCV
  };
}; 