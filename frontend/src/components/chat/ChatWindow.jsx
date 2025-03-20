import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../../lib/services/authService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import chatService from '../../lib/services/chatService';

const ChatWindow = ({ onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Use global messages hook from chatService
  const { 
    messages, 
    isLoading, 
    error, 
    refetch: refreshMessages, 
    sendMessage, 
    isSending 
  } = chatService.useGlobalMessages();

  // Get current user when component mounts
  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleManualRefresh = () => {
    refreshMessages();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    // Generate unique ID for this message
    const tempId = `perm-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Use the sendMessage mutation
    sendMessage({
      content: newMessage,
      user,
      tempId
    });
    
    // Clear the input
    setNewMessage('');
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
        {isSending && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-blue-600 font-medium text-sm animate-pulse">Envoi en cours...</p>
            <p className="text-gray-500 text-xs mt-1">Vos messages sont préservés</p>
          </div>
        )}
        
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error.message || "Une erreur s'est produite"}</div>
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
          disabled={isSending}
        />
        <button 
          type="submit" 
          disabled={isSending}
          className={`px-4 py-2 rounded-r-lg focus:outline-none ${
            isSending 
              ? 'bg-blue-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
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
    </div>
  );
};

export default ChatWindow;
