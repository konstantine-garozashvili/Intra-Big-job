import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../lib/services/apiService';
import { authService } from '../../lib/services/authService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);
  const sentMessagesCache = useRef(new Map());
  const [recentlySent, setRecentlySent] = useState(false);

  // Get current user when component mounts
  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  // Fetch messages when component mounts
  useEffect(() => {
    fetchMessages();
    
    // DO NOT set up polling - this is intentional to prevent messages from disappearing
    // Users can use the manual refresh button when they want new messages
    
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to save all messages to localStorage
  const saveMessagesToStorage = (messages) => {
    try {
      // Store up to 100 most recent messages
      const messagesToStore = [...messages].slice(-100);
      localStorage.setItem('chat_window_messages', JSON.stringify(messagesToStore));
    } catch (err) {
      console.error('Error saving messages to storage:', err);
    }
  };

  // Function to load messages from localStorage
  const loadMessagesFromStorage = () => {
    try {
      const storedMessages = localStorage.getItem('chat_window_messages');
      if (storedMessages) {
        return JSON.parse(storedMessages);
      }
    } catch (err) {
      console.error('Error loading messages from storage:', err);
    }
    return [];
  };

  const fetchMessages = async () => {
    try {
      // Always load from localStorage first to ensure we never lose messages
      const storedMessages = loadMessagesFromStorage();
      if (storedMessages && storedMessages.length > 0) {
        // Always use stored messages as our base set
        setMessages(storedMessages);
        setLoading(false);
      }
      
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
        saveMessagesToStorage(sortedMessages);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    fetchMessages();
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
      permanent: true // Mark as permanent - should never be removed
    };
    
    // Create a key for this message in the cache
    const cacheKey = `${newMessage}_${tempId}`;
    sentMessagesCache.current.set(cacheKey, tempMessage);
    
    // Update UI immediately with the sending message - use functional update
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, tempMessage];
      // Save to storage immediately
      saveMessagesToStorage(updatedMessages);
      return updatedMessages;
    });

    // Also save to sessionStorage as extra backup
    try {
      sessionStorage.setItem(`last_window_message`, JSON.stringify(tempMessage));
    } catch (err) {
      console.error('Error saving to session storage:', err);
    }

    try {
      // Use the post method with withAuth to ensure the request is authenticated
      const response = await apiService.post('/messages', { content: newMessage }, apiService.withAuth());
      
      // Get the confirmed message from server
      const confirmedMessage = response && response.data;
      
      if (confirmedMessage) {
        // Update the message in our cache with the server-confirmed version
        sentMessagesCache.current.delete(cacheKey);
        
        // Update the message in our UI to show as confirmed - use functional update
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
          saveMessagesToStorage(updatedMessages);
          return updatedMessages;
        });
      }
      
      // Clear the input
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Mark the message as failed - but still keep it!
      setMessages(prevMessages => {
        const failedMessages = prevMessages.map(msg => 
          msg.id === tempId 
            ? { ...msg, isSending: false, sendFailed: true, permanent: true }
            : msg
        );
        saveMessagesToStorage(failedMessages);
        return failedMessages;
      });
      
      setError('Failed to send message');
    } finally {
      // Reset sending state
      setSendingMessage(false);
      
      // DO NOT restart polling - this is intentional
      // We only want manual refreshes from now on
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: fr
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'récemment';
    }
  };

  return (
    <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-96 border border-gray-200">
      {/* Chat header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium">Chat global</h3>
        <div className="flex space-x-2">
          <button 
            onClick={handleManualRefresh}
            className="text-white hover:text-gray-200"
            title="Actualiser"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 relative">
        {/* Loading overlay for the entire container */}
        {sendingMessage && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-blue-600 font-medium text-sm animate-pulse">Envoi en cours...</p>
            <p className="text-gray-500 text-xs mt-1">Vos messages sont préservés</p>
          </div>
        )}
        
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center">Aucun message. Soyez le premier à écrire!</div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender?.id === user?.id;
            const isFailed = message.sendFailed === true;
            const isSending = message.isSending === true;
            
            return (
              <div 
                key={message.id} 
                className={`mb-3 ${isOwnMessage ? 'text-right' : ''}`}
              >
                <div 
                  className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                    isOwnMessage 
                      ? isFailed 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-200 text-gray-800'
                  } relative`}
                >
                  {message.sender?.id !== user?.id && (
                    <div className="font-semibold text-xs text-gray-600">
                      {message.sender?.firstName} {message.sender?.lastName}
                      {message.sender?.userRoles && message.sender.userRoles.length > 0 && (
                        <span className="ml-1 text-xs font-normal text-gray-500">
                          ({message.sender.userRoles.map(userRole => userRole.role?.name).join(', ')})
                        </span>
                      )}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${isOwnMessage ? 'text-blue-600/70' : 'text-gray-500'}`}>
                    {isSending ? (
                      <>
                        <span className="animate-pulse">Envoi en cours</span>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      </>
                    ) : isFailed ? (
                      <span className="text-red-500">Échec d'envoi</span>
                    ) : (
                      formatTime(message.createdAt)
                    )}
                  </div>
                  
                  {message.confirmed && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full h-2 w-2"></div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sendingMessage}
        />
        <button 
          type="submit" 
          disabled={sendingMessage}
          className={`px-4 py-2 rounded-r-lg focus:outline-none ${
            sendingMessage 
              ? 'bg-blue-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
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
    </div>
  );
};

export default ChatWindow;
