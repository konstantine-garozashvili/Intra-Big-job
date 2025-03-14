import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import documentService from '../../services/documentService';
import { Button } from "@/components/ui/button";
import { Download, Trash2, Upload } from 'lucide-react';

const CVUploadTest = () => {
  const [cvDocument, setCvDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch CV document on component mount
  useEffect(() => {
    const fetchCvDocument = async () => {
      try {
        setLoading(true);
        // console.log("CVUploadTest: Fetching CV document...");
        
        // Get CV document by type
        const cvResponse = await documentService.getDocumentByType('CV');
        // console.log("CVUploadTest: CV response:", cvResponse);
        
        if (cvResponse && Array.isArray(cvResponse) && cvResponse.length > 0) {
          // console.log("CVUploadTest: Setting CV document:", cvResponse[0]);
          setCvDocument(cvResponse[0]);
        } else {
          // console.log("CVUploadTest: No CV document found");
        }
      } catch (error) {
        // console.error("CVUploadTest: Error fetching CV:", error);
        toast.error("Failed to fetch CV document");
      } finally {
        setLoading(false);
      }
    };

    fetchCvDocument();
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  // Handle CV upload
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await documentService.uploadCV(formData);
      // console.log("Upload response:", response);
      
      if (response && response.document) {
        setCvDocument(response.document);
      } else if (response) {
        setCvDocument(response);
      }
      
      setFile(null);
      toast.success('CV uploaded successfully');
      
      // Reset file input
      const fileInput = document.getElementById('cv-test-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      // console.error('Error uploading CV:', error);
      toast.error('Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  // Handle document deletion
  const handleDelete = async () => {
    if (!cvDocument || !cvDocument.id) {
      toast.error('No document to delete');
      return;
    }
    
    try {
      // console.log("Deleting document with ID:", cvDocument.id);
      const response = await documentService.deleteDocument(cvDocument.id);
      // console.log("Delete response:", response);
      
      setCvDocument(null);
      toast.success('CV deleted successfully');
    } catch (error) {
      // console.error('Error deleting CV:', error);
      toast.error('Failed to delete CV');
    }
  };

  // Handle document download
  const handleDownload = async () => {
    if (!cvDocument || !cvDocument.id) {
      toast.error('No document to download');
      return;
    }
    
    try {
      // console.log("Downloading document with ID:", cvDocument.id);
      const blob = await documentService.downloadDocument(cvDocument.id);
      // console.log("Download blob received:", blob);
      
      // Create a URL for the blob and trigger download
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
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      // console.error('Error downloading CV:', error);
      toast.error('Failed to download CV');
    }
  };

  if (loading) {
    return <div>Loading CV document...</div>;
  }

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">CV Upload Test Component</h2>
      
      {cvDocument ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium">Current CV Document:</h3>
            <p>ID: {cvDocument.id}</p>
            <p>Name: {cvDocument.name}</p>
            <p>Type: {cvDocument.type}</p>
            <p>Uploaded: {new Date(cvDocument.uploadedAt).toLocaleString()}</p>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
            >
              <Download className="h-4 w-4" />
              Test Download
            </Button>
            
            <Button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Test Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p>No CV document found. Upload one below:</p>
          
          <div className="flex flex-col gap-4">
            <input
              id="cv-test-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="border p-2 rounded"
            />
            
            {file && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload CV
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
        <h3 className="font-medium">Debug Information:</h3>
        <pre className="text-xs mt-2 overflow-auto max-h-40">
          {cvDocument ? JSON.stringify(cvDocument, null, 2) : "No document data"}
        </pre>
      </div>
    </div>
  );
};

export default CVUploadTest; 