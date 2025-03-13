import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * Chat button that appears in the bottom right corner
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Function to call when button is clicked
 * @param {boolean} props.hasNewMessages - Whether there are new messages
 */
const ChatButton = ({ onClick, hasNewMessages = false }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 z-50"
      aria-label="Open chat"
    >
      <MessageCircle size={24} />
      {hasNewMessages && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full"></span>
      )}
    </button>
  );
};

export default ChatButton;
