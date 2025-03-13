import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip } from 'lucide-react';

/**
 * Chat popup component that displays when the chat button is clicked
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Function to call when popup is closed
 * @param {Array} props.messages - Array of message objects
 * @param {Function} props.onSendMessage - Function to call when a message is sent
 * @param {boolean} props.isLoading - Whether messages are currently loading
 */
const ChatPopup = ({ onClose, messages = [], onSendMessage, isLoading = false }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h3 className="font-bold">BigProject Chat</h3>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-4 flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.isMine 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {!msg.isMine && (
                  <p className="text-xs font-semibold mb-1">{msg.sender}</p>
                )}
                <p>{msg.text}</p>
                <p className="text-xs mt-1 opacity-70 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex items-center">
        <button 
          type="button"
          className="p-2 text-gray-500 hover:text-blue-600"
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border-none outline-none bg-transparent"
          disabled={isLoading}
        />
        <button 
          type="submit"
          className={`p-2 ${
            newMessage.trim() && !isLoading 
              ? 'text-blue-600 hover:text-blue-800' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          disabled={!newMessage.trim() || isLoading}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatPopup;
