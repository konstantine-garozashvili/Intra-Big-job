import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarProfile from '@/pages/Global/Profile/components/SidebarProfile';
import SidebarSkeleton from '@/pages/Global/Profile/components/SidebarSkeleton';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileLayoutProvider, useProfileLayout } from '@/context/ProfileLayoutContext';

// Inner component to use context hooks
const ProfileLayoutContent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isLayoutLoading, currentSection, isSidebarLoaded, visitedSections } = useProfileLayout();

  // Déterminer si la section a déjà été visitée
  const isSectionVisited = currentSection && visitedSections.has(currentSection);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile Menu Button */}
      <div className="lg:hidden mb-4">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[340px]">
            <SheetTitle className="text-lg font-bold mb-4">Navigation</SheetTitle>
            <div className="py-4">
              {!isSidebarLoaded ? (
                <SidebarSkeleton />
              ) : (
                <SidebarProfile onNavigate={() => setIsMobileMenuOpen(false)} />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[280px] flex-shrink-0">
          {!isSidebarLoaded ? (
            <SidebarSkeleton />
          ) : (
            <SidebarProfile />
          )}
        </div>

        {/* Main Content - Animation simplifiée pour éviter le double effet */}
        <div className="flex-1 bg-white shadow-sm rounded-lg p-4 sm:p-6 min-h-[calc(100vh-8rem)]">
          {isLayoutLoading && currentSection ? (
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper component to provide context
const ProfileLayout = () => {
  return (
    <ProfileLayoutProvider>
      <ProfileLayoutContent />
    </ProfileLayoutProvider>
  );
};
  
export default ProfileLayout; 