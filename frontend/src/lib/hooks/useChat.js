import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, addDoc, query, where, onSnapshot, orderBy, limit, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '../services/apiService';
import { notificationService } from '../services/notificationService';

export const useChat = (chatId = 'global', refreshChat = 0) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatPartner, setChatPartner] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const { user } = useAuth();
  const processedMessageIds = useRef(new Set());
  const lastNotificationTime = useRef(Date.now());
  const isInitialLoad = useRef(true);

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

  // Function to safely get timestamp from message
  const getMessageTimestamp = (message) => {
    try {
      if (message.timestamp) {
        return new Date(message.timestamp);
      }
      if (message.createdAt?.toDate) {
        return message.createdAt.toDate();
      }
      if (message.createdAt) {
        return new Date(message.createdAt);
      }
      return new Date();
    } catch (error) {
      console.error('Error parsing message timestamp:', error);
      return new Date();
    }
  };

  // Function to create notification for new message
  const createMessageNotification = async (message, isPrivate = false) => {
    try {
      const currentUserId = getUserId();
      if (!currentUserId) {
        console.log('No current user ID found, skipping notification');
        return;
      }

      console.log('Processing message for notification:', {
        messageId: message.id,
        senderId: message.senderId,
        currentUserId,
        isPrivate,
        chatId,
        timestamp: getMessageTimestamp(message)
      });

      // Create notification ONLY if the message is from OTHER users
      if (message.senderId === currentUserId) {
        console.log('Skipping notification - message from current user');
        return;
      }

      // Check if we've already processed this message
      if (processedMessageIds.current.has(message.id)) {
        console.log('Skipping notification - message already processed');
        return;
      }

      // Check if the message is too old (more than 5 seconds)
      const messageTime = getMessageTimestamp(message);
      const timeDiff = Date.now() - messageTime.getTime();
      if (timeDiff > 5000) {
        console.log('Skipping notification - message too old:', timeDiff, 'ms');
        return;
      }

      // For private chat, notify the current user
      if (isPrivate) {
        console.log('Creating private chat notification:', {
          recipientId: currentUserId,
          senderName: message.senderName,
          content: message.content,
          messageId: message.id
        });

        await notificationService.createChatNotification(
          currentUserId,
          message.senderName || 'Unknown User',
          message.content,
          'CHAT_MESSAGE',
          chatId,
          message.id
        );
      } 
      // For global chat, notify only the current user
      else {
        console.log('Creating global chat notification for current user:', {
          userId: currentUserId,
          senderId: message.senderId,
          messageId: message.id
        });

        await notificationService.createChatNotification(
          currentUserId,
          message.senderName || 'Unknown User',
          message.content,
          'CHAT_MESSAGE',
          'global',
          message.id
        );
      }

      // Only mark as processed after successful notification creation
      processedMessageIds.current.add(message.id);
      lastNotificationTime.current = Date.now();
      console.log('Successfully processed message:', message.id);
    } catch (error) {
      console.error('Error creating message notification:', error);
    }
  };

  // Gérer l'indicateur de frappe
  const handleTyping = useCallback(async (isTyping) => {
    if (chatId === 'global' || !user?.id) return;
    
    try {
      // Ensure chatId is a string and properly formatted
      const chatIdStr = String(chatId);
      if (!chatIdStr.includes('_')) {
        console.warn('Invalid chat ID format for typing status:', chatIdStr);
        return;
      }

      const typingRef = doc(db, 'chats', chatIdStr, 'typing', user.id);
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

    console.log('[useChat] useEffect triggered', { 
      chatId, 
      refreshChat, 
      userId, 
      user,
      isInitialLoad: isInitialLoad.current,
      processedMessageCount: processedMessageIds.current.size
    });

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

          console.log('[useChat] Firestore snapshot received', { 
            count: messagesData.length, 
            firstMessage: messagesData[0],
            isInitialLoad: isInitialLoad.current,
            processedMessageCount: processedMessageIds.current.size
          });

          // On initial load, just add all message IDs to processed set without creating notifications
          if (isInitialLoad.current) {
            console.log('Initial load - marking all messages as processed');
            messagesData.forEach(msg => processedMessageIds.current.add(msg.id));
            isInitialLoad.current = false;
            setMessages(messagesData.reverse());
            setLoading(false);
            return;
          }

          // For subsequent updates, only process truly new messages
          const newMessages = messagesData.filter(newMsg => {
            const isNew = !processedMessageIds.current.has(newMsg.id);
            return isNew;
          });

          console.log('New messages detected:', {
            count: newMessages.length,
            newMessages: newMessages.map(m => ({ id: m.id, senderId: m.senderId }))
          });

          // Create notifications only for new messages from other users
          newMessages.forEach(message => {
            if (message.senderId !== userId) {
              createMessageNotification(message, chatId !== 'global');
            }
          });

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

      // Ensure chatId is a string and properly formatted
      const chatIdStr = String(chatId);

      // Vérifier si c'est un chat privé et créer les participants si nécessaire
      if (chatIdStr !== 'global' && chatIdStr.startsWith('private_')) {
        const [, userId1, userId2] = chatIdStr.split('_');
        const participantsRef = doc(db, 'chats', chatIdStr);
        const participantsDoc = await getDoc(participantsRef);

        if (!participantsDoc.exists()) {
          await setDoc(participantsRef, {
            participants: [userId1, userId2],
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp()
          });
        } else {
          // Mettre à jour lastActivity
          await updateDoc(participantsRef, { 
            lastActivity: serverTimestamp() 
          });
        }
      }

      const messagesRef = collection(db, 'chats', chatIdStr, 'messages');
      const messagePayload = {
        content: content.trim(),
        senderId: userId,
        senderName: user?.username || user?.firstName || 'Anonymous',
        senderRole: user?.roles?.[0] || 'ROLE_USER',
        createdAt: serverTimestamp(),
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