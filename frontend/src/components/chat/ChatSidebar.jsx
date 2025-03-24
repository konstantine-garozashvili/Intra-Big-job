import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../lib/services/apiService';
import { authService } from '../../lib/services/authService';
import ChatMessages from './ChatMessages';
import UsersList from './UsersList';
import chatService from '../../lib/services/chatService';

const ChatSidebar = ({ isOpen, onClose, onNewMessage = () => {} }) => {
  const [activeTab, setActiveTab] = useState('global');
  const [newMessage, setNewMessage] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeChat, setActiveChat] = useState('global');
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const prevMessagesRef = useRef([]);

  // Use global messages hook from chatService
  const {
    messages: globalMessages,
    isLoading: isLoadingGlobal,
    error: globalError,
    refetch: refetchGlobalMessages,
    sendMessage: sendGlobalMessage,
    isSending: isSendingGlobal
  } = chatService.useGlobalMessages();

  // Use private messages hook if a user is selected
  const {
    messages: privateMessages,
    isLoading: isLoadingPrivate,
    error: privateError,
    refetch: refetchPrivateMessages,
    sendMessage: sendPrivateMessage,
    isSending: isSendingPrivate
  } = chatService.usePrivateMessages(selectedUser?.id);

  // Computed values based on active chat
  const messages = activeChat === 'global' ? globalMessages : privateMessages;
  const isLoading = activeChat === 'global' ? isLoadingGlobal : isLoadingPrivate;
  const error = activeChat === 'global' ? globalError : privateError;
  const isSending = activeChat === 'global' ? isSendingGlobal : isSendingPrivate;

  // Get current user when component mounts
  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add a new useEffect to check for new messages and trigger the callback
  useEffect(() => {
    if (messages?.length > 0 && prevMessagesRef.current?.length > 0 && messages.length > prevMessagesRef.current.length) {
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
    prevMessagesRef.current = messages || [];
  }, [messages, user, onNewMessage]);

  // Fetch users when component mounts or when switching to users tab
  useEffect(() => {
    if (isOpen && activeTab === 'users') {
      fetchUsers();
    }
  }, [isOpen, activeTab]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (!newMessage.trim() || isSending) return;
    
    // Generate unique ID for this message
    const tempId = `perm-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    if (activeChat === 'global') {
      // Send global message
      sendGlobalMessage({
        content: newMessage,
        user,
        tempId
      });
    } else if (selectedUser) {
      // Send private message
      sendPrivateMessage({
        content: newMessage,
        user,
        recipientId: selectedUser.id,
        tempId
      });
    }
    
    // Clear the input
    setNewMessage('');
  };

  // Handle manually refreshing the messages
  const handleManualRefresh = () => {
    if (activeChat === 'global') {
      refetchGlobalMessages();
    } else if (selectedUser) {
      refetchPrivateMessages();
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
      refetchGlobalMessages();
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
    
    // Refetch private messages for this user
    setTimeout(() => refetchPrivateMessages(), 0);
  };

  // Handle returning to global chat
  const handleReturnToGlobalChat = () => {
    setActiveChat('global');
    setSelectedUser(null);
    setIsInitialLoad(true);
    refetchGlobalMessages();
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
                loading={isLoading} 
                error={error} 
                messagesEndRef={messagesEndRef}
                messageContainerLoading={isSending}
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
                disabled={isSending}
              />
              <button 
                type="submit" 
                disabled={isSending}
                className={`text-white px-3 py-2 rounded-r-lg focus:outline-none ${
                  isSending 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSending ? (
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
