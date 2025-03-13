import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../lib/services/apiService';
import { authService } from '../../lib/services/authService';
import ChatMessages from './ChatMessages';
import UsersList from './UsersList';

const ChatSidebar = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('global');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [privateChats, setPrivateChats] = useState({});
  const [activeChat, setActiveChat] = useState('global');
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Get current user when component mounts
  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  // Fetch messages when component mounts or when activeTab/activeChat changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'global' && activeChat === 'global') {
        fetchMessages();
        // Set up polling to check for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
      } else if (activeTab === 'global' && activeChat !== 'global' && selectedUser) {
        fetchPrivateMessages(selectedUser.id);
        // Set up polling for private messages
        const interval = setInterval(() => fetchPrivateMessages(selectedUser.id), 5000);
        return () => clearInterval(interval);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      // Use the get method with withAuth to ensure the request is authenticated
      const response = await apiService.get('/messages/recent', apiService.withAuth());
      setMessages(response.messages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const fetchPrivateMessages = async (userId) => {
    try {
      setLoading(true);
      // This endpoint will need to be implemented in the backend
      const response = await apiService.get(`/messages/private/${userId}`, apiService.withAuth());
      
      // Update the private chat messages for this user
      setPrivateChats(prev => ({
        ...prev,
        [userId]: response.messages || []
      }));
      
      // Update the current messages display
      if (activeChat === userId) {
        setMessages(response.messages || []);
      }
      
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching private messages with user ${userId}:`, err);
      setError('Failed to load private messages');
      setLoading(false);
    }
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
    if (!newMessage.trim()) return;

    try {
      if (activeChat === 'global') {
        // Send global message
        await apiService.post('/messages', { content: newMessage }, apiService.withAuth());
        fetchMessages(); // Refresh messages after sending
      } else if (selectedUser) {
        // Send private message
        await apiService.post('/messages/private', { 
          content: newMessage,
          recipientId: selectedUser.id
        }, apiService.withAuth());
        fetchPrivateMessages(selectedUser.id); // Refresh private messages
      }
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // If switching to global chat tab, reset to global chat
    if (tab === 'global') {
      setActiveChat('global');
      setSelectedUser(null);
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
    
    // Fetch private messages with this user
    fetchPrivateMessages(user.id);
  };

  // Handle returning to global chat
  const handleReturnToGlobalChat = () => {
    setActiveChat('global');
    setSelectedUser(null);
    fetchMessages();
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
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-3 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
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
