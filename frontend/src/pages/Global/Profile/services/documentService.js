import axios from 'axios';
import authService from '@services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
      const response = await axios.get(
        `${API_URL}/documents`,
        {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );
      
      const documents = response.data.data || [];
      
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
      formData.append('type', 'CV');
      
      const config = {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      };
      
      const response = await axios.post(
        `${API_URL}/documents/upload/cv`, 
        formData,
        config
      );
      
      // Clear cache after upload
      documentCache.clear();
      
      // Notify subscribers about the update
      documentEvents.notify();
      
      return response.data;
    } catch (error) {
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
      const config = {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      };
      
      const response = await axios.post(
        `${API_URL}/documents/upload/cv/${studentId}`, 
        formData,
        config
      );
      
      documentCache.clear();
      
      // Notify subscribers about the update
      documentEvents.notify();
      
      return response.data;
    } catch (error) {
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
      const response = await axios.get(
        `${API_URL}/documents/${documentId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          },
          responseType: 'blob'
        }
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
      const response = await axios.delete(
        `${API_URL}/documents/${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );
      
      documentCache.clear();
      
      // Notify subscribers about the update
      documentEvents.notify();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get document by type (e.g., get CV)
   * @param {string} type - The type code of the document (e.g., 'CV')
   * @param {boolean} [forceRefresh=false] - Force a refresh of the cache
   * @returns {Promise<Array>} Array of documents matching the type
   */
  async getDocumentByType(type, forceRefresh = false) {
    const normalizedType = type.toUpperCase();
    
    if (!forceRefresh && documentCache.isValid() && documentCache.documentsByType[normalizedType]) {
      return documentCache.documentsByType[normalizedType];
    }
    
    try {
      const response = await axios.get(
        `${API_URL}/documents/type/${normalizedType}`,
        {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        }
      );
      
      const documents = response.data.data || [];
      
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
  }
}

export default new DocumentService(); 