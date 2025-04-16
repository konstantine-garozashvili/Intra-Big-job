import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import { notificationService } from "../lib/services/notificationService";

const UserNotification = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [userNotifications, setUserNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // Fetch user notifications
  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getUserNotifications();
      if (response && response.success && response.notifications) {
        setUserNotifications(response.notifications);
        setHasUnreadNotifications(response.notifications.length > 0);
      }
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      // Prevent UI from breaking if there's an error
      setUserNotifications([]);
      setHasUnreadNotifications(false);
    }
  };

  // Handle opening and closing the notification dropdown
  const handleNotificationsOpen = (open) => {
    setShowNotifications(open);
    if (open) {
      // Mark notifications as read after a short delay
      setTimeout(async () => {
        try {
          await notificationService.markNotificationsAsRead();
          setHasUnreadNotifications(false);
        } catch (error) {
          console.error('Error marking notifications as read:', error);
        }
      }, 2000);
    }
  };

  // Fetch notifications on component mount and every minute
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mr-2">
      <DropdownMenu open={showNotifications} onOpenChange={handleNotificationsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative rounded-full w-10 h-10 p-0 bg-transparent text-gray-200 hover:bg-[#02284f]/80 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {hasUnreadNotifications && (
              <span className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 p-4 bg-white shadow-md rounded-lg z-50"
        >
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          {userNotifications.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {userNotifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-default border-b last:border-0">
                  <div className="text-sm font-medium">{notification.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-2">Aucune notification</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserNotification;
