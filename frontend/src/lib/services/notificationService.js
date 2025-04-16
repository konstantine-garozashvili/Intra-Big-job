import axios from 'axios';

export const notificationService = {
  /**
   * Fetch user notifications
   * @returns {Promise} Promise object with notifications data
   */
  getUserNotifications: async () => {
    try {
      const response = await axios.get('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, notifications: [] };
    }
  },
  
  /**
   * Mark notifications as read
   * @param {Array} notificationIds - Optional array of notification IDs to mark as read
   * @returns {Promise} Promise object with result
   */
  markNotificationsAsRead: async (notificationIds = []) => {
    try {
      const response = await axios.post('/api/notifications/mark-read', 
        { notificationIds },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return { success: false };
    }
  }
};
