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
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  // Fonction pour télécharger un document
  const downloadDocument = useCallback(async (documentId, filename) => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  // Fonction pour supprimer un document
  const deleteDocument = useCallback(async (documentId) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Mettre à jour la liste des documents après suppression
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Fonction pour uploader un CV
  const uploadCV = useCallback(async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/documents/cv', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Ajouter le nouveau document à la liste
      if (result.success && result.data) {
        setDocuments(prev => [...prev, result.data]);
      }
      
      return result;
    } catch (err) {
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setIsUploading(false);
    }
  }, []);

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