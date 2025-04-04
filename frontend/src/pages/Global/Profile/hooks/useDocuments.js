import { useApiQuery, useApiMutation } from '@/hooks/useReactQuery';
import { toast } from 'sonner';
import documentService from '../services/documentService';

// Définir les clés de requête constantes
const DOCUMENT_QUERY_KEYS = {
  byType: (type) => ['documents', 'byType', type],
  publicByUser: (userId) => ['documents', 'public', userId],
};

/**
 * Hook personnalisé pour gérer les documents
 * @param {string} type - Type de document (CV, etc.)
 * @returns {Object} - Fonctions et données pour gérer les documents
 */
export const useDocuments = (type) => {
  // Query pour récupérer les documents
  const { 
    data: documents, 
    isLoading,
    refetch
  } = useApiQuery(
    `/api/documents/type/${type}`,  // Endpoint sous forme de chaîne
    DOCUMENT_QUERY_KEYS.byType(type),
    {
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error(`Error fetching ${type} documents:`, error);
        toast.error(`Failed to fetch ${type} documents`);
      }
    }
  );

  // Mutation pour l'upload de CV
  const { mutate: uploadDocument, isPending: isUploading } = useApiMutation(
    '/api/documents/upload/cv',
    'post',
    DOCUMENT_QUERY_KEYS.byType(type),
    {
      onSuccess: () => {
        toast.success('Document uploaded successfully');
        refetch();
        // Notify MainLayout about the update
        document.dispatchEvent(new CustomEvent('user:data-updated'));
      },
      onError: (error) => {
        toast.error('Failed to upload document: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  // Mutation pour la suppression
  const { mutate: deleteDocument, isPending: isDeleting } = useApiMutation(
    (id) => `/api/documents/${id}`,
    'delete',
    DOCUMENT_QUERY_KEYS.byType(type),
    {
      onSuccess: () => {
        toast.success('Document deleted successfully');
        refetch();
        // Notify MainLayout about the update
        document.dispatchEvent(new CustomEvent('user:data-updated'));
      },
      onError: (error) => {
        toast.error('Failed to delete document: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  // Fonction pour le téléchargement
  const downloadDocument = async (documentId, fileName) => {
    try {
      await documentService.downloadDocument(documentId);
      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
      console.error('Error downloading document:', error);
    }
  };

  return {
    documents: documents?.data || [],
    isLoading,
    isUploading,
    isDeleting,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    refetch
  };
};

/**
 * Hook pour récupérer les documents publics d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Object} - Documents publics de l'utilisateur
 */
export const usePublicDocuments = (userId) => {
  const { 
    data: documents, 
    isLoading,
    error,
    refetch
  } = useApiQuery(
    `/api/profile/public/${userId}/documents`,
    DOCUMENT_QUERY_KEYS.publicByUser(userId),
    {
      refetchOnWindowFocus: false,
      enabled: !!userId,
      onError: (error) => {
        console.error(`Error fetching public documents for user ${userId}:`, error);
      }
    }
  );

  // Fonction pour le téléchargement
  const downloadDocument = async (documentId, fileName) => {
    try {
      await documentService.downloadDocument(documentId);
      toast.success('Document téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement du document');
      console.error('Error downloading document:', error);
    }
  };

  return {
    documents: documents?.data?.documents || [],
    isLoading,
    error,
    downloadDocument,
    refetch
  };
}; 