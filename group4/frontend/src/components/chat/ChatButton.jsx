import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Reset unread indicator when opening chat
    if (!isOpen) {
      setHasUnreadMessages(false);
    }
  };

  // Listen for custom events that indicate new messages
  useEffect(() => {
    const handleNewMessage = () => {
      if (!isOpen) {
        setHasUnreadMessages(true);
      }
    };

    // Add event listener for new messages
    window.addEventListener('newChatMessage', handleNewMessage);
    
    return () => {
      // Clean up
      window.removeEventListener('newChatMessage', handleNewMessage);
    };
  }, [isOpen]);

  return (
    <>
      {/* Chat Sidebar */}
      <ChatSidebar 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onNewMessage={() => {
          if (!isOpen) setHasUnreadMessages(true);
        }}
      />
      
      {/* Chat Button - vertical on the right side */}
      {!isOpen && (
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40">
          <button
            onClick={toggleChat}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-l-lg py-4 px-2 shadow-lg transition-all duration-300 focus:outline-none flex flex-col items-center relative"
            aria-label="Open chat"
          >
            {hasUnreadMessages && (
              <div className="absolute -top-1 -left-1 bg-red-500 rounded-full h-3 w-3"></div>
            )}
            <span className="text-sm font-medium transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
              Chat
            </span>
          </button>
        </div>
      )}
    </>
  );
};

export default ChatButton;
