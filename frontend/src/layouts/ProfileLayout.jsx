import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SidebarProfile from '@/pages/Global/Profile/components/SidebarProfile';
import SidebarSkeleton from '@/pages/Global/Profile/components/SidebarSkeleton';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileLayoutProvider, useProfileLayout } from '@/contexts/ProfileLayoutContext';

// Inner component to use context hooks
const ProfileLayoutContent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLayoutLoading, currentSection, isSidebarLoaded, isUserDataLoading, visitedSections } = useProfileLayout();

  // Déterminer si la section a déjà été visitée
  const isSectionVisited = currentSection && visitedSections.has(currentSection);
  
  // Determine if we should show the skeleton or the actual sidebar
  const showSkeleton = isUserDataLoading || !isSidebarLoaded;
  
  // Effet pour fermer le menu mobile lors des changements de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Effet de débogage (sera supprimé en production)
  useEffect(() => {
    console.log('ProfileLayout debug:', { 
      isLayoutLoading, 
      isUserDataLoading, 
      isSidebarLoaded, 
      showSkeleton 
    });
  }, [isLayoutLoading, isUserDataLoading, isSidebarLoaded, showSkeleton]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête mobile avec navigation contextuelle */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Paramètres du profil</h1>
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 rounded-full px-3 py-1 border-[#528eb2]/50 text-[#02284f]"
              >
                <span className="text-sm">Navigation</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[340px]">
              <SheetTitle className="text-lg font-bold mb-4 flex items-center">
                <Settings className="mr-2 h-5 w-5 text-[#528eb2]" />
                Paramètres
              </SheetTitle>
              <div className="py-4">
                <AnimatePresence mode="wait">
                  {showSkeleton ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SidebarSkeleton />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sidebar"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SidebarProfile onNavigate={() => setIsMobileMenuOpen(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Indicateur de section mobile */}
        <div className="mt-2 pb-2 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            {currentSection ? `Section: ${currentSection}` : 'Chargement...'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar - Visible uniquement sur desktop */}
        <div className="hidden lg:block w-[280px] flex-shrink-0">
          <AnimatePresence mode="wait">
            {showSkeleton ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SidebarSkeleton />
              </motion.div>
            ) : (
              <motion.div
                key="sidebar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <SidebarProfile />
              </motion.div>
            )}
          </AnimatePresence>
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