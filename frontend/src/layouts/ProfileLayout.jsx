import React from 'react';
import { Outlet } from 'react-router-dom';

const ProfileLayout = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex-1 bg-white shadow-sm rounded-lg p-4 sm:p-6 min-h-[calc(100vh-8rem)]">
        <Outlet />
      </div>
    </div>
  );
};
  
export default ProfileLayout; 