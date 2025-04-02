import axios from 'axios';
import authService from '@services/authService';
import apiService from '@/lib/services/apiService';

// Updated to use the base URL without /api as the prefix is already added in apiService
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Simple event emitter for document updates
export const documentEvents = {
  listeners: new Set(),
  
  // Subscribe to document updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  // Notify all subscribers about document updates
  notify() {
    this.listeners.forEach(callback => callback());
  }
};

// Cache for document requests
const documentCache = {
  documents: null,
  documentsByType: {},
  lastFetch: null,
  cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  isValid() {
    return this.lastFetch && (Date.now() - this.lastFetch < this.cacheDuration);
  },
  
  clear() {
    this.documents = null;
    this.documentsByType = {};
    this.lastFetch = null;
    
    // Also invalidate the API service cache
    apiService.invalidateDocumentCache();
  },
  
  // Mettre à jour le cache avec des données optimistes
  updateOptimistically(type, document) {
    if (!this.documents) {
      this.documents = [];
    }
    
    // Ajouter le document au cache global
    this.documents.push(document);
    
    // Ajouter le document au cache par type
    const normalizedType = type.toUpperCase();
    if (!this.documentsByType[normalizedType]) {
      this.documentsByType[normalizedType] = [];
    }
    
    this.documentsByType[normalizedType].push(document);
  },
  
  // Supprimer un document du cache
  removeDocument(documentId) {
    if (this.documents) {
      this.documents = this.documents.filter(doc => doc.id !== documentId);
    }
    
    // Supprimer de tous les caches par type
    Object.keys(this.documentsByType).forEach(type => {
      if (this.documentsByType[type]) {
        this.documentsByType[type] = this.documentsByType[type].filter(doc => doc.id !== documentId);
      }
    });
  }
};

/**
 * Document service to handle all document-related operations
 */
class DocumentService {
  /**
   * Get all documents for the current user
   * @param {boolean} [forceRefresh=false] - Force a refresh of the cache
   * @returns {Promise<Array>} Array of documents
   */
  async getDocuments(forceRefresh = false) {
    if (!forceRefresh && documentCache.isValid() && documentCache.documents) {
      return documentCache.documents;
    }
    
    try {
      const response = await apiService.get('/api/documents');
      
      const documents = response.data || [];
      
      documentCache.documents = documents;
      documentCache.lastFetch = Date.now();
      
      return documents;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload a CV document
   * @param {FormData} formData - FormData containing the file to upload
   * @returns {Promise<Object>} Response data containing the document
   */
  async uploadCV(formData) {
    try {
      // Extraire le fichier pour l'optimistic update
      const file = formData.get('file') || formData.get('cv');
      
      if (!file) {
        console.error('No file found in formData - keys:', Array.from(formData.keys()));
        throw new Error('No file provided');
      }
      
      console.log('DocumentService.uploadCV - File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Make sure type is included in the formData
      if (!formData.has('type')) {
        formData.append('type', 'CV');
      }
      
      // Créer un document temporaire pour l'optimistic update
      const tempDocument = {
        id: `temp-${Date.now()}`,
        type: 'CV',
        name: file ? file.name : 'CV en cours d\'upload',
        mime_type: file ? file.type : 'application/pdf',
        created_at: new Date().toISOString(),
        is_temp: true // Marquer comme temporaire
      };
      
      // Mettre à jour le cache avec le document temporaire
      documentCache.updateOptimistically('CV', tempDocument);
      
      // Notifier les abonnés de la mise à jour optimiste
      documentEvents.notify();
      
      // Create a proper config for file upload with correct CORS settings
      const config = {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: false // Set to false to avoid requiring Access-Control-Allow-Credentials header
      };
      
      console.log('DocumentService.uploadCV - Sending request to:', '/api/documents/upload/cv');
      
      let response;
      
      try {
        // First try direct axios call with full URL to avoid any CORS issues
        response = await axios({
          method: 'post',
          url: `${API_URL}/api/documents/upload/cv`, // Remove duplicated /api/ since API_URL already contains it
          data: formData,
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: false // Set to false to avoid requiring Access-Control-Allow-Credentials header
        });
      } catch (axiosError) {
        console.error('DocumentService.uploadCV - Direct axios call failed:', axiosError);
        console.error('Error response:', axiosError.response);
        console.error('Error request:', axiosError.request);
        
        if (axiosError.response?.status === 0 || (axiosError.message && axiosError.message.includes('CORS'))) {
          console.log('CORS error detected, trying alternative upload method...');
          
          // Fall back to using apiService
          response = await apiService.post('/api/documents/upload/cv', formData, {
            raw: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: false // Ensure this is false for the apiService as well
          });
        } else {
          // Re-throw for other errors
          throw axiosError;
        }
      }
      
      console.log('DocumentService.uploadCV - Upload success:', response.data);
      
      // Clear cache after upload
      documentCache.clear();
      
      // Notify subscribers about the update
      documentEvents.notify();
      
      return response;
    } catch (error) {
      // Log detailed error information
      console.error('DocumentService.uploadCV - Error:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      }
      
      // En cas d'erreur, forcer un rafraîchissement pour supprimer les documents temporaires
      documentCache.clear();
      documentEvents.notify();
      throw error;
    }
  }

  /**
   * Upload a CV for a specific student (admin/superadmin only)
   * @param {FormData} formData - FormData containing the file to upload
   * @param {number} studentId - The ID of the student
   * @returns {Promise<Object>} Response data
   */
  async uploadCVForStudent(formData, studentId) {
    try {
      // Extraire le fichier pour l'optimistic update
      const file = formData.get('file') || formData.get('cv');
      
      // Créer un document temporaire pour l'optimistic update
      const tempDocument = {
        id: `temp-${Date.now()}`,
        type: 'CV',
        name: file ? file.name : 'CV en cours d\'upload',
        mime_type: file ? file.type : 'application/pdf',
        created_at: new Date().toISOString(),
        student_id: studentId,
        is_temp: true // Marquer comme temporaire
      };
      
      // Mettre à jour le cache avec le document temporaire
      documentCache.updateOptimistically('CV', tempDocument);
      
      // Notifier les abonnés de la mise à jour optimiste
      documentEvents.notify();
      
      const config = {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      };
      
      // Use apiService instead of direct axios call
      const response = await apiService.post(`/api/documents/upload/cv/${studentId}`, formData, config);
      
      documentCache.clear();
      
      // Notify subscribers about the update
      documentEvents.notify();
      
      return response;
    } catch (error) {
      // En cas d'erreur, forcer un rafraîchissement pour supprimer les documents temporaires
      documentCache.clear();
      documentEvents.notify();
      throw error;
    }
  }

  /**
   * Download a document
   * @param {number} documentId - The ID of the document to download
   * @returns {Promise<Blob>} Blob containing the document
   */
  async downloadDocument(documentId) {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        },
        responseType: 'blob',
        withCredentials: false // Set to false to avoid CORS issues
      };
      
      // Use direct axios call with correct URL (no duplicate /api)
      const response = await axios.get(
        `${API_URL}/api/documents/${documentId}/download`,
        config
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a document
   * @param {number} documentId - The ID of the document to delete
   * @returns {Promise<Object>} Response data
   */
  async deleteDocument(documentId) {
    try {
      // Remove from cache first for optimistic UI update
      documentCache.removeDocument(documentId);
      
      // Notify subscribers about the update
      documentEvents.notify();
      
      const response = await apiService.delete(`/api/documents/${documentId}`);
      
      // Clear the cache after deletion
      documentCache.clear();
      
      // Notify subscribers about the update again after server confirmation
      documentEvents.notify();
      
      return response;
    } catch (error) {
      // Refresh cache in case of error
      documentCache.clear();
      documentEvents.notify();
      throw error;
    }
  }

  /**
   * Get documents by type (CV, DIPLOME, etc.)
   * @param {string} type - Document type to filter by
   * @param {boolean} [forceRefresh=false] - Force a refresh of the cache
   * @returns {Promise<Array>} Array of documents of the specified type
   */
  async getDocumentByType(type, forceRefresh = false) {
    const normalizedType = type.toUpperCase();
    
    // Check if we have cached documents of this type
    if (!forceRefresh && documentCache.isValid() && documentCache.documentsByType[normalizedType]) {
      return documentCache.documentsByType[normalizedType];
    }
    
    try {
      const response = await apiService.get(`/api/documents/type/${normalizedType}`);
      
      const documents = response.data || [];
      
      // Cache the documents by type
      documentCache.documentsByType[normalizedType] = documents;
      documentCache.lastFetch = Date.now();
      
      return documents;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear the document cache
   */
  clearCache() {
    documentCache.clear();
    documentEvents.notify();
  }

  async getAllDocuments() {
    try {
      const response = await apiService.get('/api/documents');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDocumentById(id) {
    try {
      const response = await apiService.get(`/api/documents/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDocumentByType(type) {
    try {
      const response = await apiService.get(`/api/documents/type/${type}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadDocument(file, type, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await apiService.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async uploadCV(file) {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await apiService.post('/api/documents/upload/cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteDocument(id) {
    try {
      const response = await apiService.delete(`/api/documents/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateDocument(id, data) {
    try {
      const response = await apiService.put(`/api/documents/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const documentService = new DocumentService();
export default documentService; 