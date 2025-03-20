import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ChatMessages = ({ messages, user, loading, error, messagesEndRef, messageContainerLoading, onManualRefresh }) => {
  // Function to format message time
  const formatMessageTime = (dateString) => {
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

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-gray-500">Aucun message</div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Manual refresh button */}
      <button 
        onClick={onManualRefresh}
        className="absolute top-0 right-0 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-bl-md z-10 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        Actualiser
      </button>
      
      {/* Loading overlay for the entire container */}
      {messageContainerLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-blue-600 font-medium text-sm animate-pulse">Envoi en cours...</p>
          <p className="text-gray-500 text-xs mt-1">Vos messages sont préservés</p>
        </div>
      )}
      
      <div className="space-y-3">
        {messages.map((message, index) => {
          const isOwnMessage = message.sender?.id === user?.id;
          const isFailed = message.sendFailed === true;
          const isSending = message.isSending === true;
          
          return (
            <div 
              key={message.id || index} 
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] px-3 py-2 rounded-lg ${
                  isOwnMessage 
                    ? isFailed 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-200 text-gray-800'
                } relative`}
              >
                {!isOwnMessage && (
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    {message.sender?.firstName} {message.sender?.lastName}
                  </div>
                )}
                
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                
                <div className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                  {isSending ? (
                    <>
                      <span className="animate-pulse">Envoi en cours</span>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                    </>
                  ) : isFailed ? (
                    <span className="text-red-500">Échec d'envoi</span>
                  ) : (
                    formatMessageTime(message.createdAt)
                  )}
                </div>
                
                {message.confirmed && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full h-2 w-2"></div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
