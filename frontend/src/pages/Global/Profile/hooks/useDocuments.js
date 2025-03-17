import { useState, useEffect, useCallback } from 'react';
import documentService, { documentEvents } from '../services/documentService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook personnalisé pour gérer les documents CV
 * @returns {Object} Méthodes et données pour gérer les documents CV
 */
export function useDocuments(type = 'CV') {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  // Fonction pour charger les documents
  const loadDocuments = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let docs;
      if (type) {
        docs = await documentService.getDocumentByType(type, forceRefresh);
      } else {
        docs = await documentService.getDocuments(forceRefresh);
      }
      
      // Filtrer les documents temporaires
      const filteredDocs = docs.filter(doc => !doc.is_temp);
      
      setDocuments(filteredDocs);
    } catch (err) {
      setError(err);
      console.error('Erreur lors du chargement des documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  // Fonction pour télécharger un document
  const downloadDocument = useCallback(async (documentId, fileName) => {
    try {
      const blob = await documentService.downloadDocument(documentId);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `document-${documentId}.pdf`);
      
      // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer l'URL
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      console.error('Erreur lors du téléchargement du document:', err);
      toast.error('Erreur lors du téléchargement du document');
      return false;
    }
  }, []);

  // Fonction pour supprimer un document
  const deleteDocument = useCallback(async (documentId) => {
    try {
      await documentService.deleteDocument(documentId);
      
      // Mise à jour optimiste de l'état local
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
      
      toast.success('Document supprimé avec succès');
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du document:', err);
      toast.error('Erreur lors de la suppression du document');
      
      // Recharger les documents en cas d'erreur
      loadDocuments(true);
      return false;
    }
  }, [loadDocuments]);

  // Fonction pour uploader un CV
  const uploadCV = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await documentService.uploadCV(formData);
      
      toast.success('CV uploadé avec succès');
      
      // Recharger les documents après l'upload
      loadDocuments(true);
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'upload du CV:', err);
      toast.error('Erreur lors de l\'upload du CV');
      return false;
    }
  }, [loadDocuments]);

  // Écouter les événements de mise à jour des documents
  useEffect(() => {
    // Charger les documents au montage du composant
    loadDocuments();
    
    // S'abonner aux événements de mise à jour
    const unsubscribe = documentEvents.subscribe(() => {
      loadDocuments(true);
    });
    
    // Se désabonner lors du démontage du composant
    return () => unsubscribe();
  }, [loadDocuments]);

  return {
    documents,
    isLoading,
    error,
    refreshDocuments: () => loadDocuments(true),
    downloadDocument,
    deleteDocument,
    uploadCV
  };
} 