/**
 * Utility functions for handling document notifications
 */
import { notificationService } from '@/lib/services/notificationService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Liste des types de notifications gérés par le backend
const BACKEND_MANAGED_NOTIFICATIONS = [
  'DOCUMENT_DELETED',
  'DOCUMENT_REJECTED',
  'DOCUMENT_APPROVED',
  'DOCUMENT_UPLOADED'
];

/**
 * Create a document upload notification
 * 
 * @param {Object} document - The document object that was uploaded
 * @param {string} type - The notification type (DOCUMENT_UPLOADED, DOCUMENT_APPROVED, DOCUMENT_REJECTED, etc.)
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} targetUrl - The URL to navigate to when clicking the notification
 * @param {boolean} forceCreate - Force creation even if managed by backend
 */
export const createDocumentNotification = async (document, type, title, message, targetUrl = '/documents', forceCreate = false) => {
  // Ne jamais créer de notification locale pour les types gérés par le backend, sauf si forceCreate est true
  if (!forceCreate && BACKEND_MANAGED_NOTIFICATIONS.includes(type)) {
    return;
  }
  try {
    // Récupérer l'ID utilisateur avec plusieurs méthodes possibles
    let userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
    
    // Si l'ID est stocké sous forme d'objet (parfois le cas avec certaines configurations d'auth)
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const userObj = JSON.parse(userString);
        if (userObj && userObj.id) {
          userId = userObj.id;
        }
      }
    } catch (e) {}
    
    if (!userId) {
      return;
    }
    
    // Assurer que l'ID est une chaîne de caractères
    userId = String(userId);
    
    try {
      // Vérifier les préférences de notification de l'utilisateur
      const preferencesRef = doc(db, 'notificationPreferences', userId);
      const preferencesSnap = await getDoc(preferencesRef);
      const preferences = preferencesSnap.data() || {};

      // Si l'utilisateur a désactivé ce type de notification, ne pas la créer
      if (preferences[type] === false) {
        return;
      }
      
      // Créer la notification dans Firebase
      const now = new Date();
      const notificationData = {
        recipientId: userId,
        title,
        message,
        type,
        targetUrl,
        timestamp: now,
        read: false
      };
      
      // Ajouter à la collection Firebase
      await addDoc(collection(db, 'notifications'), notificationData);
    } catch (firebaseError) {
    }
    
    // Create a local notification using the notification service
    const now = new Date();
    const newNotification = {
      id: `local-${now.getTime()}`,
      title: title,
      message: message,
      type: type,
      targetUrl: targetUrl,
      timestamp: now,
      createdAt: now.toISOString(),
      read: false
    };
    
    // Add notification to the notification service cache
    if (!BACKEND_MANAGED_NOTIFICATIONS.includes(type) || forceCreate) {
      if (notificationService.cache.notifications && notificationService.cache.notifications.notifications) {
        // Insert at the beginning of the array
        notificationService.cache.notifications.notifications.unshift(newNotification);
        // Update the unread count
        notificationService.cache.unreadCount = (notificationService.cache.unreadCount || 0) + 1;
        // Update the counter in pagination data
        if (notificationService.cache.notifications.pagination) {
          notificationService.cache.notifications.pagination.total += 1;
        }
        // Notify subscribers of the change
        notificationService.notifySubscribers();
        // Ensure we reload notifications from the cache to update all components
        setTimeout(() => {
          notificationService.getNotifications(1, 10, true, true)
            .then(() => {
              notificationService.getUnreadCount(true);
            })
            .catch(() => {
            });
        }, 300);
      }
    }
  } catch (error) {
  }
};

/**
 * Preset functions for common document notification types
 */
export const documentNotifications = {
  uploaded: (document, customMessage = null, forceCreate = false) => {
    const title = 'Document mis en ligne avec succès';
    const message = customMessage || `Votre document ${document.name} a été téléchargé avec succès.`;
    return createDocumentNotification(document, 'DOCUMENT_UPLOADED', title, message, '/documents', forceCreate);
  },
  
  approved: (document, customMessage = null, forceCreate = false) => {
    const title = 'Document approuvé';
    const message = customMessage || `Votre document ${document.name} a été approuvé.`;
    return createDocumentNotification(document, 'DOCUMENT_APPROVED', title, message, '/documents', forceCreate);
  },
  
  rejected: (document, customMessage = null, forceCreate = false) => {
    const title = 'Document rejeté';
    const message = customMessage || `Votre document ${document.name} a été rejeté.`;
    return createDocumentNotification(document, 'DOCUMENT_REJECTED', title, message, '/documents', forceCreate);
  },
  
  deleted: (document, customMessage = null, forceCreate = false) => {
    const title = 'Document supprimé';
    const message = customMessage || `Votre document ${document.name} a été supprimé avec succès.`;
    return createDocumentNotification(document, 'DOCUMENT_DELETED', title, message, '/documents', forceCreate);
  },
  
  updated: (document, customMessage = null, forceCreate = false) => {
    const title = 'Document mis à jour';
    const message = customMessage || `Votre document ${document.name} a été mis à jour.`;
    return createDocumentNotification(document, 'DOCUMENT_UPDATED', title, message, '/documents', forceCreate);
  }
}; 