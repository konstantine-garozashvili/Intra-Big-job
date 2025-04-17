import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '@/components/PublicNavbar';
import CosmicBackground from '@/components/home/CosmicBackground';
import { usePublicTheme } from '@/contexts/theme/PublicThemeContext';

const PublicLayout = () => {
  const { colorMode } = usePublicTheme();
  
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <CosmicBackground colorMode={colorMode} />
      </div>
      <div className="relative z-10">
        <PublicNavbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PublicLayout; 