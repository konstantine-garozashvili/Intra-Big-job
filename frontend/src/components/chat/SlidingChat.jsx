import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Smile, Send, Globe, X } from "lucide-react";
import { cn } from "../../lib/utils";
import ChatIcon from "../../assets/chat.svg";
import ContactTab from "./ContactTab";
import { useChat } from "../../lib/hooks/useChat";
import "./SlidingChat.css";
import { useUnreadPrivateMessagesCount } from '../../lib/hooks/useUnreadPrivateMessagesCount';

export default function SlidingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [panelWidth, setPanelWidth] = useState(320);
  const [messageInput, setMessageInput] = useState("");
  const [currentChatId, setCurrentChatId] = useState("global");
  const [refreshChat, setRefreshChat] = useState(0);
  const panelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { messages, loading, sendMessage, startPrivateChat, chatPartner } = useChat(currentChatId, refreshChat);
  const unreadPrivateCount = useUnreadPrivateMessagesCount();

  // Get actual panel width on mount
  useEffect(() => {
    if (panelRef.current) {
      setPanelWidth(panelRef.current.offsetWidth);
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Quand on revient sur l'onglet chat, on force le refresh
  useEffect(() => {
    if (activeTab === 'chat') {
      setRefreshChat((v) => v + 1);
    }
  }, [activeTab, currentChatId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  }, [messageInput]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserSelect = (selectedUser) => {
    if (selectedUser.id === 'global') {
      setCurrentChatId('global');
      setActiveTab('chat');
    } else {
      const privateChatId = startPrivateChat(selectedUser.id);
      if (privateChatId) {
        setCurrentChatId(privateChatId);
        setActiveTab('chat');
      }
    }
  };

  // Largeur du panel (320px) + largeur du bouton (56px)
  const PANEL_WIDTH = 320;
  const BUTTON_WIDTH = 56;

  // Fermer le chat si clic à l'extérieur
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target) &&
        !event.target.closest('[data-radix-popper-content-wrapper]') // Ignore clicks on Radix UI popover
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className="fixed top-1/2 z-50"
      style={{
        right: isOpen ? BUTTON_WIDTH / 2 : -24,
        transform: 'translateY(-50%)',
        width: PANEL_WIDTH + BUTTON_WIDTH,
        transition: 'right 0.8s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div
        ref={panelRef}
        className="relative flex items-center h-full"
        style={{
          transform: `translateX(${isOpen ? 0 : PANEL_WIDTH}px)`,
          transition: "transform 0.8s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Chat Toggle Button - languette collée à gauche du panneau */}
        <button
          onClick={toggleChat}
          className="flex items-center justify-center w-[32px] h-[80px] rounded-l-[28px] focus:outline-none relative overflow-hidden"
          aria-label="Toggle chat"
          style={{
            background: 'linear-gradient(135deg, #5C85EE 23%, #00164D 100%)',
            boxShadow: '0 8px 48px 0 rgba(79, 123, 250, 0.35)',
            border: 'none',
            padding: 0,
          }}
        >
          <span style={{
            position: 'absolute',
            transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)',
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'translateX(-20px) scale(0.8)' : 'translateX(0) scale(1)',
            pointerEvents: isOpen ? 'none' : 'auto',
            width: 25,
            height: 25,
            display: 'block',
          }}>
            <img src={ChatIcon} alt="Chat" style={{ width: 25, height: 25, display: 'block' }} />
          </span>
          <span style={{
            position: 'absolute',
            transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.8)',
            pointerEvents: isOpen ? 'auto' : 'none',
            width: 25,
            height: 25,
            display: 'block',
          }}>
            <X className="w-[25px] h-[25px] text-white" />
          </span>
          {/* Badge de notification pour messages privés non lus */}
          {unreadPrivateCount > 0 && (
            <span
              className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"
              title={`${unreadPrivateCount} message(s) privé(s) non lu(s)`}
            />
          )}
        </button>

        {/* Chat Panel */}
        <div
          className="w-80 h-[36rem] rounded-3xl shadow-xl overflow-hidden flex flex-col chat-panel-modern"
          style={{
            transition: "opacity 0.8s ease-in-out",
            opacity: isOpen ? 1 : 0.95,
          }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-center p-4 border-b border-gray-800">
            <div className="relative flex space-x-1 tab-switcher">
              {/* Fond animé */}
              <div
                className={`tab-bg-slider ${activeTab}`}
                aria-hidden="true"
              />
              <button
                onClick={() => {
                  setActiveTab("chat");
                  if (!currentChatId) setCurrentChatId("global");
                }}
                className={cn(
                  "tab-btn",
                  activeTab === "chat" ? "active" : ""
                )}
                tabIndex={0}
              >
                {currentChatId === "global" ? "Chat" : chatPartner?.firstName || "Chat"}
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={cn(
                  "tab-btn",
                  activeTab === "contact" ? "active" : ""
                )}
                tabIndex={0}
              >
                Contact
              </button>
            </div>
          </div>

          {/* Chat Messages / Contact Tab with sliding animation */}
          <div className="relative flex-1 overflow-hidden sliding-tabs-container">
            <div className={`sliding-tabs-inner ${activeTab === "chat" ? "show-chat" : "show-contact"}`}>
              {/* Onglet Chat */}
              <div className="tab-content chat-tab flex flex-col justify-between">
                <div className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageCircle className="w-12 h-12 mb-4" />
                      <p>Aucun message pour le moment</p>
                      <p className="text-sm">Commencez la conversation !</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn("flex mb-4", message.isUser ? "justify-end" : "justify-start")}
                        style={{
                          transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
                          opacity: isOpen ? 1 : 0,
                          transform: isOpen ? "translateY(0)" : "translateY(10px)",
                        }}
                      >
                        {!message.isUser && (
                          <div className="w-8 h-8 rounded-full bg-gray-600 mr-2 overflow-hidden flex items-center justify-center text-xs text-white">
                            {message.senderName?.charAt(0).toUpperCase() || 'A'}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] p-3 rounded-2xl break-words whitespace-pre-wrap",
                            message.isUser ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
                          )}
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            hyphens: "auto"
                          }}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-50 mt-1">
                            {message.senderName} • {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {message.isUser && (
                          <div className="w-8 h-8 rounded-full bg-gray-600 ml-2 overflow-hidden flex items-center justify-center text-xs text-white">
                            {message.senderName?.charAt(0).toUpperCase() || 'A'}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {/* Chat Input déplacé ici pour faire partie du slide */}
                <div
                  className="px-3 pb-3 pt-2"
                  style={{
                    transition: "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
                    transitionDelay: "0.1s",
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateY(0)" : "translateY(20px)",
                  }}
                >
                  <div className="flex items-end gap-2 w-full">
                    <div
                      className="flex-1 flex items-start px-3 py-1.5"
                      style={{
                        background: "linear-gradient(135deg, #2B367A 0%, #3B47B6 100%)",
                        borderRadius: "1.8rem",
                        boxShadow: "0 2px 8px 0 rgba(44, 62, 120, 0.10)",
                        minHeight: 44,
                        maxHeight: 132, // Permet jusqu'à ~5 lignes de texte
                        display: 'flex',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      <div
                        className="flex items-center justify-center mr-2 mt-1"
                        style={{
                          width: 28,
                          height: 28,
                        }}
                      >
                        <Smile className="h-5 w-5 text-white" />
                      </div>
                      <textarea
                        ref={textareaRef}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Commencer à parler..."
                        rows={1}
                        className="bg-transparent border-none outline-none text-white placeholder-gray-300 w-full font-normal resize-none placeholder:text-xs placeholder:leading-tight"
                        style={{
                          padding: '6px 0',
                          minHeight: 28,
                          maxHeight: 120,
                          background: 'transparent',
                          overflow: 'hidden',
                          lineHeight: '1.2',
                          fontSize: 14,
                          textAlign: 'left',
                          verticalAlign: 'middle',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #5C85EE 23%, #00164D 100%)",
                        boxShadow: "0 4px 16px 0 rgba(79, 123, 250, 0.18)",
                        border: "none",
                        marginLeft: 4,
                      }}
                    >
                      <Send className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Onglet Contact */}
              <div className="tab-content contact-tab flex flex-col justify-between">
                <div className="flex-1">
                  <ContactTab 
                    onUserSelect={handleUserSelect} 
                    selectedUserId={currentChatId === 'global' ? 'global' : chatPartner?.id}
                  />
                </div>
                {/* Zone vide pour garder la même hauteur que l'input du chat */}
                <div style={{ height: 68 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 