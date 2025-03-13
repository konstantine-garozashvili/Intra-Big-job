import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AttendancePopup from './signature/AttendancePopup';
import { Toaster } from './ui/sonner';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>
      <AttendancePopup />
      <Toaster />
    </div>
  );
};

export default MainLayout;
