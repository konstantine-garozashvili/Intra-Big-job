import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthenticatedLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout; 