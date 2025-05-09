import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, limit, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '../services/apiService';

export const useChat = (chatId = 'global', refreshChat = 0) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatPartner, setChatPartner] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const { user } = useAuth();

  // Fonction pour récupérer l'ID de l'utilisateur
  const getUserId = () => {
    try {
      let userId;
      
      if (user?.id) {
        userId = user.id;
      } else if (localStorage.getItem('user')) {
        try {
          const localUser = JSON.parse(localStorage.getItem('user'));
          userId = localUser?.id;
        } catch (e) {
          console.warn('Error parsing user from localStorage:', e);
        }
      } else {
        userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
      }
      
      if (!userId) {
        console.warn('No user ID found in any source');
        return null;
      }
      
      userId = String(userId);
      return userId;
    } catch (error) {
      console.error('useChat - Erreur lors de la récupération de l\'ID utilisateur:', error);
      return null;
    }
  };

  // Fonction pour générer un ID de chat privé
  const generatePrivateChatId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `private_${sortedIds[0]}_${sortedIds[1]}`;
  };

  // Fonction pour récupérer les informations de l'utilisateur partenaire
  const fetchChatPartner = useCallback(async (partnerId) => {
    try {
      const partnerData = await apiService.getPublicProfile(partnerId);
      setChatPartner(partnerData);
    } catch (error) {
      console.error('Error fetching chat partner:', error);
    }
  }, []);

  // Gérer l'indicateur de frappe
  const handleTyping = useCallback(async (isTyping) => {
    if (chatId === 'global' || !user?.id) return;
    
    try {
      const typingRef = doc(db, 'chats', chatId, 'typing', user.id);
      if (isTyping) {
        await setDoc(typingRef, {
          userId: user.id,
          timestamp: serverTimestamp()
        });
      } else {
        await updateDoc(typingRef, {
          timestamp: null
        });
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }, [chatId, user]);

  // Écouter les indicateurs de frappe
  useEffect(() => {
    if (chatId === 'global') return;

    const typingRef = collection(db, 'chats', chatId, 'typing');
    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      const typing = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.timestamp) {
          typing[doc.id] = true;
        }
      });
      setTypingUsers(typing);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Écouter les messages en temps réel
  useEffect(() => {
    let isMounted = true;
    const userId = getUserId();

    console.log('[useChat] useEffect triggered', { chatId, refreshChat, userId, user });

    if (!userId) {
      setMessages([]);
      setLoading(false);
      console.warn('[useChat] No userId, aborting listener');
      return;
    }

    // Si c'est un chat privé, récupérer les infos du partenaire
    if (chatId !== 'global' && chatId.startsWith('private_')) {
      const [, userId1, userId2] = chatId.split('_');
      const partnerId = userId1 === userId ? userId2 : userId1;
      fetchChatPartner(partnerId);
    }

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    console.log('[useChat] Setting up Firestore listener', { path: `chats/${chatId}/messages` });

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!isMounted) return;

        try {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            isUser: doc.data().senderId === userId
          }));

          console.log('[useChat] Firestore snapshot received', { count: messagesData.length, messagesData });

          setMessages(messagesData.reverse());
          setLoading(false);
        } catch (error) {
          console.error('[useChat] Error processing messages:', error);
          setLoading(false);
        }
      },
      (error) => {
        console.error('[useChat] Error fetching messages:', error);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
      console.log('[useChat] Firestore listener unsubscribed', { chatId });
    };
  }, [chatId, user, fetchChatPartner, refreshChat]);

  // Envoyer un message
  const sendMessage = async (content) => {
    try {
      const userId = getUserId();
      if (!userId || !content.trim()) return;

      // Vérifier si c'est un chat privé et créer les participants si nécessaire
      if (chatId !== 'global' && chatId.startsWith('private_')) {
        const [, userId1, userId2] = chatId.split('_');
        const participantsRef = doc(db, 'chats', chatId);
        const participantsDoc = await getDoc(participantsRef);

        if (!participantsDoc.exists()) {
          await setDoc(participantsRef, {
            participants: [userId1, userId2],
            createdAt: new Date(),
            lastActivity: new Date()
          });
        } else {
          // Mettre à jour lastActivity
          await setDoc(participantsRef, { lastActivity: new Date() }, { merge: true });
        }
      }

      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const messagePayload = {
        content: content.trim(),
        senderId: userId,
        senderName: user?.username || user?.firstName || 'Anonymous',
        senderRole: user?.roles?.[0] || 'ROLE_USER',
        createdAt: new Date(),
        timestamp: Date.now()
      };
      await addDoc(messagesRef, messagePayload);
      
      // Réinitialiser l'indicateur de frappe après l'envoi
      handleTyping(false);
      
      return true;
    } catch (error) {
      console.error('[useChat] Error sending message:', error);
      return false;
    }
  };

  // Démarrer un nouveau chat privé
  const startPrivateChat = useCallback((otherUserId) => {
    const userId = getUserId();
    if (!userId || !otherUserId) return null;
    return generatePrivateChatId(userId, otherUserId);
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    startPrivateChat,
    chatPartner,
    handleTyping,
    isTyping,
    typingUsers
  };
}; 