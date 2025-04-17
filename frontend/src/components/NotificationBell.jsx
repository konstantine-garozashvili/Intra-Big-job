import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import axios from 'axios';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastChecked, setLastChecked] = useState(Date.now());

  // Check if the current user is an admin
  const isCurrentUserAdmin = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser || !currentUser.roles) return false;
      
      return currentUser.roles.some(role => 
        role === 'ROLE_ADMIN' || role === 'ADMIN' || 
        role === 'ROLE_SUPERADMIN' || role === 'SUPERADMIN'
      );
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };
  
  // Get the current user ID
  const getCurrentUserId = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      return currentUser?.id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

  // Process notification data (from any source)
  const processNotification = (detail) => {
    if (!detail) {
      console.log('🔔 Cannot process notification: No detail provided');
      return;
    }
    
    console.log('🔔 Processing notification data:', detail);
    
    const currentUserId = getCurrentUserId();
    const isAdmin = isCurrentUserAdmin();
    
    console.log('🔔 Current user info:', {
      id: currentUserId,
      isAdmin: isAdmin,
      localStorage: localStorage.getItem('user')
    });
    
    // For debugging: log the exact comparison
    console.log('🔔 Notification checks:', { 
      currentUserId: currentUserId, 
      targetUserId: detail?.userId,
      isAdmin: isAdmin,
      idsMatch: String(currentUserId) === String(detail.userId),
      shouldShow: String(currentUserId) === String(detail.userId) && !isAdmin
    });
    
    // ONLY show notification if:
    // 1. It's for the current user (userId matches)
    // 2. The current user is NOT an admin
    // Convert to strings for comparison to avoid type issues
    if (String(currentUserId) === String(detail.userId) && !isAdmin) {
      console.log('🔔 SHOWING NOTIFICATION FOR USER');
      
      const newNotification = {
        type: 'role_changed',
        message: detail.message || 'Votre rôle a été modifié',
        timestamp: detail.timestamp || new Date().toISOString()
      };
      
      // Force notification to be visible
      setHasUnread(true);
      
      // Show alert for debugging
      console.log('🔔🔔🔔 NOTIFICATION ADDED:', newNotification);
      
      // Update state with new notification
      const updatedNotifications = [newNotification, ...notifications].slice(0, 5);
      console.log('🔔 Updated notifications array:', updatedNotifications);
      
      setNotifications(updatedNotifications);
      
      // Store notifications in localStorage for persistence
      try {
        localStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
        console.log('🔔 Saved notifications to localStorage');
      } catch (error) {
        console.error('Error saving notifications to localStorage:', error);
      }
      
      // Alert the user about the role change
      setTimeout(() => {
        alert(`Notification: ${newNotification.message}`);
      }, 500);
      
      return true; // Notification was processed
    } else {
      console.log('🔔 Not showing notification - conditions not met');
      return false; // Notification was not processed
    }
  };

  // Initialize with any stored notifications
  useEffect(() => {
    try {
      const storedNotifications = localStorage.getItem('userNotifications');
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        if (Array.isArray(parsedNotifications) && parsedNotifications.length > 0) {
          setNotifications(parsedNotifications);
          setHasUnread(true);
          console.log('🔔 Loaded stored notifications:', parsedNotifications);
        }
      }
    } catch (error) {
      console.error('Error loading stored notifications:', error);
    }
  }, []);

  // Check for role changes via polling
  useEffect(() => {
    // Function to check for role changes
    const checkForRoleChanges = async () => {
      try {
        // Only check if user is not an admin
        if (isCurrentUserAdmin()) {
          console.log('🔔 User is admin, skipping notification check');
          return;
        }
        
        const userId = getCurrentUserId();
        if (!userId) {
          console.log('🔔 No user ID found, skipping notification check');
          return;
        }
        
        // Check if user data has changed by comparing roles
        const response = await axios.get('/api/me');
        const userData = response.data;
        
        // Compare with stored user data
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        // Ensure we have valid roles arrays
        const storedRoles = Array.isArray(storedUser?.roles) ? storedUser.roles : [];
        const newRoles = Array.isArray(userData?.roles) ? userData.roles : [];
        
        // Check if roles have changed
        if (storedUser && JSON.stringify(storedRoles) !== JSON.stringify(newRoles)) {
          console.log('🔔 Role change detected!', {
            oldRoles: storedRoles,
            newRoles: newRoles,
            userId: userData?.id,
            currentUserId: getCurrentUserId()
          });
          
          // Update localStorage with new user data
          if (userData && userData.id) {
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('🔔 Updated user in localStorage');
            
            // Create notification with safe string formatting
            const oldRolesStr = storedRoles.join(', ') || 'aucun rôle';
            const newRolesStr = newRoles.join(', ') || 'aucun rôle';
            
            const notification = {
              userId: userData.id,
              message: `Votre rôle a été modifié de ${oldRolesStr} à ${newRolesStr}`,
              timestamp: new Date().toISOString()
            };
            
            console.log('🔔 Created notification object:', notification);
            
            // Process the notification
            const notificationProcessed = processNotification(notification);
            console.log('🔔 Notification processed:', notificationProcessed);
            
            // Force update notifications if needed
            if (notificationProcessed) {
              console.log('🔔 Forcing notification update');
              setHasUnread(true);
            }
          }
        }
        
        setLastChecked(Date.now());
      } catch (error) {
        console.error('Error checking for role changes:', error);
      }
    };
    
    // Check immediately on mount
    checkForRoleChanges();
    
    // Set up polling interval (every 5 seconds)
    const intervalId = setInterval(checkForRoleChanges, 5000);
    
    // Also listen for direct events in the same tab
    const handleRoleChanged = (event) => {
      console.log('🔔 roleChanged event received:', event.detail);
      processNotification(event.detail);
    };
    
    // Listen for the custom event
    window.addEventListener('roleChanged', handleRoleChanged);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('roleChanged', handleRoleChanged);
    };
  }, []);

  const handleOpen = () => {
    setHasUnread(false);
    
    // Auto-clear notifications after 2 seconds
    if (notifications.length > 0) {
      setTimeout(() => {
        setNotifications([]);
      }, 2000);
    }
  };

  // For debugging
  console.log('🔔 Rendering NotificationBell with:', {
    notificationCount: notifications.length,
    hasUnread: hasUnread,
    notifications: notifications
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full w-10 h-10 p-0 bg-transparent text-gray-200 hover:bg-[#02284f]/80 hover:text-white"
          onClick={handleOpen}
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2 bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-2 px-2">
          Notifications ({notifications.length})
        </div>
        
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled className="text-gray-500 italic">
            Aucune notification
          </DropdownMenuItem>
        ) : (
          notifications.map((notification, index) => (
            <DropdownMenuItem 
              key={index} 
              className="flex flex-col items-start my-1 p-3 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              <span className="font-medium text-blue-800">{notification.message}</span>
              <span className="text-xs text-gray-500 mt-1">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
