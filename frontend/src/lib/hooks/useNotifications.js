import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc, getDocs, orderBy } from 'firebase/firestore';
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
        console.log('Mise à jour du timestamp de dernière connexion pour les préférences');
      }
    } catch (error) {
      console.warn('Erreur lors de la mise à jour du timestamp de dernière connexion:', error);
    }
  };

  useEffect(() => {
    const userId = getUserId();
    
    if (!userId) {
      console.log('useNotifications - No user ID available');
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Force initialize notification preferences with consistent userId
    initializeNotificationPreferences(userId);
    
    // Update the last login timestamp
    updateLastLogin(userId);

    console.log('useNotifications - Setting up listener for user ID:', userId);
    
    const notificationsRef = collection(db, 'notifications');
    
    // Create a query that handles all possible ID formats for the current user
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId)
    );

    console.log('useNotifications - Query created with path:', q.path);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          console.log('useNotifications - Received snapshot with', snapshot.docs.length, 'notifications');
          const notificationsData = snapshot.docs.map(doc => {
            return {
              id: doc.id,
              ...doc.data()
            };
          });
          
          // Sort notifications by timestamp client-side
          notificationsData.sort((a, b) => {
            const getTimestamp = (ts) => {
              if (ts && typeof ts.toDate === 'function') return ts.toDate().getTime();
              if (ts instanceof Date) return ts.getTime();
              if (typeof ts === 'string') return new Date(ts).getTime();
              if (typeof ts === 'number') return ts;
              return 0;
            };
            
            return getTimestamp(b.timestamp) - getTimestamp(a.timestamp);
          });
          
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
      unsubscribe();
    };
  }, [user]);

  // Fonction pour initialiser les préférences de notification
  const initializeNotificationPreferences = async (userId) => {
    try {
      console.log('Initialisation des préférences de notification pour:', userId);
      
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
        console.log('Préférences trouvées avec l\'ID exact:', preferencesSnap.data());
        
        // Mettre à jour l'email si nécessaire
        const currentPrefs = preferencesSnap.data();
        if (userEmail && (!currentPrefs.userEmail || currentPrefs.userEmail !== userEmail)) {
          await updateDoc(preferencesRef, {
            userEmail: userEmail,
            lastUpdated: new Date()
          });
          console.log('Email utilisateur mis à jour dans les préférences');
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
      console.log('Aucune préférence trouvée avec l\'ID exact, recherche élargie...');
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
          console.log('Préférences trouvées par correspondance élargie:', prefs);
          foundPreferences = {
            docId: doc.id,
            ...prefs
          };
        }
      });
      
      if (foundPreferences) {
        // Si on a trouvé des préférences mais avec un ID différent, les copier avec le bon ID
        if (foundPreferences.docId !== userId) {
          console.log('Préférences trouvées avec un ID différent, migration...');
          // Copier vers le document avec l'ID correct
          await setDoc(preferencesRef, {
            ...foundPreferences,
            userId: userId,
            userEmail: userEmail || foundPreferences.userEmail,
            migratedFrom: foundPreferences.docId,
            migratedAt: new Date(),
            lastLogin: new Date()
          });
          
          console.log('Préférences migrées avec succès');
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
            console.log('Préférences trouvées dans localStorage');
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
        console.log('Préférences restaurées depuis localStorage et sauvegardées dans Firestore');
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
        console.log('Préférences par défaut créées avec succès:', defaultPreferences);
        
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
      console.log('useNotifications - Marking notification as read:', notificationId);
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
      console.log('useNotifications - Successfully marked notification as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      console.log('useNotifications - Marking all notifications as read');
      const promises = notifications
        .filter(n => !n.read)
        .map(n => markAsRead(n.id));
      await Promise.all(promises);
      console.log('useNotifications - Successfully marked all notifications as read');
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
      
      console.log('Mise à jour des préférences pour:', { userId: userIdStr, type, enabled });

      // Créer la référence du document avec l'ID formaté
      const preferencesRef = doc(db, 'notificationPreferences', userIdStr);
      
      // Log de vérification
      console.log('Référence du document:', preferencesRef.path);

      // Récupérer les préférences actuelles
      const preferencesSnap = await getDoc(preferencesRef);
      let currentPrefs = {};
      
      if (preferencesSnap.exists()) {
        currentPrefs = preferencesSnap.data();
        console.log('Préférences actuelles pour utilisateur', userIdStr, ':', currentPrefs);
        
        // Vérifier que les préférences appartiennent bien à cet utilisateur
        if (currentPrefs.userId && currentPrefs.userId !== userIdStr) {
          console.error('Les préférences ne correspondent pas à l\'utilisateur actuel', {
            expectedId: userIdStr,
            actualId: currentPrefs.userId
          });
          
          // Créer de nouvelles préférences pour cet utilisateur
          console.log('Création de nouvelles préférences pour cet utilisateur');
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
        console.log('Aucune préférence existante pour utilisateur', userIdStr, ', création...');
        
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
        console.log('Préférences après mise à jour pour utilisateur', userIdStr, ':', verifyData);
        
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
          console.log('Préférences sauvegardées dans localStorage après mise à jour');
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

  // Modifier la fonction createNotification pour vérifier les préférences de façon plus sécurisée
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
                console.log('Utilisation des préférences depuis localStorage:', preferences);
              }
            }
          } catch (e) {
            console.warn('Erreur lors de la récupération des préférences depuis localStorage:', e);
          }
        }
        
        if (preferences) {
          console.log(`Préférences récupérées depuis ${preferencesSource}:`, preferences);
          
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
            console.log(`Notification de type ${type} désactivée pour l'utilisateur ${formattedRecipientId}`);
        return;
          }
        } else {
          // Si les préférences n'existent pas, les initialiser
          console.log('Aucune préférence trouvée, initialisation des préférences pour', formattedRecipientId);
          await initializeNotificationPreferences(formattedRecipientId);
        }
      }

      // Créer la notification
      await addDoc(collection(db, 'notifications'), {
        recipientId: formattedRecipientId,
        title,
        message,
        type,
        timestamp: new Date(),
        read: false,
        userId: formattedRecipientId, // Stockage explicite de l'ID utilisateur pour vérification
        source: 'frontend',
        appVersion: process.env.REACT_APP_VERSION || 'unknown'
      });
      
      console.log(`Notification créée avec succès pour l'utilisateur ${formattedRecipientId}`, {
        type,
        title
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
      console.log('Diagnostic de notifications pour userId:', userId);
      
      // Récupérer toutes les notifications
      const allNotificationsSnap = await getDocs(collection(db, 'notifications'));
      console.log(`Total notifications dans Firestore: ${allNotificationsSnap.size}`);
      
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
      
      console.log('Formats d\'ID à vérifier:', {
        userIdStr,
        userIdNum,
        userIdInt,
        userIdWithQuotes
      });
      
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
      
      console.log('Détails des notifications par type:', {
        document_uploaded: documentUploadedNotifs,
        document_deleted: documentDeletedNotifs
      });
      
      console.log('Détails des notifications par destinataire:', {
        total: allNotificationsSnap.size,
        userSpecific: userSpecificNotifs,
        exactMatch: exactMatchCount,
        numericMatch: numericMatchCount,
        stringMatch: stringMatchCount,
        templateMatch: templateMatchCount
      });
      
      console.log('Détails des notifications par rôle:', {
        student: studentNotifs,
        guest: guestNotifs
      });
      
      console.log('Détails complets des notifications:', notificationsDetails);
      
    } catch (error) {
      console.error('Erreur lors du diagnostic des notifications:', error);
    }
  };

  // Exécuter le diagnostic au chargement du hook
  useEffect(() => {
    diagnoseNotifications();
  }, [user]);

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
      console.log('Notification preferences forcefully reset with correct mappings');
      
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

  return {
    notifications,
    loading,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    updateNotificationPreference,
    createNotification,
    forceReinitializePreferences
  };
}; 