import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook pour compter le nombre total de messages privés non lus pour l'utilisateur courant
 */
export function useUnreadPrivateMessagesCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // DEBUG: Affichage du user dans le hook
  useEffect(() => {
    console.log('[useUnreadPrivateMessagesCount] user:', user);
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', String(user.id)));
    let unsubMessages = [];
    const unsubscribeChats = onSnapshot(q, (chatsSnap) => {
      // Cleanup old listeners
      unsubMessages.forEach(unsub => unsub());
      unsubMessages = [];
      const perChatUnread = {};
      chatsSnap.forEach((chatDoc) => {
        const chatId = chatDoc.id;
        if (!chatId.startsWith('private_')) return;
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const qMsg = query(messagesRef, where('readBy', 'not-in', [[String(user.id)]]));
        const unsub = onSnapshot(qMsg, (msgSnap) => {
          let count = 0;
          msgSnap.forEach((msgDoc) => {
            const data = msgDoc.data();
            if (data.senderId !== String(user.id) && (!data.readBy || !data.readBy.includes(String(user.id)))) {
              count++;
            }
          });
          perChatUnread[chatId] = count;
          // Additionne tous les non lus de tous les chats
          setUnreadCount(Object.values(perChatUnread).reduce((a, b) => a + b, 0));
        });
        unsubMessages.push(unsub);
      });
    });
    return () => {
      unsubMessages.forEach(unsub => unsub());
      unsubscribeChats();
    };
  }, [user?.id]);

  return unreadCount;
}

/**
 * Hook pour compter le nombre de messages privés non lus par contact pour l'utilisateur courant
 */
export function useUnreadCountByContact() {
  const { user } = useAuth();
  const [unreadByContact, setUnreadByContact] = useState({});

  useEffect(() => {
    if (!user?.id) {
      setUnreadByContact({});
      return;
    }
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', String(user.id)));
    let unsubMessages = [];
    const unsubscribeChats = onSnapshot(q, (chatsSnap) => {
      unsubMessages.forEach(unsub => unsub());
      unsubMessages = [];
      const perContactUnread = {};
      chatsSnap.forEach((chatDoc) => {
        const chatId = chatDoc.id;
        if (!chatId.startsWith('private_')) return;
        // Récupérer l'ID du contact (autre que l'utilisateur courant)
        const participants = chatDoc.data().participants || [];
        const contactId = participants.find(pid => String(pid) !== String(user.id));
        if (!contactId) return;
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const qMsg = query(messagesRef, where('readBy', 'not-in', [[String(user.id)]]));
        const unsub = onSnapshot(qMsg, (msgSnap) => {
          let count = 0;
          msgSnap.forEach((msgDoc) => {
            const data = msgDoc.data();
            if (data.senderId === String(contactId) && (!data.readBy || !data.readBy.includes(String(user.id)))) {
              count++;
            }
          });
          perContactUnread[contactId] = count;
          setUnreadByContact(prev => ({ ...prev, [contactId]: count }));
        });
        unsubMessages.push(unsub);
      });
    });
    return () => {
      unsubMessages.forEach(unsub => unsub());
      unsubscribeChats();
    };
  }, [user?.id]);

  return unreadByContact;
} 