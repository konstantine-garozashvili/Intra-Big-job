import apiService from './apiService';
import { authService } from './authService';
import { toast } from 'sonner';

/**
 * Service for managing user notifications
 */
class NotificationService {
  constructor() {
    this.cache = {
      notifications: {
        notifications: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1
        },
        unread_count: 0
      },
      unreadCount: 0,
      lastFetch: null,
      fetchPromise: null
    };
    this.subscribers = [];
    this.pollingInterval = null;
    this.pollingDelay = 60000; // 1 minute
    this.useMockBackend = true;
  }

  /**
   * Get notifications with optional pagination
   */
  async getNotifications(page = 1, limit = 10, includeRead = true, refresh = false) {
    try {
      // console.log('Using Firebase notifications data');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (this.cache.notifications && this.cache.notifications.notifications) {
        let notifications = [...this.cache.notifications.notifications];
        
        if (!includeRead) {
          notifications = notifications.filter(n => !n.isRead);
        }
        
        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const total = notifications.length;
        const pages = Math.max(1, Math.ceil(total / limit));
        const startIndex = (page - 1) * limit;
        const paginatedNotifications = notifications.slice(startIndex, startIndex + limit);
        
        const result = {
          notifications: paginatedNotifications,
          pagination: {
            total: total,
            page: page,
            limit: limit,
            pages: pages
          },
          unread_count: notifications.filter(n => !n.isRead).length
        };
        
        this.cache.notifications = result;
        this.cache.unreadCount = result.unread_count;
        this.cache.lastFetch = new Date();
        
        this.notifySubscribers();
        
        return result;
      }
      
      if (this.cache.fetchPromise) {
        try {
          await this.cache.fetchPromise;
        } catch (error) {
          console.log("Waiting for fetch promise failed, checking cache next");
        }
      }

      if (!refresh && this.cache.notifications && this.cache.notifications.notifications) {
        console.log("Using cached notifications data (immediate response)");
        return this.cache.notifications;
      }

      console.log("No valid cached data, returning empty notifications");
      
      const emptyData = {
        notifications: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1
        },
        unread_count: 0
      };
      
      this.cache.notifications = emptyData;
      this.cache.unreadCount = 0;
      this.cache.lastFetch = new Date();
      
      this.notifySubscribers();
      
      return emptyData;
    } catch (error) {
      this.cache.fetchPromise = null;
      console.error('Error fetching notifications:', error);
      
      if (this.cache.notifications && this.cache.notifications.notifications) {
        console.log("Returning cached notification data in catch block");
        return this.cache.notifications;
      }
      
      return {
        notifications: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1
        },
        unread_count: 0
      };
    }
  }

  /**
   * Get the current unread notification count
   */
  async getUnreadCount(refresh = false) {
    try {
      if (refresh) {
        let currentCount = 0;
        if (this.cache.notifications && this.cache.notifications.notifications) {
          currentCount = this.cache.notifications.notifications.filter(n => !n.readAt && !n.isRead).length;
          this.cache.unreadCount = currentCount;
          this.notifySubscribers();
        }
      }
      
      if (!refresh && this.cache.lastFetch) {
        const now = new Date();
        const cacheAge = now - this.cache.lastFetch;
        
        if (cacheAge < 30000) {
          return this.cache.unreadCount;
        }
      }

      let unreadCount = 0;
      
      if (this.cache.notifications && this.cache.notifications.notifications) {
        unreadCount = this.cache.notifications.notifications.filter(n => !n.readAt && !n.isRead).length;
      }
      
      this.cache.unreadCount = unreadCount;
      this.cache.lastFetch = new Date();
      
      this.notifySubscribers();
      
      return unreadCount;
    } catch (error) {
      console.error('Error calculating unread notification count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read locally in cache
   */
  markNotificationAsReadLocally(notificationId) {
    if (!this.cache.notifications || !this.cache.notifications.notifications) {
      return false;
    }
    
    const notification = this.cache.notifications.notifications.find(n => n.id === notificationId);
    if (notification && !notification.readAt) {
      notification.readAt = new Date().toISOString();
      notification.isRead = true;
      this.cache.unreadCount = Math.max(0, this.cache.unreadCount - 1);
      this.notifySubscribers();
      return true;
    }
    
    return false;
  }

  /**
   * Mark all notifications as read locally in cache
   */
  markAllNotificationsAsReadLocally() {
    if (!this.cache.notifications || !this.cache.notifications.notifications) {
      return false;
    }
    
    let changed = false;
    this.cache.notifications.notifications.forEach(notification => {
      if (!notification.readAt) {
        notification.readAt = new Date().toISOString();
        notification.isRead = true;
        changed = true;
      }
    });
    
    if (changed) {
      this.cache.unreadCount = 0;
      this.notifySubscribers();
    }
    
    return changed;
  }

  /**
   * Start polling for new notifications
   */
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    this.pollingInterval = setInterval(() => {
      this.getUnreadCount(true).catch(error => {
        console.error('Error in notification polling:', error);
      });
    }, this.pollingDelay);
  }

  /**
   * Stop polling for new notifications
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.warn('Notification subscriber must be a function');
      return;
    }
    
    this.subscribers.push(callback);
    
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of changes
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback({
          unreadCount: this.cache.unreadCount,
          notifications: this.cache.notifications?.notifications || []
        });
      } catch (error) {
        console.error('Error in notification subscriber:', error);
      }
    });
  }

  /**
   * Reset cache
   */
  resetCache() {
    this.cache = {
      notifications: {
        notifications: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1
        },
        unread_count: 0
      },
      unreadCount: 0,
      lastFetch: null,
      fetchPromise: null
    };
    
    this.notifySubscribers();
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId) {
    try {
      const success = this.markNotificationAsReadLocally(notificationId);
      
      return {
        success: true,
        notification: this.cache.notifications?.notifications?.find(n => n.id === notificationId) || null,
        unread_count: this.cache.unreadCount
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.message,
        unread_count: this.cache.unreadCount
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const success = this.markAllNotificationsAsReadLocally();
      
      return {
        success: true,
        updated: this.cache.notifications?.notifications?.length || 0,
        unread_count: 0
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        error: error.message,
        unread_count: this.cache.unreadCount
      };
    }
  }

  /**
   * Create a test notification without trying API
   */
  async createTestNotification(type = 'document', targetUrl = '/dashboard') {
    try {
      console.log("Creating local test notification");
      
      const now = new Date();
      const newNotification = {
        id: `local-${now.getTime()}`,
        title: `Test Notification (${type})`,
        message: `Ceci est une notification de test de type "${type}" créée localement`,
        type: type,
        targetUrl: targetUrl,
        createdAt: now.toISOString(),
        readAt: null,
        isRead: false
      };
      
      if (!this.cache.notifications.notifications) {
        this.cache.notifications.notifications = [];
      }
      
      this.cache.notifications.notifications.unshift(newNotification);
      this.cache.unreadCount += 1;
      
      if (this.cache.notifications.pagination) {
        this.cache.notifications.pagination.total += 1;
      }
      
      this.notifySubscribers();
      
      return {
        success: true,
        notification: newNotification
      };
    } catch (error) {
      console.error('Error creating test notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const notificationService = new NotificationService(); 