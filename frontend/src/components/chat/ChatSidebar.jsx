import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../lib/services/apiService';
import { authService } from '../../lib/services/authService';
import ChatMessages from './ChatMessages';
import UsersList from './UsersList';

const ChatSidebar = ({ isOpen, onClose, onNewMessage = () => {} }) => {
  const [activeTab, setActiveTab] = useState('global');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [privateChats, setPrivateChats] = useState({});
  const [activeChat, setActiveChat] = useState('global');
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);
  const [recentlySent, setRecentlySent] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const sentMessagesCache = useRef(new Map());
  const localMessagesRef = useRef([]);
  const prevMessagesRef = useRef([]);

  // Get current user when component mounts
  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  // Store the current messages in the ref whenever they change
  useEffect(() => {
    localMessagesRef.current = messages;
  }, [messages]);

  // Fetch messages when component mounts or when activeTab/activeChat changes
  useEffect(() => {
    if (isOpen) {
      // Clear any existing interval when dependencies change
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (activeTab === 'global' && activeChat === 'global') {
        // Initial fetch with loading indicator
        fetchMessages();
        
        // DO NOT set up polling - this is intentional to prevent messages from disappearing
        // Users can use the manual refresh button when they want new messages
        
        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      } else if (activeTab === 'global' && activeChat !== 'global' && selectedUser) {
        // For private chats, fetch but do not set up polling
        fetchPrivateMessages(selectedUser.id);
        
        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      }
    }
  }, [isOpen, activeTab, activeChat, selectedUser]);

  // Fetch users when component mounts or when switching to users tab
  useEffect(() => {
    if (isOpen && activeTab === 'users') {
      fetchUsers();
    }
  }, [isOpen, activeTab]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add a new useEffect to check for new messages and trigger the callback
  useEffect(() => {
    if (messages.length > prevMessagesRef.current.length) {
      // Find messages that weren't in previous state
      const newMessages = messages.filter(msg => {
        // Check if this message exists in prevMessages by ID
        return !prevMessagesRef.current.some(
          prevMsg => prevMsg.id === msg.id
        );
      });
      
      // If there are new messages not sent by current user
      if (newMessages.some(msg => msg.sender?.id !== user?.id)) {
        // Trigger the callback to notify about new message
        onNewMessage();
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('newChatMessage'));
      }
    }
    
    // Update previous messages reference
    prevMessagesRef.current = messages;
  }, [messages, user, onNewMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (isInitialLoad) {
      setLoading(true);
    }
    
    // Always load from localStorage first to ensure we never lose messages
    const storedMessages = loadMessagesFromStorage('global');
    if (storedMessages && storedMessages.length > 0) {
      // Always use stored messages as our base set
      setMessages(storedMessages);
      setLoading(false);
    }
    
    try {
      // Use the get method with withAuth to ensure the request is authenticated
      const response = await apiService.get('/messages/recent', apiService.withAuth());
      
      // Get server messages
      const serverMessages = response.messages || [];
      
      // IMPORTANT: We combine local and server messages with preference to local
      // Start with current state + localStorage (already set above)
      const currentMessages = storedMessages.length > 0 ? storedMessages : messages;
      
      // Only add messages from server that don't exist in our local set
      let hasNewMessages = false;
      const combinedMessages = [...currentMessages];
      
      serverMessages.forEach(serverMsg => {
        // Check if this server message is already in our local messages
        const existsLocally = combinedMessages.some(localMsg => 
          // Match by ID if possible
          (serverMsg.id && localMsg.id && serverMsg.id === localMsg.id) ||
          // Otherwise try to match by content + sender
          (serverMsg.content === localMsg.content && 
           serverMsg.sender?.id === localMsg.sender?.id)
        );
        
        // If not exists locally, add it
        if (!existsLocally) {
          combinedMessages.push(serverMsg);
          hasNewMessages = true;
        }
      });
      
      // Only update state if we have new messages
      if (hasNewMessages || combinedMessages.length > currentMessages.length) {
        // Sort by creation time
        const sortedMessages = combinedMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        setMessages(sortedMessages);
        saveMessagesToStorage('global', sortedMessages);
      }
      
      setLoading(false);
      setIsInitialLoad(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const fetchPrivateMessages = async (userId) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    
    // Always load from localStorage first to ensure we never lose messages
    const storedMessages = loadMessagesFromStorage(`private_${userId}`);
    if (storedMessages && storedMessages.length > 0) {
      setPrivateChats(prev => ({
        ...prev,
        [userId]: storedMessages
      }));
      
      if (activeChat === userId) {
        setMessages(storedMessages);
      }
      
      setLoading(false);
    }
    
    try {
      // This endpoint will need to be implemented in the backend
      const response = await apiService.get(`/messages/private/${userId}`, apiService.withAuth());
      
      // Make sure we have a valid response with messages
      const serverMessages = response.messages || [];
      
      // IMPORTANT: We combine local and server messages with preference to local
      // Start with current state + localStorage (already set above)
      const currentMessages = storedMessages.length > 0 ? storedMessages : 
        (privateChats[userId] || []);
      
      // Only add messages from server that don't exist in our local set
      let hasNewMessages = false;
      const combinedMessages = [...currentMessages];
      
      serverMessages.forEach(serverMsg => {
        // Check if this server message is already in our local messages
        const existsLocally = combinedMessages.some(localMsg => 
          // Match by ID if possible
          (serverMsg.id && localMsg.id && serverMsg.id === localMsg.id) ||
          // Otherwise try to match by content + sender
          (serverMsg.content === localMsg.content && 
           serverMsg.sender?.id === localMsg.sender?.id)
        );
        
        // If not exists locally, add it
        if (!existsLocally) {
          combinedMessages.push(serverMsg);
          hasNewMessages = true;
        }
      });
      
      // Only update state if we have new messages
      if (hasNewMessages || combinedMessages.length > currentMessages.length) {
        // Sort by creation time
        const sortedMessages = combinedMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        setPrivateChats(prev => ({
          ...prev,
          [userId]: sortedMessages
        }));
        
        if (activeChat === userId) {
          setMessages(sortedMessages);
        }
        
        saveMessagesToStorage(`private_${userId}`, sortedMessages);
      }
      
      setLoading(false);
      setIsInitialLoad(false);
    } catch (err) {
      console.error(`Error fetching private messages with user ${userId}:`, err);
      setError('Failed to load private messages');
      setLoading(false);
      
      // If we failed to fetch from server but have stored messages, keep using those
      if (messages.length === 0 && activeChat === userId && storedMessages && storedMessages.length > 0) {
        setMessages(storedMessages);
      }
    }
  };

  const silentRefreshPrivateMessages = async (userId) => {
    // Skip refresh if we just sent a message or are currently sending one
    if (recentlySent || sendingMessage) return;
    
    try {
      // Store current set of messages to be able to detect changes
      const currentMessages = [...messages];
      const pendingMessages = currentMessages.filter(msg => msg.isSending || !msg.id.toString().startsWith('temp-'));
      
      // This endpoint will need to be implemented in the backend
      const response = await apiService.get(`/messages/private/${userId}`, apiService.withAuth());
      
      // Make sure we have a valid response with messages
      const serverMessages = response.messages || [];
      
      // Check if we have any temporary messages that need to be preserved
      const tempMessages = currentMessages.filter(msg => 
        msg.isSending || 
        msg.id.toString().startsWith('temp-') || 
        msg.sendFailed ||
        !serverMessages.some(srvMsg => srvMsg.id === msg.id)
      );
      
      // Filter cached messages for this private chat
      const cachedMessages = Array.from(sentMessagesCache.current.values())
        .filter(msg => 
          (msg.recipientId === userId && msg.sender?.id === user?.id) || 
          (msg.recipientId === user?.id && msg.sender?.id === userId)
        );
      
      if (tempMessages.length > 0 || cachedMessages.length > 0) {
        // Combine with temp messages
        const allCachedMessages = [...tempMessages, ...cachedMessages];
        
        // Merge everything
        const mergedMessages = mergeSentMessagesWithServer(serverMessages, allCachedMessages);
        
        // Update the private chat messages for this user
        setPrivateChats(prev => ({
          ...prev,
          [userId]: mergedMessages
        }));
        saveMessagesToStorage(`private_${userId}`, mergedMessages);
        
        // Update the current messages display if this is the active chat
        if (activeChat === userId) {
          setMessages(mergedMessages);
        }
      } else {
        // No special messages to preserve, just use server response
        setPrivateChats(prev => ({
          ...prev,
          [userId]: serverMessages
        }));
        saveMessagesToStorage(`private_${userId}`, serverMessages);
        
        // Update the current messages display if this is the active chat
        if (activeChat === userId) {
          setMessages(serverMessages);
        }
      }
    } catch (err) {
      console.error(`Error silently refreshing private messages with user ${userId}:`, err);
      // Don't modify the message state if refresh fails
    }
  };

  // Helper function to merge server messages with sent messages
  const mergeSentMessagesWithServer = (serverMessages, cachedMessages) => {
    const mergedMessages = [...serverMessages];
    
    // Process each cached message
    cachedMessages.forEach(cachedMsg => {
      // Try to find a matching message on the server (by content and approximate time)
      const matchedServerMsg = serverMessages.find(serverMsg => {
        // First try perfect content match (most reliable)
        if (serverMsg.content === cachedMsg.content) {
          // If sender IDs match or one is undefined
          if (!serverMsg.sender?.id || !cachedMsg.sender?.id || 
              serverMsg.sender?.id === cachedMsg.sender?.id) {
            // Don't worry about time - content match is enough
            return true;
          }
        }
        return false;
      });
      
      // If no match found, add the cached message to the result
      if (!matchedServerMsg) {
        // Add cached message (it hasn't been saved to the server yet)
        mergedMessages.push({
          ...cachedMsg,
          confirmed: false // Mark as not confirmed by server
        });
      }
    });
    
    // Sort by createdAt to maintain chronological order
    return mergedMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiService.get('/users/list', apiService.withAuth());
      setUsers(response);
      setLoadingUsers(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setLoadingUsers(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Flag that we're sending a message and recently sent one
    setSendingMessage(true);
    setRecentlySent(true);
    
    // Add permanent ID for this message to make it easier to find later
    const tempId = `perm-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Create a temporary message with our permanent ID
    const tempMessage = {
      id: tempId,
      content: newMessage,
      sender: user,
      createdAt: new Date().toISOString(),
      isSending: true, // Flag to show sending indicator
      permanent: true, // Mark as permanent - should never be removed
      // Add recipient ID for private messages
      ...(activeChat !== 'global' && { recipientId: selectedUser.id })
    };
    
    // Create a key for this message in the cache
    const cacheKey = `${newMessage}_${tempId}`;
    sentMessagesCache.current.set(cacheKey, tempMessage);
    
    // Update UI immediately with the sending message
    let updatedMessages = [];
    
    if (activeChat === 'global') {
      // Use functional update to ensure we're working with latest state
      setMessages(prevMessages => {
        updatedMessages = [...prevMessages, tempMessage];
        // Save to storage immediately
        saveMessagesToStorage('global', updatedMessages);
        return updatedMessages;
      });
    } else if (selectedUser) {
      // Use functional update to ensure we're working with latest state
      setMessages(prevMessages => {
        updatedMessages = [...prevMessages, tempMessage];
        // Save to storage immediately
        saveMessagesToStorage(`private_${selectedUser.id}`, updatedMessages);
        return updatedMessages;
      });
      
      setPrivateChats(prev => {
        const prevUserMessages = prev[selectedUser.id] || [];
        const updatedPrivateChat = [...prevUserMessages, tempMessage];
        
        // Save immediately
        saveMessagesToStorage(`private_${selectedUser.id}`, updatedPrivateChat);
        
        return {
          ...prev,
          [selectedUser.id]: updatedPrivateChat
        };
      });
    }

    // Also save to sessionStorage as extra backup
    try {
      sessionStorage.setItem(`last_sent_message_${activeChat}`, JSON.stringify(tempMessage));
    } catch (err) {
      console.error('Error saving to session storage:', err);
    }

    try {
      let response;
      
      if (activeChat === 'global') {
        // Send global message
        response = await apiService.post('/messages', { content: newMessage }, apiService.withAuth());
      } else if (selectedUser) {
        // Send private message
        response = await apiService.post('/messages/private', { 
          content: newMessage,
          recipientId: selectedUser.id
        }, apiService.withAuth());
      }
      
      // Get the confirmed message from server
      const confirmedMessage = response && response.data;
      
      if (confirmedMessage) {
        // Update the message in our cache with the server-confirmed version
        sentMessagesCache.current.delete(cacheKey);
        
        // Update the message in our UI to show as confirmed
        // Use functional updates to ensure we're working with latest state
        if (activeChat === 'global') {
          setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg => 
              msg.id === tempId 
                ? { 
                    ...confirmedMessage, 
                    confirmed: true, 
                    permanent: true, // Keep the permanent flag
                    sender: confirmedMessage.sender || user 
                  }
                : msg
            );
            saveMessagesToStorage('global', updatedMessages);
            return updatedMessages;
          });
        } else if (selectedUser) {
          setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg => 
              msg.id === tempId 
                ? { 
                    ...confirmedMessage, 
                    confirmed: true, 
                    permanent: true, // Keep the permanent flag
                    sender: confirmedMessage.sender || user 
                  }
                : msg
            );
            saveMessagesToStorage(`private_${selectedUser.id}`, updatedMessages);
            return updatedMessages;
          });
          
          setPrivateChats(prev => {
            const updatedPrivateChat = (prev[selectedUser.id] || []).map(msg => 
              msg.id === tempId 
                ? { 
                    ...confirmedMessage, 
                    confirmed: true, 
                    permanent: true, // Keep the permanent flag
                    sender: confirmedMessage.sender || user 
                  }
                : msg
            );
            
            saveMessagesToStorage(`private_${selectedUser.id}`, updatedPrivateChat);
            
            return {
              ...prev,
              [selectedUser.id]: updatedPrivateChat
            };
          });
        }
      }
      
      // Clear the input
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Mark the message as failed - but still keep it!
      if (activeChat === 'global') {
        setMessages(prevMessages => {
          const failedMessages = prevMessages.map(msg => 
            msg.id === tempId 
              ? { ...msg, isSending: false, sendFailed: true, permanent: true }
              : msg
          );
          saveMessagesToStorage('global', failedMessages);
          return failedMessages;
        });
      } else if (selectedUser) {
        setMessages(prevMessages => {
          const failedMessages = prevMessages.map(msg => 
            msg.id === tempId 
              ? { ...msg, isSending: false, sendFailed: true, permanent: true }
              : msg
          );
          saveMessagesToStorage(`private_${selectedUser.id}`, failedMessages);
          return failedMessages;
        });
        
        setPrivateChats(prev => {
          const updatedPrivateChat = (prev[selectedUser.id] || []).map(msg => 
            msg.id === tempId 
              ? { ...msg, isSending: false, sendFailed: true, permanent: true }
              : msg
          );
          
          saveMessagesToStorage(`private_${selectedUser.id}`, updatedPrivateChat);
          
          return {
            ...prev,
            [selectedUser.id]: updatedPrivateChat
          };
        });
      }
      
      setError('Failed to send message');
    } finally {
      // Reset sending state
      setSendingMessage(false);
      
      // DO NOT restart polling - this is intentional
      // We only want manual refreshes from now on
    }
  };

  // Handle manually refreshing the messages
  const handleManualRefresh = () => {
    if (activeChat === 'global') {
      fetchMessages();
    } else if (selectedUser) {
      fetchPrivateMessages(selectedUser.id);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // If switching to global chat tab, reset to global chat
    if (tab === 'global') {
      setActiveChat('global');
      setSelectedUser(null);
      setIsInitialLoad(true); // Reset initial load state
      fetchMessages();
    }
    
    // If switching to users tab and no users loaded yet, fetch them
    if (tab === 'users' && users.length === 0) {
      fetchUsers();
    }
  };

  // Handle starting a private chat with a user
  const handleStartPrivateChat = (user) => {
    setActiveTab('global'); // Switch to chat tab
    setActiveChat(user.id); // Set active chat to this user's ID
    setSelectedUser(user); // Store the selected user
    setIsInitialLoad(true); // Reset initial load state
    
    // Check if we already have messages for this user
    if (privateChats[user.id]) {
      setMessages(privateChats[user.id]);
      setIsInitialLoad(false); // If we already have messages, it's not an initial load
    } else {
      // Only fetch if we don't have messages yet
      fetchPrivateMessages(user.id);
    }
  };

  // Handle returning to global chat
  const handleReturnToGlobalChat = () => {
    setActiveChat('global');
    setSelectedUser(null);
    setIsInitialLoad(true); // Reset initial load state
    fetchMessages();
  };

  // Function to save all messages to localStorage
  const saveMessagesToStorage = (chatId, messages) => {
    try {
      // Store up to 100 most recent messages per chat
      const messagesToStore = [...messages].slice(-100);
      localStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(messagesToStore));
    } catch (err) {
      console.error('Error saving messages to storage:', err);
    }
  };

  // Function to load messages from localStorage
  const loadMessagesFromStorage = (chatId) => {
    try {
      const storedMessages = localStorage.getItem(`chat_messages_${chatId}`);
      if (storedMessages) {
        return JSON.parse(storedMessages);
      }
    } catch (err) {
      console.error('Error loading messages from storage:', err);
    }
    return [];
  };

  return (
    <div 
      className={`fixed top-0 right-0 w-80 md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ 
        height: 'calc(100vh - 60px)', 
        top: '60px',
        borderLeft: '1px solid #e5e7eb',
        boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Chat header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium">
          {activeChat === 'global' ? 'Chat' : `Chat avec ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        </h3>
        <div className="flex items-center">
          {activeChat !== 'global' && (
            <button 
              onClick={handleReturnToGlobalChat} 
              className="text-white hover:text-gray-200 mr-3"
              title="Retour au chat global"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs - Only show if not in a private chat */}
      {activeChat === 'global' && (
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 font-medium text-sm ${
              activeTab === 'global' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('global')}
          >
            Chat Global
          </button>
          <button
            className={`flex-1 py-3 font-medium text-sm ${
              activeTab === 'users' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('users')}
          >
            Utilisateurs
          </button>
        </div>
      )}

      {/* Content based on active tab */}
      <div className={`${activeChat === 'global' ? 'h-[calc(100%-106px)]' : 'h-[calc(100%-60px)]'} flex flex-col`}>
        {activeTab === 'global' ? (
          <>
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
              <ChatMessages 
                messages={messages} 
                user={user} 
                loading={loading} 
                error={error} 
                messagesEndRef={messagesEndRef}
                messageContainerLoading={sendingMessage}
                onManualRefresh={handleManualRefresh}
              />
            </div>

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Écrivez votre message${activeChat !== 'global' ? ` à ${selectedUser?.firstName}` : ''}...`}
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={sendingMessage}
              />
              <button 
                type="submit" 
                disabled={sendingMessage}
                className={`text-white px-3 py-2 rounded-r-lg focus:outline-none ${
                  sendingMessage 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {sendingMessage ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            <UsersList 
              users={users} 
              loading={loadingUsers} 
              onStartPrivateChat={handleStartPrivateChat}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
