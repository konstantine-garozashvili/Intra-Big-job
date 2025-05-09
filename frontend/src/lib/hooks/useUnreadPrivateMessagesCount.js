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