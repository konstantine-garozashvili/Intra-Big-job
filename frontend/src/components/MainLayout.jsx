import React, { useEffect, useState, useCallback, createContext, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ProfileProgress from '../pages/Global/Profile/components/profile-view/ProfileProgress';
import { RoleGuard, ROLES, useRoles } from '../features/roles';
import { authService } from '../lib/services/authService';
import { profileService } from '../pages/Global/Profile/services/profileService';
import Footer from './Footer';

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

  // Pages qui doivent être affichées en plein écran sans marges internes
  const fullScreenPages = ['/register', '/login'];
  const isFullScreenPage = fullScreenPages.includes(location.pathname);

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
      setIsAuthenticated(true);
      // Rafraîchir les données utilisateur
      fetchUserData();
    };

    const handleLogoutSuccess = () => {
      setIsAuthenticated(false);
      // Réinitialiser les données utilisateur
      setUserData(null);
      setProfileData(null);
    };
    
    // Fonction pour récupérer les données utilisateur
    const fetchUserData = async () => {
      if (authService.isLoggedIn()) {
        try {
          const data = await authService.getCurrentUser();
          setUserData(data);
          
          // After getting basic user data, fetch complete profile data
          const profileData = await profileService.getAllProfileData();
          setProfileData(profileData);
          setIsLoading(false);
          // Attendre un court instant avant d'afficher le composant de progression
          setTimeout(() => setShowProgress(true), 100);
        } catch (error) {
          console.error('Error fetching data:', error);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    // Vérifier l'état d'authentification au montage
    setIsAuthenticated(authService.isLoggedIn());
    
    // Charger les données utilisateur au montage
    fetchUserData();

    // Ajouter les écouteurs d'événements
    window.addEventListener('login-success', handleLoginSuccess);
    window.addEventListener('logout-success', handleLogoutSuccess);
    window.addEventListener('auth-logout-success', handleLogoutSuccess);
    window.addEventListener('query-cache-cleared', handleLogoutSuccess);

    // Nettoyer les écouteurs d'événements
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
      window.removeEventListener('logout-success', handleLogoutSuccess);
      window.removeEventListener('auth-logout-success', handleLogoutSuccess);
      window.removeEventListener('query-cache-cleared', handleLogoutSuccess);
    };
  }, []);

  // Create a memoized context value to prevent unnecessary re-renders
  const profileContextValue = useMemo(() => ({
    profileData,
    refreshProfileData,
    isProfileLoading: isLoading
  }), [profileData, refreshProfileData, isLoading]);

  return (
    <ProfileContext.Provider value={profileContextValue}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Navbar sans transition */}
        <Navbar user={userData} />
        
        <main className={`flex-grow ${isFullScreenPage ? '' : 'container mx-auto px-4 py-8'}`}>
          <Outlet />
        </main>

        {showProgress && profileData && hasRole(ROLES.GUEST) && (
          <ProfileProgress userData={profileData} />
        )}
        
        {/* Spacer div to add more space above footer */}
        <div className="h-8"></div>
        
        {/* Footer sans transition */}
        <Footer />
      </div>
    </ProfileContext.Provider>
  );
};

export default MainLayout;
