import axiosInstance from '@/lib/axios';
import authService from '@services/authService';
import apiService from '@/lib/services/apiService';

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
      const response = await axiosInstance.get('/documents');
      
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
      // Extraire le fichier pour l'optimistic update
      const file = formData.get('file') || formData.get('cv');
      
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
      
      // Ajouter le type au formData
      formData.append('type', 'CV');
      
      const response = await axiosInstance.post('/documents/upload/cv', formData);
      
      // Clear cache after upload
      documentCache.clear();
      
      // Notify subscribers about the update
      documentEvents.notify();
      
      return response.data;
    } catch (error) {
      // En cas d'erreur, forcer un rafraîchissement pour supprimer les documents temporaires
      documentCache.clear();
      documentEvents.notify();
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
      
      const response = await axiosInstance.post(`/documents/upload/cv/${studentId}`, formData);
      
      documentCache.clear();
      
      // Notify subscribers about the update
      documentEvents.notify();
      
      return response.data;
    } catch (error) {
      // En cas d'erreur, forcer un rafraîchissement pour supprimer les documents temporaires
      documentCache.clear();
      documentEvents.notify();
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
      const response = await axiosInstance.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
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
      // Optimistically remove the document from the cache
      documentCache.removeDocument(documentId);
      
      // Notify subscribers about the optimistic update
      documentEvents.notify();
      
      const response = await axiosInstance.delete(`/documents/${documentId}`);
      
      // Clear cache after delete
      documentCache.clear();
      
      // Notify subscribers about the update
      documentEvents.notify();
      
      return response.data;
    } catch (error) {
      // En cas d'erreur, forcer un rafraîchissement pour supprimer les documents temporaires
      documentCache.clear();
      documentEvents.notify();
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
      const response = await axiosInstance.get(`/documents/type/${normalizedType}`);
      
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
    documentEvents.notify();
    documentEvents.notify();
  }
}

export default new DocumentService(); 