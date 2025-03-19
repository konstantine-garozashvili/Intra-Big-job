import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Sidebar */}
      <ChatSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      {/* Chat Button - vertical on the right side */}
      {!isOpen && (
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40">
          <button
            onClick={toggleChat}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-l-lg py-4 px-2 shadow-lg transition-all duration-300 focus:outline-none flex flex-col items-center"
            aria-label="Open chat"
          >
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
