import React, { useEffect, useState, useCallback, createContext, useMemo, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ProfileProgress from '../pages/Global/Profile/components/profile-view/ProfileProgress';
import { RoleGuard, ROLES, useRoles } from '../features/roles';
import { authService } from '../lib/services/authService';
import { profileService } from '../pages/Global/Profile/services/profileService';
import Footer from './Footer';
import ChatButton from './chat/ChatButton';

// Create a context for profile data and refresh function
export const ProfileContext = createContext({
  profileData: null,
  refreshProfileData: () => {},
  isProfileLoading: false
});

// États de chargement
const LOADING_STATES = {
  INITIAL: 'initial',     // État initial avant tout chargement
  MINIMAL: 'minimal',     // Données minimales chargées (depuis le token)
  LOADING: 'loading',     // Chargement des données complètes en cours
  COMPLETE: 'complete',   // Données complètes chargées
  ERROR: 'error'          // Erreur de chargement
};

const MainLayout = () => {
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loadingState, setLoadingState] = useState(LOADING_STATES.INITIAL);
  const [showProgress, setShowProgress] = useState(false);
  const { hasRole, isLoading: rolesLoading } = useRoles();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isLoggedIn());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [minContentHeight, setMinContentHeight] = useState('100vh');
  const [initialRender, setInitialRender] = useState(true);

  // Pages qui doivent être affichées en plein écran sans marges internes
  const fullScreenPages = ['/login', '/register']; 
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

  // Create a memoized refresh function that can be called from child components
  const refreshProfileData = useCallback(async () => {
    if (authService.isLoggedIn()) {
      try {
        setLoadingState(LOADING_STATES.LOADING);
        // Only fetch profile data since we already have basic user data
        const newProfileData = await profileService.getAllProfileData();
        // S'assurer que les données sont bien mises à jour avant de les retourner
        setProfileData(newProfileData);
        setLoadingState(LOADING_STATES.COMPLETE);
        return newProfileData; // Retourner les nouvelles données pour permettre aux composants de les utiliser
      } catch (error) {
        console.error('Error refreshing profile data:', error);
        setLoadingState(LOADING_STATES.ERROR);
        return null;
      }
    }
    return null;
  }, []);

  // Écouter les événements d'authentification
  useEffect(() => {
    // Fonction pour récupérer les données utilisateur initiales
    const fetchInitialUserData = async () => {
      if (authService.isLoggedIn()) {
        try {
          // Essayer de récupérer les données minimales de l'utilisateur depuis le localStorage
          const minimalUser = authService.getUser();
          
          if (minimalUser) {
            // Mettre à jour l'état avec les données minimales
            setUserData(minimalUser);
            setLoadingState(LOADING_STATES.MINIMAL);
            
            // Si les données sont déjà complètes, ne pas les recharger
            if (!minimalUser._minimal) {
              setLoadingState(LOADING_STATES.COMPLETE);
              
              // Charger les données de profil quand même pour s'assurer d'avoir les dernières données
              try {
                const profileData = await profileService.getAllProfileData();
                setProfileData(profileData);
              } catch (profileError) {
                console.warn('Error loading profile data with complete user:', profileError);
              }
            }
          } else {
            // Aucune donnée utilisateur disponible, charger depuis l'API
            setLoadingState(LOADING_STATES.LOADING);
            const userData = await authService.getCurrentUser();
            setUserData(userData);
            setLoadingState(LOADING_STATES.COMPLETE);
          }
          
          // Attendre un court instant avant d'afficher le composant de progression
          setTimeout(() => {
            setShowProgress(true);
          }, 300);
        } catch (error) {
          console.error('Error fetching initial user data:', error);
          setLoadingState(LOADING_STATES.ERROR);
        }
      }
    };

    const handleMinimalDataReady = (event) => {
      // Mise à jour immédiate avec les données minimales du token
      if (event.detail && event.detail.user) {
        setUserData(event.detail.user);
        setLoadingState(LOADING_STATES.MINIMAL);
      }
    };

    const handleUserDataUpdated = (event) => {
      // Mise à jour avec les données complètes du profil
      if (event.detail && event.detail.user) {
        setUserData(event.detail.user);
        setLoadingState(LOADING_STATES.COMPLETE);
        
        // Charger les données de profil complètes
        profileService.getAllProfileData()
          .then(profileData => {
            setProfileData(profileData);
          })
          .catch(error => {
            console.warn('Error loading profile data after update:', error);
          });
      }
    };

    const handleLoginSuccess = () => {
      // Update authentication state immediately
      setIsAuthenticated(true);
    };

    const handleLogoutSuccess = () => {
      // Reset all states
      setIsAuthenticated(false);
      setUserData(null);
      setProfileData(null);
      setLoadingState(LOADING_STATES.INITIAL);
    };
    
    // Vérifier l'état d'authentification et récupérer les données initiales
    setIsAuthenticated(authService.isLoggedIn());
    fetchInitialUserData();

    // Ajouter les écouteurs d'événements
    document.addEventListener('auth:minimal-data-ready', handleMinimalDataReady);
    document.addEventListener('user:data-updated', handleUserDataUpdated);
    window.addEventListener('login-success', handleLoginSuccess);
    window.addEventListener('logout-success', handleLogoutSuccess);

    // Nettoyer les écouteurs d'événements
    return () => {
      document.removeEventListener('auth:minimal-data-ready', handleMinimalDataReady);
      document.removeEventListener('user:data-updated', handleUserDataUpdated);
      window.removeEventListener('login-success', handleLoginSuccess);
      window.removeEventListener('logout-success', handleLogoutSuccess);
    };
  }, [calculateMinHeight]);

  // Create a memoized context value to prevent unnecessary re-renders
  const profileContextValue = useMemo(() => ({
    profileData,
    refreshProfileData,
    isProfileLoading: loadingState === LOADING_STATES.LOADING
  }), [profileData, refreshProfileData, loadingState]);

  // Déterminer si nous devons afficher un état de chargement
  const isLoading = loadingState === LOADING_STATES.INITIAL || loadingState === LOADING_STATES.LOADING;
  const hasMinimalData = loadingState === LOADING_STATES.MINIMAL || loadingState === LOADING_STATES.COMPLETE;

  return (
    <ProfileContext.Provider value={profileContextValue}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Navbar conditionally rendered */}
        {!isFullScreenPage && (
          <Navbar 
            user={userData} 
            isLoading={loadingState !== LOADING_STATES.COMPLETE && isAuthenticated} 
          />
        )}
        
        {/* Main content with minimum height to ensure footer is below viewport */}
        <main 
          className={`flex-grow ${isFullScreenPage ? 'px-0 py-0' : 'container mx-auto px-4 py-8'}`}
          style={{ minHeight: minContentHeight }}
        >
          {/* Passer l'état de chargement au contexte Outlet */}
          <Outlet context={{ 
            userData, 
            profileData, 
            loadingState,
            isLoading,
            hasMinimalData
          }} />
        </main>

        {showProgress && profileData && hasRole(ROLES.GUEST) && (
          <ProfileProgress userData={profileData} />
        )}
        
        {/* Add ChatButton for authenticated users */}
        {isAuthenticated && !isFullScreenPage && <ChatButton />}
        
        {/* Footer */}
        <Footer />
      </div>
    </ProfileContext.Provider>
  );
};

export default MainLayout;
