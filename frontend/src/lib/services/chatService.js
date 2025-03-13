import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Service for handling chat-related API calls
 */
export const chatService = {
  /**
   * Get all messages for the current user
   * @returns {Promise<Array>} Promise that resolves to an array of messages
   */
  getMessages: async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/messages`, {
        withCredentials: true
      });
      return response.data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Send a new message
   * @param {string} text - The message text
   * @returns {Promise<Object>} Promise that resolves to the created message
   */
  sendMessage: async (text) => {
    try {
      const response = await axios.post(
        `${API_URL}/chat/messages`,
        { text },
        { withCredentials: true }
      );
      return response.data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Mark messages as read
   * @param {Array<number>} messageIds - Array of message IDs to mark as read
   * @returns {Promise<Object>} Promise that resolves to the response data
   */
  markAsRead: async (messageIds) => {
    try {
      const response = await axios.post(
        `${API_URL}/chat/messages/read`,
        { messageIds },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
};
