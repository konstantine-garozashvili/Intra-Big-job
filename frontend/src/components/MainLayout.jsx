import React, { useEffect, useState, useCallback, createContext, useMemo, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ProfileProgress from '../pages/Global/Profile/components/profile-view/ProfileProgress';
import { RoleGuard, ROLES, useRoles } from '../features/roles';
import { authService } from '../lib/services/authService';
import { profileService } from '../pages/Global/Profile/services/profileService';
import Footer from './Footer';
import { showGlobalLoader, hideGlobalLoader } from '../lib/utils/loadingUtils';

// Create a context for profile data and refresh function
export const ProfileContext = createContext({
  profileData: null,
  refreshProfileData: () => {},
  isProfileLoading: false
});

const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProgress, setShowProgress] = useState(false);
  const { hasRole } = useRoles();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isLoggedIn());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [minContentHeight, setMinContentHeight] = useState('100vh');
  const [initialRender, setInitialRender] = useState(true);

  // Pages qui doivent être affichées en plein écran sans marges internes
  const fullScreenPages = ['/register', '/login'];
  const isFullScreenPage = fullScreenPages.includes(location.pathname);

  // Function to calculate and set the minimum content height
  const calculateMinHeight = useCallback(() => {
    // Get viewport height
    const viewportHeight = window.innerHeight;
    // Set minimum content height to be viewport height minus navbar height (64px)
    // Add a buffer of 100px to ensure the footer is well below the viewport
    setMinContentHeight(`${viewportHeight - 64 + 200}px`);
  }, []);

  // Effect to calculate the minimum content height
  useEffect(() => {
    // Calculate on mount and window resize
    calculateMinHeight();
    window.addEventListener('resize', calculateMinHeight);
    
    return () => {
      window.removeEventListener('resize', calculateMinHeight);
    };
  }, [calculateMinHeight]);

  // Recalculate height when route changes
  useEffect(() => {
    calculateMinHeight();
    
    // Scroll to top when route changes
    window.scrollTo(0, 0);
  }, [location.pathname, calculateMinHeight]);

  // Effect to handle initial render and ensure footer is positioned correctly
  useEffect(() => {
    if (initialRender) {
      // Set a higher initial height to ensure footer is below viewport during initial load
      setMinContentHeight('150vh');
      
      // After a short delay, calculate the actual height needed
      const timer = setTimeout(() => {
        calculateMinHeight();
        setInitialRender(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [initialRender, calculateMinHeight]);

  // Create a memoized refresh function that can be called from child components
  const refreshProfileData = useCallback(async () => {
    if (authService.isLoggedIn()) {
      try {
        setIsLoading(true);
        // Only fetch profile data since we already have basic user data
        const newProfileData = await profileService.getAllProfileData();
        // S'assurer que les données sont bien mises à jour avant de les retourner
        setProfileData(newProfileData);
        setIsLoading(false);
        return newProfileData; // Retourner les nouvelles données pour permettre aux composants de les utiliser
      } catch (error) {
        console.error('Error refreshing profile data:', error);
        setIsLoading(false);
        return null;
      }
    }
    return null;
  }, []);

  // Écouter les événements d'authentification
  useEffect(() => {
    const handleLoginSuccess = () => {
      // Show global loading immediately
      showGlobalLoader();
      
      // Small delay before updating auth state
      setTimeout(() => {
        setIsAuthenticated(true);
        
        // Delay before fetching user data
        setTimeout(() => {
          // Fetch user data
          fetchUserData();
        }, 200);
      }, 50);
      
      // Recalculate height when authentication state changes
      calculateMinHeight();
    };

    const handleLogoutSuccess = () => {
      // Show loading before any state changes
      showGlobalLoader();
      
      // Add a small delay before changing state
      setTimeout(() => {
        setIsAuthenticated(false);
        // Reset user data
        setUserData(null);
        setProfileData(null);
        
        // Ensure footer is positioned correctly
        setMinContentHeight('150vh');
        calculateMinHeight();
        
        // Keep loading visible for a consistent time
        setTimeout(() => {
          hideGlobalLoader(100);
          
          // Recalculate height after transition completes
          setTimeout(() => calculateMinHeight(), 200);
        }, 400);
      }, 100);
    };
    
    // Fonction pour récupérer les données utilisateur
    const fetchUserData = async (retryCount = 0) => {
      if (authService.isLoggedIn()) {
        try {
          const data = await authService.getCurrentUser();
          if (!data) {
            throw new Error('No user data received');
          }
          setUserData(data);
          
          // After getting basic user data, fetch complete profile data
          const profileData = await profileService.getAllProfileData();
          setProfileData(profileData);
          setIsLoading(false);
          
          // Attendre un court instant avant d'afficher le composant de progression
          setTimeout(() => {
            setShowProgress(true);
            // Remove loading state when everything is loaded
            hideGlobalLoader();
          }, 300);
          
          // Recalculate height after data is loaded
          calculateMinHeight();
        } catch (error) {
          console.error('Error fetching data:', error);
          
          // Retry logic for network errors with exponential backoff
          if (retryCount < 3 && (error.code === 'ECONNABORTED' || error.message.includes('timeout'))) {
            console.log(`Retrying fetch attempt ${retryCount + 1}/3...`);
            const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 8000); // Exponential backoff with max 8s
            setTimeout(() => fetchUserData(retryCount + 1), backoffDelay);
            return;
          }
          
          // Try to use cached data if available
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            try {
              const parsedUser = JSON.parse(cachedUser);
              setUserData(parsedUser);
              setIsLoading(false);
              
              // Even with cached data, try to fetch profile data
              try {
                const profileData = await profileService.getAllProfileData();
                setProfileData(profileData);
              } catch (profileError) {
                console.error('Error fetching profile data with cached user:', profileError);
              }
            } catch (e) {
              // Invalid cached data
              localStorage.removeItem('user');
              setIsLoading(false);
            }
          } else {
            setIsLoading(false);
          }
          
          // Remove loading state on error
          hideGlobalLoader();
        }
      } else {
        setIsLoading(false);
        // Remove loading state if not logged in
        hideGlobalLoader();
      }
    };

    // Vérifier l'état d'authentification au montage
    setIsAuthenticated(authService.isLoggedIn());
    
    // Charger les données utilisateur au montage
    fetchUserData();

    // Handle user-data-loaded event to remove loading class
    const handleUserDataLoaded = () => {
      // Remove loading class after a short delay
      hideGlobalLoader(300);
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('login-success', handleLoginSuccess);
    window.addEventListener('logout-success', handleLogoutSuccess);
    window.addEventListener('auth-logout-success', handleLogoutSuccess);
    window.addEventListener('query-cache-cleared', handleLogoutSuccess);
    window.addEventListener('user-data-loaded', handleUserDataLoaded);

    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
      window.removeEventListener('logout-success', handleLogoutSuccess);
      window.removeEventListener('auth-logout-success', handleLogoutSuccess);
      window.removeEventListener('query-cache-cleared', handleLogoutSuccess);
      window.removeEventListener('user-data-loaded', handleUserDataLoaded);
    };
  }, [calculateMinHeight]);

  // Create a memoized context value to prevent unnecessary re-renders
  const profileContextValue = useMemo(() => ({
    profileData,
    refreshProfileData,
    isProfileLoading: isLoading
  }), [profileData, refreshProfileData, isLoading]);

  // Immediately hide scrollbars when component mounts
  useLayoutEffect(() => {
    // Apply Chrome-specific scrollbar hiding
    document.documentElement.style.setProperty('--webkit-scrollbar-width', '0px');
    document.documentElement.style.setProperty('--webkit-scrollbar-display', 'none');

    // Force Chrome to re-evaluate its scrollbar display
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
        background: transparent !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      // Cleanup if necessary
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, []);

  return (
    <ProfileContext.Provider value={profileContextValue}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Navbar sans transition */}
        <Navbar user={userData} />
        
        {/* Main content with minimum height to ensure footer is below viewport */}
        <main 
          className={`flex-grow ${isFullScreenPage ? '' : 'container mx-auto px-4 py-8'}`}
          style={{ minHeight: isFullScreenPage ? 'auto' : minContentHeight }}
        >
          <Outlet />
        </main>

        {showProgress && profileData && hasRole(ROLES.GUEST) && (
          <ProfileProgress userData={profileData} />
        )}
        
        {/* Footer sans transition */}
        <Footer />
      </div>
    </ProfileContext.Provider>
  );
};

export default MainLayout;
