import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AttendancePopup from './signature/AttendancePopup';
import { Toaster } from './ui/sonner';
import ChatButton from './chat/ChatButton';
import { authService } from '../lib/services/authService';

const MainLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    setIsAuthenticated(authService.isLoggedIn());
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>
      <AttendancePopup />
      {isAuthenticated && <ChatButton />}
      <Toaster />
    </div>
  );
};

export default MainLayout;
