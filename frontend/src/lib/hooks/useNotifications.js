import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fonction pour extraire et formater l'ID utilisateur
  const getUserId = () => {
    let userId = null;
    
    if (user?.id) userId = user.id;
    else if (user?.uid) userId = user.uid;
    else if (user?.user?.id) userId = user.user.id;
    
    // S'assurer que l'ID est une chaîne de caractères
    if (userId !== null) {
      userId = String(userId);
      console.log('ID utilisateur formaté:', userId);
    } else {
      console.log('Aucun ID utilisateur trouvé dans:', user);
    }
    
    return userId;
  };

  useEffect(() => {
    console.log('useNotifications - Current user:', user);
    
    const userId = getUserId();
    
    if (!userId) {
      console.log('useNotifications - No user ID available');
      setNotifications([]);
      setLoading(false);
      return;
    }

    console.log('useNotifications - Setting up listener for user ID:', userId);
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          console.log('useNotifications - Received snapshot with', snapshot.docs.length, 'notifications');
          const notificationsData = snapshot.docs.map(doc => {
            const data = {
              id: doc.id,
              ...doc.data()
            };
            console.log('useNotifications - Notification data:', data);
            return data;
          });
          
          // Sort notifications by timestamp client-side
          notificationsData.sort((a, b) => b.timestamp - a.timestamp);
          
          setNotifications(notificationsData);
          setLoading(false);
        } catch (error) {
          console.error('Error processing notifications:', error);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        if (error.code === 'failed-precondition') {
          console.warn('Please create the required index for notifications collection');
        }
        setLoading(false);
      }
    );

    return () => {
      console.log('useNotifications - Cleaning up listener');
      unsubscribe();
    };
  }, [user]);

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

  // Nouvelle fonction pour gérer les préférences
  const updateNotificationPreference = async (type, enabled) => {
    try {
      const userId = getUserId();
      if (!userId) {
        console.error('No user ID available');
        toast.error('Erreur: Utilisateur non identifié');
        return;
      }

      console.log('Mise à jour des préférences pour:', { userId, type, enabled });

      // Créer la référence du document avec l'ID formaté
      const preferencesRef = doc(db, 'notificationPreferences', userId);
      
      // Log de vérification
      console.log('Référence du document:', preferencesRef.path);

      await setDoc(preferencesRef, {
        [type]: enabled
      }, { merge: true });
      
      toast.success('Préférences de notification mises à jour');
    } catch (error) {
      console.error('Erreur détaillée lors de la mise à jour des préférences:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    }
  };

  // Modifier la fonction createNotification
  const createNotification = async (recipientId, title, message, type = 'INFO') => {
    try {
      // S'assurer que recipientId est une chaîne de caractères
      const formattedRecipientId = String(recipientId);
      
      const preferencesRef = doc(db, 'notificationPreferences', formattedRecipientId);
      const preferencesSnap = await getDoc(preferencesRef);
      const preferences = preferencesSnap.data() || {};

      if (preferences[type] === false) {
        console.log('Notifications désactivées pour ce type:', type);
        return;
      }

      await addDoc(collection(db, 'notifications'), {
        recipientId: formattedRecipientId,
        title,
        message,
        type,
        timestamp: new Date(),
        read: false,
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  };

  return {
    notifications,
    loading,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    markAllAsRead,
    updateNotificationPreference,
    createNotification
  };
}; 