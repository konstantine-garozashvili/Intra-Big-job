import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  /**
   * Get the user id
   * @returns {string} The user id
   */
  const getUserId = () => {
    try {
      let userId;
      
      // Try to get ID from user object first
      if (user?.id) {
        userId = user.id;
      } 
      // Then try localStorage
      else if (localStorage.getItem('user')) {
        try {
          const localUser = JSON.parse(localStorage.getItem('user'));
          userId = localUser?.id;
        } catch (e) {
          console.warn('Error parsing user from localStorage:', e);
        }
      } 
      // Last resort, direct localStorage values
      else {
        userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
      }
      
      if (!userId) {
        console.warn('No user ID found in any source');
        return null;
      }
      
      // Always convert to string to ensure consistent comparison
      userId = String(userId);
      
      // Store userId in localStorage to ensure consistency
      localStorage.setItem('userId', userId);
      
      return userId;
    } catch (error) {
      console.error('useNotifications - Erreur lors de la récupération de l\'ID utilisateur:', error);
      return null;
    }
  };

  // Fonction pour récupérer l'email de l'utilisateur pour identification supplémentaire
  const getUserEmail = () => {
    if (user?.email) {
      return user.email;
    }
    
    try {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      return localUser?.email || null;
    } catch (e) {
      console.warn('Error parsing user email from localStorage:', e);
      return null;
    }
  };

  // Mise à jour du dernier login pour les préférences
  const updateLastLogin = async (userId) => {
    try {
      if (!userId) return;
      
      const preferencesRef = doc(db, 'notificationPreferences', userId);
      const preferencesSnap = await getDoc(preferencesRef);
      
      if (preferencesSnap.exists()) {
        await updateDoc(preferencesRef, {
          lastLogin: new Date(),
          lastLoginTimestamp: Date.now()
        });
      }
    } catch (error) {
      console.warn('Erreur lors de la mise à jour du timestamp de dernière connexion:', error);
    }
  };

  // Ajouter une variable d'état pour suivre si c'est le premier chargement
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Modifier le useEffect principal pour éviter les notifications multiples
  useEffect(() => {
    // Variable pour suivre si le composant est monté
    let isMounted = true;
    
    const setupNotifications = async () => {
      const userId = getUserId();
      
      if (!userId) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Force initialize notification preferences only if needed
      if (isInitialLoad) {
        await initializeNotificationPreferences(userId);
        
        // Mise à jour du dernier login uniquement lors du premier chargement
        await updateLastLogin(userId);
        
        // Marquer comme chargé initialement pour éviter des initialisations multiples
        if (isMounted) {
          setIsInitialLoad(false);
        }
      }

      
      const notificationsRef = collection(db, 'notifications');
      
      // Create a query that handles all possible ID formats for the current user
      const q = query(
        notificationsRef,
        where('recipientId', '==', userId),
        orderBy('timestamp', 'desc') // Ajouter un orderBy pour éviter de recharger toutes les notifs
      );

      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isMounted) return;
          
          try {
            
            // Créer un Map pour suivre les notifications déjà vues
            const seenNotifications = new Map();
            localStorage.getItem('seenNotifications')?.split(',').forEach(id => {
              if (id) seenNotifications.set(id, true);
            });
            
            const notificationsData = snapshot.docs.map(doc => {
              // Marquer automatiquement comme vue si elle a déjà été vue
              const notif = {
                id: doc.id,
                ...doc.data(),
                // Si la notification a déjà été vue, maintenir l'état "read"
                read: seenNotifications.has(doc.id) ? true : doc.data().read || false
              };
              
              return notif;
            });
            
            // Enregistrer les IDs des notifications vues
            localStorage.setItem('seenNotifications', 
              [...seenNotifications.keys(), ...notificationsData.filter(n => n.read).map(n => n.id)].join(',')
            );
            
            setNotifications(notificationsData);
            setLoading(false);
            
            // Store notification count in localStorage for better UX
            localStorage.setItem('unreadNotificationCount', notificationsData.filter(n => !n.read).length);
          } catch (error) {
            console.error('Error processing notifications:', error);
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error fetching notifications:', error);
          setLoading(false);
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    };
    
    setupNotifications();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Fonction pour initialiser les préférences de notification
  const initializeNotificationPreferences = async (userId) => {
    try {
      
      if (!userId) {
        console.error('Impossible d\'initialiser les préférences - userId manquant');
        return;
      }
      
      // Ensure userId is a string for consistent document IDs
      userId = String(userId);
      
      // Get the user email for additional identification
      const userEmail = getUserEmail();
      
      // AMÉLIORATION: créer différentes versions possibles de l'ID pour la recherche
      const possibleUserIds = [
        userId,
        Number(userId),
        parseInt(userId, 10),
        `${userId}`
      ];
      
      // Première recherche: document exact
      const preferencesRef = doc(db, 'notificationPreferences', userId);
      const preferencesSnap = await getDoc(preferencesRef);
      
      // Vérifier d'abord si on trouve les préférences avec l'ID exact
      if (preferencesSnap.exists()) {
        
        // Mettre à jour l'email si nécessaire
        const currentPrefs = preferencesSnap.data();
        if (userEmail && (!currentPrefs.userEmail || currentPrefs.userEmail !== userEmail)) {
          await updateDoc(preferencesRef, {
            userEmail: userEmail,
            lastUpdated: new Date()
          });
        }
        
        // Mettre à jour la dernière connexion
        await updateDoc(preferencesRef, {
          lastLogin: new Date()
        });
        
        // Sauvegarder en localStorage comme backup
        try {
          localStorage.setItem('notificationPreferences', JSON.stringify({
            ...currentPrefs,
            lastSynced: new Date().toISOString()
          }));
        } catch (e) {
          console.warn('Impossible de sauvegarder dans localStorage:', e);
        }
        
        return;
      }
      
      // Si aucune préférence trouvée avec l'ID exact, chercher dans tous les documents
      const allPreferencesRef = collection(db, 'notificationPreferences');
      const allPreferencesSnap = await getDocs(allPreferencesRef);
      
      // Rechercher un document qui pourrait correspondre à cet utilisateur
      let foundPreferences = null;
      
      allPreferencesSnap.forEach(doc => {
        const prefs = doc.data();
        
        // Vérifier si ce document correspond à l'utilisateur actuel
        const userIdMatches = possibleUserIds.includes(prefs.userId) || possibleUserIds.includes(doc.id);
        const emailMatches = userEmail && prefs.userEmail === userEmail;
        
        if (userIdMatches || emailMatches) {
          foundPreferences = {
            docId: doc.id,
            ...prefs
          };
        }
      });
      
      if (foundPreferences) {
        // Si on a trouvé des préférences mais avec un ID différent, les copier avec le bon ID
        if (foundPreferences.docId !== userId) {
          // Copier vers le document avec l'ID correct
          await setDoc(preferencesRef, {
            ...foundPreferences,
            userId: userId,
            userEmail: userEmail || foundPreferences.userEmail,
            migratedFrom: foundPreferences.docId,
            migratedAt: new Date(),
            lastLogin: new Date()
          });
          
        }
        
        // Sauvegarder en localStorage
        try {
          localStorage.setItem('notificationPreferences', JSON.stringify({
            ...foundPreferences,
            userId: userId,
            lastSynced: new Date().toISOString()
          }));
        } catch (e) {
          console.warn('Impossible de sauvegarder dans localStorage:', e);
        }
        
        return;
      }
      
      // Vérifier si des préférences existent dans le localStorage
      let localPreferences = null;
      try {
        const localPrefsStr = localStorage.getItem('notificationPreferences');
        if (localPrefsStr) {
          const localPrefs = JSON.parse(localPrefsStr);
          // Vérifier la correspondance de manière plus souple
          const userIdMatches = possibleUserIds.includes(localPrefs.userId);
          const emailMatches = userEmail && localPrefs.userEmail === userEmail;
          
          if (userIdMatches || emailMatches) {
            localPreferences = localPrefs;
          }
        }
      } catch (e) {
        console.warn('Erreur lors de la récupération des préférences locales:', e);
      }
      
      // Utiliser les préférences locales ou créer des préférences par défaut
      if (localPreferences) {
        // Nettoyer les propriétés qui ne doivent pas être stockées
        const cleanPrefs = { ...localPreferences };
        delete cleanPrefs.lastUpdated; // Format texte ISO
        
        // Ajouter les nouvelles propriétés
        const prefsToSave = {
          ...cleanPrefs,
          userId: userId,
          userEmail: userEmail || localPreferences.userEmail,
          lastRestored: new Date(),
          restoredFrom: 'localStorage',
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        await setDoc(preferencesRef, prefsToSave);
      } else {
        // Créer des préférences par défaut (tout activé)
        const defaultPreferences = {
          userId: userId,
          userEmail: userEmail,
          ROLE_UPDATE: true,
          DOCUMENT_UPLOADED: true,
          DOCUMENT_DELETED: true,
          DOCUMENT_APPROVED: true,
          DOCUMENT_REJECTED: true,
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        await setDoc(preferencesRef, defaultPreferences);
        
        // Sauvegarder également dans localStorage comme backup
        try {
          localStorage.setItem('notificationPreferences', JSON.stringify({
            ...defaultPreferences,
            createdAt: defaultPreferences.createdAt.toISOString(),
            lastLogin: defaultPreferences.lastLogin.toISOString()
          }));
        } catch (e) {
          console.warn('Impossible de sauvegarder les préférences dans localStorage:', e);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des préférences:', error);
    }
  };

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const promises = notifications
        .filter(n => !n.read)
        .map(n => markAsRead(n.id));
      await Promise.all(promises);
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  // Fonction pour mettre à jour les préférences de notification par utilisateur
  const updateNotificationPreference = async (type, enabled) => {
    try {
      const userId = getUserId();
      if (!userId) {
        console.error('No user ID available');
        toast.error('Erreur: Utilisateur non identifié');
        return;
      }

      // Ensure userId is string
      const userIdStr = String(userId);
      const userEmail = getUserEmail();
      

      // Créer la référence du document avec l'ID formaté
      const preferencesRef = doc(db, 'notificationPreferences', userIdStr);
      
      // Log de vérification

      // Récupérer les préférences actuelles
      const preferencesSnap = await getDoc(preferencesRef);
      let currentPrefs = {};
      
      if (preferencesSnap.exists()) {
        currentPrefs = preferencesSnap.data();
        
        // Vérifier que les préférences appartiennent bien à cet utilisateur
        if (currentPrefs.userId && currentPrefs.userId !== userIdStr) {
          console.error('Les préférences ne correspondent pas à l\'utilisateur actuel', {
            expectedId: userIdStr,
            actualId: currentPrefs.userId
          });
          
          // Créer de nouvelles préférences pour cet utilisateur
          await initializeNotificationPreferences(userIdStr);
          
          // Récupérer les nouvelles préférences
          const newPrefsSnap = await getDoc(preferencesRef);
          if (newPrefsSnap.exists()) {
            currentPrefs = newPrefsSnap.data();
          } else {
            // En cas d'échec, créer un objet de base
            currentPrefs = {
              userId: userIdStr,
              userEmail: userEmail
            };
          }
        }
      } else {
        
        // Initialiser les préférences avant de continuer
        await initializeNotificationPreferences(userIdStr);
        
        // Récupérer les préférences nouvellement créées
        const initPrefsSnap = await getDoc(preferencesRef);
        if (initPrefsSnap.exists()) {
          currentPrefs = initPrefsSnap.data();
        } else {
          // Fallback en cas d'échec
          currentPrefs = {
            userId: userIdStr,
            userEmail: userEmail
          };
        }
      }

      // Ajouter ou mettre à jour la préférence spécifique
      const updatedPrefs = {
        ...currentPrefs,
        userId: userIdStr, // Ensure userId is stored in the document for additional security/verification
        userEmail: userEmail || currentPrefs.userEmail, // Keep or update email
        [type]: enabled,
        lastUpdated: new Date()
      };
      
      // Use set with merge to update only specified fields
      await setDoc(preferencesRef, updatedPrefs, { merge: true });
      
      // Vérifier que la mise à jour a bien été appliquée
      const verifySnap = await getDoc(preferencesRef);
      if (verifySnap.exists()) {
        const verifyData = verifySnap.data();
        
        if (verifyData[type] !== enabled) {
          console.error('Mise à jour des préférences échouée - valeur différente de celle attendue');
          toast.error('Erreur: La mise à jour n\'a pas été appliquée correctement');
          return;
        }
        
        // Sauvegarder également dans localStorage comme backup
        try {
          localStorage.setItem('notificationPreferences', JSON.stringify({
            ...verifyData,
            lastUpdated: new Date().toISOString()
          }));
        } catch (e) {
          console.warn('Impossible de sauvegarder les préférences dans localStorage:', e);
        }
      } else {
        console.error('Erreur: préférences non trouvées après mise à jour');
        toast.error('Erreur: Les préférences n\'ont pas été correctement enregistrées');
        return;
      }
      
      toast.success('Préférences de notification mises à jour');
    } catch (error) {
      console.error('Erreur détaillée lors de la mise à jour des préférences:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    }
  };

  // Modifier la fonction createNotification pour éviter les doublons
  const createNotification = async (recipientId, title, message, type = 'INFO') => {
    try {
      // S'assurer que recipientId est une chaîne de caractères
      const formattedRecipientId = String(recipientId);
      
      // Vérifier les préférences de notification de l'utilisateur (seulement si ce n'est pas un message système critique)
      if (type !== 'SYSTEM_CRITICAL') {
        const preferencesRef = doc(db, 'notificationPreferences', formattedRecipientId);
        
        // Tentative de récupération des préférences depuis Firestore
        let preferences = null;
        let preferencesSource = 'firestore';
        
        try {
          const preferencesSnap = await getDoc(preferencesRef);
          if (preferencesSnap.exists()) {
            preferences = preferencesSnap.data();
          }
        } catch (error) {
          console.warn('Erreur lors de la récupération des préférences depuis Firestore:', error);
        }
        
        // Si les préférences ne sont pas disponibles dans Firestore, essayer depuis localStorage
        if (!preferences) {
          try {
            const localPrefsStr = localStorage.getItem('notificationPreferences');
            if (localPrefsStr) {
              const localPrefs = JSON.parse(localPrefsStr);
              // Vérifier que les préférences correspondent à cet utilisateur
              if (localPrefs.userId === formattedRecipientId) {
                preferences = localPrefs;
                preferencesSource = 'localStorage';
              }
            }
          } catch (e) {
            console.warn('Erreur lors de la récupération des préférences depuis localStorage:', e);
          }
        }
        
        if (preferences) {
          
          // Vérifier que les préférences appartiennent bien à cet utilisateur (couche de sécurité supplémentaire)
          if (preferences.userId && preferences.userId !== formattedRecipientId) {
            console.error('Erreur: Les préférences ne correspondent pas à l\'utilisateur', {
              expectedId: formattedRecipientId,
              actualId: preferences.userId
            });
            // Ne pas bloquer la création, mais loguer l'erreur (incohérence dans les données)
          }
          
          // Vérifier si l'utilisateur a désactivé ce type de notification
          if (preferences[type] === false) {
            return;
          }
        } else {
          // Si les préférences n'existent pas, les initialiser
          await initializeNotificationPreferences(formattedRecipientId);
        }
      }

      // Vérifier si une notification similaire a été créée récemment (dans les 5 dernières minutes)
      const notificationsRef = collection(db, 'notifications');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const q = query(
        notificationsRef,
        where('recipientId', '==', formattedRecipientId),
        where('title', '==', title),
        where('type', '==', type)
      );
      
      const existingNotifications = await getDocs(q);
      
      // Vérifier s'il existe déjà une notification similaire récente
      const hasSimilarRecentNotification = existingNotifications.docs.some(doc => {
        const notif = doc.data();
        const timestamp = notif.timestamp?.toDate ? notif.timestamp.toDate() : new Date(notif.timestamp);
        return timestamp > fiveMinutesAgo && notif.message === message;
      });
      
      if (hasSimilarRecentNotification) {
        return;
      }

      // Créer la notification si elle n'existe pas déjà
      await addDoc(collection(db, 'notifications'), {
        recipientId: formattedRecipientId,
        title,
        message,
        type,
        timestamp: new Date(),
        read: false,
        userId: formattedRecipientId, // Stockage explicite de l'ID utilisateur pour vérification
        source: 'frontend',
        appVersion: process.env.REACT_APP_VERSION || 'unknown',
        createdAt: new Date() // Horodatage explicite pour le déduplication
      });
      

    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  };

  /**
   * Diagnostic des notifications dans Firestore
   */
  const diagnoseNotifications = async () => {
    try {
      const userId = getUserId();
      
      // Récupérer toutes les notifications
      const allNotificationsSnap = await getDocs(collection(db, 'notifications'));
      
      // Compter les notifications par type et par destinataire
      let studentNotifs = 0;
      let guestNotifs = 0;
      let userSpecificNotifs = 0;
      let documentUploadedNotifs = 0;
      let documentDeletedNotifs = 0;
      
      // Vérifier différents formats d'ID
      const userIdStr = String(userId);
      const userIdNum = Number(userId);
      const userIdInt = parseInt(userId, 10);
      const userIdWithQuotes = `${userId}`;
      
      let exactMatchCount = 0;
      let numericMatchCount = 0;
      let stringMatchCount = 0;
      let templateMatchCount = 0;
      
      
      const notificationsDetails = [];
      
      allNotificationsSnap.forEach(doc => {
        const notif = doc.data();
        
        // Collecter détails pour analyse
        const details = {
          id: doc.id,
          recipientId: notif.recipientId,
          type: notif.type,
          exact: notif.recipientId === userId,
          numeric: notif.recipientId === userIdNum,
          string: notif.recipientId === userIdStr,
          template: notif.recipientId === userIdWithQuotes
        };
        
        notificationsDetails.push(details);
        
        // Compter par type
        if (notif.type === 'DOCUMENT_UPLOADED') documentUploadedNotifs++;
        if (notif.type === 'DOCUMENT_DELETED') documentDeletedNotifs++;
        
        // Compter par destinataire
        if (notif.recipientId === userId) {
          userSpecificNotifs++;
          exactMatchCount++;
        }
        if (notif.recipientId === userIdNum) numericMatchCount++;
        if (notif.recipientId === userIdStr) stringMatchCount++;
        if (notif.recipientId === userIdWithQuotes) templateMatchCount++;
        
        // Compter par rôle
        if (user?.roles?.includes('ROLE_STUDENT')) studentNotifs++;
        if (user?.roles?.includes('ROLE_GUEST')) guestNotifs++;
      });

      


      
      
    } catch (error) {
      console.error('Erreur lors du diagnostic des notifications:', error);
    }
  };

  // Exécuter le diagnostic au chargement du hook - DÉSACTIVÉ pour éviter les notifications multiples
  // useEffect(() => {
  //   diagnoseNotifications();
  // }, [user]);

  // Force reinitialize notification preferences to fix consistency issues
  const forceReinitializePreferences = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;
      
      // Get the user email for additional identification
      const userEmail = getUserEmail();
      
      // First delete existing preferences to avoid conflicts
      const preferencesRef = doc(db, 'notificationPreferences', userId);
      
      // Create new preferences with proper type mappings
      const defaultPreferences = {
        userId: userId,
        userEmail: userEmail,
        ROLE_UPDATE: true,
        DOCUMENT_UPLOADED: true,
        DOCUMENT_DELETED: true,
        DOCUMENT_APPROVED: true,
        DOCUMENT_REJECTED: true,
        DOCUMENT_UPDATED: true,
        createdAt: new Date(),
        lastLogin: new Date(),
        lastReset: new Date()
      };
      
      await setDoc(preferencesRef, defaultPreferences);
      
      // Save to localStorage as backup
      localStorage.setItem('notificationPreferences', JSON.stringify({
        ...defaultPreferences,
        createdAt: defaultPreferences.createdAt.toISOString(),
        lastLogin: defaultPreferences.lastLogin.toISOString(),
        lastReset: defaultPreferences.lastReset.toISOString()
      }));
      
      // Force notification refresh
      getNotifications();
      
      return true;
    } catch (error) {
      console.error('Error resetting notification preferences:', error);
      return false;
    }
  };

  // Fonction utilitaire pour récupérer les notifications
  const getNotifications = async () => {
    const userId = getUserId();
    if (!userId) return [];
    
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('recipientId', '==', userId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  };

  // Ajouter une fonction pour nettoyer les anciennes notifications
  const cleanupOldNotifications = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;
      
      // Obtenir les 50 dernières notifications
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      // Calculer la date de 30 jours dans le passé
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Identifier les notifications à supprimer (lues et anciennes)
      const notificationsToDelete = snapshot.docs
        .filter(doc => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
          
          // Supprimer si lue ET ancienne de plus de 30 jours
          return data.read && timestamp < thirtyDaysAgo;
        })
        .map(doc => doc.id);
      
      // Limiter le nombre de suppressions à 20 par lot
      const batchSize = 20;
      const notificationsToDeleteBatch = notificationsToDelete.slice(0, batchSize);
      
      
      // Supprimer les notifications anciennes
      for (const notificationId of notificationsToDeleteBatch) {
        await deleteDoc(doc(db, 'notifications', notificationId));
      }
      
      return notificationsToDeleteBatch.length;
    } catch (error) {
      console.error('Erreur lors du nettoyage des anciennes notifications:', error);
      return 0;
    }
  };
  
  // Exécuter le nettoyage une fois par session
  useEffect(() => {
    // Vérifier si le nettoyage a déjà été effectué récemment (dans les dernières 24h)
    const lastCleanup = localStorage.getItem('lastNotificationsCleanup');
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (!lastCleanup || now - parseInt(lastCleanup, 10) > oneDayMs) {
      // Attendre 30 secondes après le chargement initial pour effectuer le nettoyage
      const cleanupTimeout = setTimeout(() => {
        cleanupOldNotifications().then(count => {
          localStorage.setItem('lastNotificationsCleanup', now.toString());
        });
      }, 30000);
      
      return () => clearTimeout(cleanupTimeout);
    }
  }, []);

  return {
    notifications,
    loading,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    updateNotificationPreference,
    createNotification,
    forceReinitializePreferences,
    cleanupOldNotifications
  };
}; 