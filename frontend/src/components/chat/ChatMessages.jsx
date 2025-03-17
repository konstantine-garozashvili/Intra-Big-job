import React from 'react';

const ChatMessages = ({ messages, user, loading, error, messagesEndRef }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Only show loading indicator if there are no messages yet
  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (messages.length === 0) {
    return <div className="text-gray-500 text-center">Aucun message. Soyez le premier à écrire!</div>;
  }

  return (
    <div className="space-y-3 px-2">
      {messages.map((message) => {
        const isCurrentUser = message.sender.id === user?.id;
        return (
          <div 
            key={message.id} 
            className={`flex mb-3 ${isCurrentUser ? 'justify-start' : 'justify-end'}`}
          >
            <div 
              className={`rounded-lg px-4 py-2 max-w-[70%] ${
                isCurrentUser 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'bg-blue-500 text-white'
              }`}
            >
              {/* Sender name for messages from others (now on the right) */}
              {!isCurrentUser && (
                <div className="font-semibold text-xs text-blue-100 mb-1">
                  {message.sender.firstName} {message.sender.lastName}
                  {message.sender.userRoles && message.sender.userRoles.length > 0 && (
                    <span className="ml-1 text-xs font-normal text-blue-100">
                      ({message.sender.userRoles.map(userRole => userRole.role.name).join(', ')})
                    </span>
                  )}
                </div>
              )}
              
              {/* Message content */}
              <div className="break-words">{message.content}</div>
              
              {/* Timestamp */}
              <div className={`text-xs mt-1 ${isCurrentUser ? 'text-gray-500' : 'text-blue-100'}`}>
                {formatTime(message.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
