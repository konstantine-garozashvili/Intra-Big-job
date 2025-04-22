import React, { useState, useCallback, memo } from 'react';
import { Download, Upload, FileText, Trash2, AlertCircle, File, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useApiQuery, useApiMutation } from '@/hooks/useReactQuery';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Importer le service documentService directement dans le composant
import documentService from '../../services/documentService';
import { notificationService } from '@/lib/services/notificationService';
import { documentNotifications } from '@/lib/utils/documentNotifications';

const CVUpload = memo(({ userData, onUpdate }) => {
  const [cvFile, setCvFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch CV document using React Query
  const { 
    data: cvDocuments, 
    isLoading: isLoadingCV,
    refetch: refetchCV
  } = useApiQuery('/api/documents/type/CV', 'userCVDocument', {
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("Error fetching CV document:", error);
    }
  });

  // Get the first CV document if available
  const cvDocument = cvDocuments?.data?.[0] || null;

  // Mutation for uploading CV
  const { 
    mutate: uploadCV,
    isPending: isUploading
  } = useApiMutation('/api/documents/upload/cv', 'post', 'userCVDocument', {
    onSuccess: () => {
      toast.success('CV téléchargé avec succès');
      setCvFile(null);
      
      // Dispatch event to notify MainLayout about the update
      document.dispatchEvent(new CustomEvent('user:data-updated'));
      
      // Create document uploaded notification using the utility
      // D'abord récupérer les données à jour du document
      refetchCV().then(data => {
        if (data && data.data && data.data[0]) {
          // Forcer la création de la notification frontend (même si normalement gérée par le backend)
          documentNotifications.uploaded({
            name: data.data[0].name || 'CV',
            id: data.data[0].id
          }, null, true);
          console.log('Notification de téléchargement de CV créée avec succès');
        } else {
          // Fallback si on ne peut pas obtenir les données du document
          documentNotifications.uploaded({
            name: 'CV',
            id: Date.now()
          }, null, true);
          console.log('Notification de téléchargement de CV créée avec données par défaut');
        }
      }).catch(err => {
        console.error('Erreur lors de la récupération du document CV:', err);
        // Créer quand même une notification en cas d'erreur
        documentNotifications.uploaded({
          name: 'CV',
          id: Date.now()
        }, null, true);
      });
      
      // Reset file input
      const fileInput = document.getElementById('cv-upload');
      if (fileInput) fileInput.value = '';
    },
    onError: (error) => {
      toast.error('Failed to upload CV: ' + (error.response?.data?.message || error.message));
    }
  });

  // Mutation for deleting CV
  const { 
    mutate: deleteCV,
    isPending: isDeleting
  } = useApiMutation((id) => `/api/documents/${id}`, 'delete', 'userCVDocument', {
    onSuccess: () => {
      toast.success('CV deleted successfully');
      refetchCV();
      
      // Dispatch event to notify MainLayout about the update
      document.dispatchEvent(new CustomEvent('user:data-updated'));

      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      toast.error('Failed to delete CV: ' + (error.response?.data?.message || error.message));
    }
  });

  // Handle file selection
  const handleCvFileChange = useCallback((event) => {
    setFileError(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("File is too large. Maximum size is 10MB.");
        return;
      }
      
      // Check file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setFileError("Unsupported file format. Please use PDF, DOC, or DOCX.");
        return;
      }
      
      setCvFile(file);
    }
  }, []);
  
  // Handle CV upload
  const handleCvUpload = useCallback(() => {
    if (!cvFile) {
      toast.error('Please select a file');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', cvFile);
    uploadCV(formData);
  }, [cvFile, uploadCV]);

  // Handle document deletion
  const handleDeleteDocument = useCallback(() => {
    if (!cvDocument || !cvDocument.id) {
      toast.error('No document to delete');
      return;
    }
    
    setDeleteDialogOpen(true);
  }, [cvDocument]);

  // Execute CV deletion
  const confirmDeleteDocument = useCallback(() => {
    if (!cvDocument || !cvDocument.id) {
      toast.error('No document to delete');
      return;
    }
    
    // Close dialog immediately for fluid interaction
    setDeleteDialogOpen(false);
    
    // Store document info before deletion
    const documentInfo = {
      id: cvDocument.id,
      name: cvDocument.name
    };
    
    // Supprimer le document - le backend créera la notification
    deleteCV(cvDocument.id);
    
    // Check if user is student or guest and create frontend notification as backup
    // This is a redundancy mechanism to ensure notifications work for all user roles
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isStudent = user?.roles?.includes('ROLE_STUDENT');
    const isGuest = user?.roles?.includes('ROLE_GUEST');
    
    if (isStudent || isGuest) {
      console.log('Creating backup frontend notification for student/guest user');
      // Force creation of notification in frontend (bypassing backend check)
      documentNotifications.deleted(documentInfo, null, true);
    }
    
  }, [cvDocument, deleteCV]);

  // Handle document download
  const handleDownloadDocument = useCallback(async () => {
    if (!cvDocument || !cvDocument.id) {
      toast.error('No document to download');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/documents/${cvDocument.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = cvDocument.name || 'cv.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Document téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
      toast.error('Erreur lors du téléchargement du CV');
    }
  }, [cvDocument]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  // Handle drop event
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setFileError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("File is too large. Maximum size is 10MB.");
        return;
      }
      
      // Check file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setFileError("Unsupported file format. Please use PDF, DOC, or DOCX.");
        return;
      }
      
      setCvFile(file);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer votre CV ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDocument}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CV Document Display */}
      {cvDocument && (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium text-sm sm:text-base truncate">{cvDocument.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Ajouté le {new Date(cvDocument.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadDocument}
                disabled={isDeleting}
                className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9 justify-center"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                Télécharger
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteDocument}
                disabled={isDeleting}
                className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9 justify-center text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CV Upload Area */}
      {!cvDocument && (
        <div 
          className={`border-2 border-dashed rounded-lg p-3 sm:p-6 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2 sm:space-y-4"
          >
            <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500" />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-sm sm:text-lg font-medium">Déposez votre CV ici</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Glissez-déposez votre fichier ici, ou cliquez pour parcourir
              </p>
            </div>
            <div>
              <input
                id="cv-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCvFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('cv-upload').click()}
                className="mx-auto text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
              >
                Parcourir les fichiers
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Formats acceptés : PDF, DOC, DOCX (max 10MB)
            </p>
          </motion.div>
        </div>
      )}

      {/* File Selected Display */}
      {cvFile && !cvDocument && (
        <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 w-full sm:w-auto">
              <File className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-xs sm:text-sm truncate">{cvFile.name}</h3>
                <p className="text-xs text-gray-500">
                  {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              onClick={handleCvUpload}
              disabled={isUploading}
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9 justify-center"
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Envoi en cours...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {fileError && (
        <div className="mt-2 p-2 sm:p-3 bg-red-50 text-red-700 rounded-md flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm flex-1">{fileError}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoadingCV && !cvDocument && !cvFile && (
        <div className="text-center py-4 sm:py-6">
          <div className="animate-pulse flex flex-col items-center space-y-2 sm:space-y-3">
            <div className="rounded-full bg-gray-200 h-8 w-8 sm:h-10 sm:w-10"></div>
            <div className="h-2 sm:h-3 bg-gray-200 rounded w-32 sm:w-40"></div>
            <div className="h-2 bg-gray-200 rounded w-24 sm:w-32"></div>
          </div>
        </div>
      )}
    </div>
  );
});

// Add display name for debugging
CVUpload.displayName = 'CVUpload';

export default CVUpload; 