import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@services/firebase';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('useNotifications - Current user:', user);
    
    // Fonction pour extraire l'ID utilisateur
    const getUserId = () => {
      // Vérifier toutes les possibilités d'ID utilisateur
      if (user?.id) return user.id;
      if (user?.uid) return user.uid;
      if (user?.user?.id) return user.user.id;
      return null;
    };

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

  // Fonction pour créer une nouvelle notification
  const createNotification = async (recipientId, title, message, type = 'INFO') => {
    try {
      console.log('useNotifications - Creating new notification:', { recipientId, title, message, type });
      await addDoc(collection(db, 'notifications'), {
        recipientId,
        title,
        message,
        type,
        timestamp: new Date(),
        read: false,
      });
      console.log('useNotifications - Successfully created notification');
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
    createNotification
  };
}; 