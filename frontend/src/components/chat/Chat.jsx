import React, { useState, useEffect } from 'react';
import ChatButton from './ChatButton';
import ChatPopup from './ChatPopup';
import { authService } from '@/lib/services/authService';
import { chatService } from '@/lib/services/chatService';

/**
 * Main Chat component that manages the chat state and renders the button and popup
 */
const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current user info when component mounts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setCurrentUser({
            id: userData.id,
            name: `${userData.firstName} ${userData.lastName}`,
            roles: userData.roles || []
          });
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        // In a real implementation, this would call the API
        // const fetchedMessages = await chatService.getMessages();
        
        // Mock data for now
        const mockMessages = [
          {
            id: 1,
            sender: 'John Doe (Teacher)',
            text: 'Hello everyone! Welcome to the class chat.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isMine: false,
            senderId: 2
          },
          {
            id: 2,
            sender: 'Jane Smith (Student)',
            text: 'Thank you! I have a question about the assignment.',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            isMine: false,
            senderId: 3
          },
          {
            id: 3,
            sender: 'John Doe (Teacher)',
            text: 'Sure, what would you like to know?',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            isMine: false,
            senderId: 2
          }
        ];

        // Mark messages as mine if they were sent by the current user
        const updatedMessages = mockMessages.map(msg => ({
          ...msg,
          isMine: msg.senderId === currentUser.id
        }));
        
        setMessages(updatedMessages);

        // Check for unread messages
        const hasUnread = updatedMessages.some(msg => 
          !msg.isMine && !msg.read && new Date(msg.timestamp) > new Date(Date.now() - 86400000) // Last 24 hours
        );
        
        setHasNewMessages(hasUnread);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchMessages();
      
      // Set up polling for new messages (every 30 seconds)
      const intervalId = setInterval(fetchMessages, 30000);
      
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [currentUser]);

  // Reset new messages flag when chat is opened
  useEffect(() => {
    if (isOpen && hasNewMessages) {
      setHasNewMessages(false);
      
      // In a real implementation, mark messages as read
      // const unreadMessageIds = messages
      //   .filter(msg => !msg.isMine && !msg.read)
      //   .map(msg => msg.id);
      // 
      // if (unreadMessageIds.length > 0) {
      //   chatService.markAsRead(unreadMessageIds);
      // }
    }
  }, [isOpen, hasNewMessages, messages]);

  const handleSendMessage = async (text) => {
    if (!currentUser) return;

    const newMessage = {
      id: Date.now(),
      sender: currentUser.name,
      text,
      timestamp: new Date().toISOString(),
      isMine: true,
      senderId: currentUser.id,
      read: true
    };

    // Add message to local state immediately for better UX
    setMessages(prevMessages => [...prevMessages, newMessage]);

    try {
      // In a real implementation, send the message to the server
      // const sentMessage = await chatService.sendMessage(text);
      // 
      // If needed, update the local message with the server response
      // setMessages(prevMessages => 
      //   prevMessages.map(msg => 
      //     msg.id === newMessage.id ? { ...msg, id: sentMessage.id } : msg
      //   )
      // );
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error (e.g., show error message, retry logic)
    }
  };

  return (
    <>
      <ChatButton 
        onClick={() => setIsOpen(true)} 
        hasNewMessages={hasNewMessages} 
      />
      
      {isOpen && (
        <ChatPopup 
          onClose={() => setIsOpen(false)} 
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default Chat;
