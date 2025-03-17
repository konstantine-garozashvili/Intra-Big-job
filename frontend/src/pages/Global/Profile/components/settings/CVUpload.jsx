import React, { useState, useCallback, memo } from 'react';
import { Download, Upload, FileText, Trash2, AlertCircle, File, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useCV } from '../../hooks/useCV';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CVUpload = memo(({ userData, onUpdate }) => {
  const [cvFile, setCvFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Use our custom CV hook
  const {
    cvDocument,
    isLoading,
    isFetching,
    uploadCV,
    deleteCV,
    downloadCV,
    uploadStatus,
    deleteStatus
  } = useCV();

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
    
    uploadCV(formData, {
      onSuccess: () => {
        toast.success('CV uploaded successfully');
        setCvFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('cv-upload');
        if (fileInput) fileInput.value = '';
        
        // Notify parent component if needed
        if (onUpdate) onUpdate();
      },
      onError: (error) => {
        toast.error('Failed to upload CV: ' + (error.response?.data?.message || error.message));
      }
    });
  }, [cvFile, uploadCV, onUpdate]);

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
    
    deleteCV(cvDocument.id, {
      onSuccess: () => {
        toast.success('CV deleted successfully');
        setDeleteDialogOpen(false);
        
        // Notify parent component if needed
        if (onUpdate) onUpdate();
      },
      onError: (error) => {
        toast.error('Failed to delete CV: ' + (error.response?.data?.message || error.message));
      }
    });
  }, [cvDocument, deleteCV, onUpdate]);

  // Handle document download
  const handleDownloadDocument = useCallback(async () => {
    if (!cvDocument || !cvDocument.id) {
      toast.error('No document to download');
      return;
    }
    
    try {
      await downloadCV();
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast.error('Error downloading CV');
    }
  }, [cvDocument, downloadCV]);

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

  // Determine if component is loading
  const componentIsLoading = isLoading || isFetching || uploadStatus.isPending || deleteStatus.isPending;

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">CV / Curriculum Vitae</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Téléversez votre CV au format PDF, DOC ou DOCX</p>
        </div>
        {/* CV Actions */}
        {cvDocument && (
          <div className="flex mt-2 sm:mt-0 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadDocument}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteDocument}
              disabled={deleteStatus.isPending}
              className="text-xs sm:text-sm h-8 sm:h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {deleteStatus.isPending ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-600 mr-1.5"></div>
              ) : (
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              )}
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* CV Display */}
      {cvDocument && !cvFile && (
        <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                {cvDocument.name}
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Uploaded on {new Date(cvDocument.created_at).toLocaleDateString()}
              </p>
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
              disabled={uploadStatus.isPending}
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9 justify-center"
            >
              {uploadStatus.isPending ? (
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
      {componentIsLoading && !cvDocument && !cvFile && (
        <div className="text-center py-4 sm:py-6">
          <div className="animate-pulse flex flex-col items-center space-y-2 sm:space-y-3">
            <div className="rounded-full bg-gray-200 h-8 w-8 sm:h-10 sm:w-10"></div>
            <div className="h-2 sm:h-3 bg-gray-200 rounded w-32 sm:w-40"></div>
            <div className="h-2 bg-gray-200 rounded w-24 sm:w-32"></div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !deleteStatus.isPending && setDeleteDialogOpen(open)}>
        <DialogContent className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-hidden rounded-2xl border-0 shadow-xl">
          <div className="overflow-y-auto max-h-[70vh] fade-in-up">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Confirmation de suppression</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Êtes-vous sûr de vouloir supprimer votre CV ? Cette action est irréversible.
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
              onClick={confirmDeleteDocument}
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
});

// Add display name for debugging
CVUpload.displayName = 'CVUpload';

export default CVUpload; 