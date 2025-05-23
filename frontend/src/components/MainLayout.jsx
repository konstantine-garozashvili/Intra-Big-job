import React, { useEffect, useState, useCallback, createContext, useMemo, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import Navbar from './Navbar';
import ProfileProgress from '../pages/Global/Profile/components/profile-view/ProfileProgress';
import { RoleGuard, ROLES, useRoles } from '../features/roles';
import { authService } from '../lib/services/authService';
import { profileService } from '../pages/Global/Profile/services/profileService';
import Footer from './Footer';
import ChatButton from './chat/ChatButton';
import { Button } from './ui/button';
import { useProtectedTheme } from '../contexts/ProtectedThemeContext';
import SlidingChat from "./chat/SlidingChat";

// Create a context for profile data and refresh function
export const ProfileContext = createContext({
  profileData: null,
  refreshProfileData: () => {},
  isProfileLoading: false
});

// Confetti animation component using canvas for full layout animation
const LayoutConfetti = ({ isActive }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particles = useRef([]);

  // Clear the canvas completely
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const createParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    // Fewer particles for a more elegant look
    const particleCount = 80; 
    // More muted, elegant colors
    const colors = ['#FFD700', '#FF69B4', '#1E90FF', '#20B2AA', '#9370DB', '#FF7F50']; 
    
    particles.current = [];

    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        // Larger particles for better visibility
        size: Math.random() * 8 + 3, 
        velocity: {
          // Slower horizontal movement
          x: Math.random() * 3 - 1.5, 
          // Slower vertical movement for a gentle fall
          y: Math.random() * 2 + 1.5  
        },
        rotation: Math.random() * 360,
        // Slower rotation
        rotationSpeed: Math.random() * 4 - 2, 
        // Add some variety to particle shapes
        shape: Math.random() > 0.7 ? 'circle' : 'square',
        // Add a little transparency for elegance
        opacity: Math.random() * 0.4 + 0.6 
      });
    }
  }, []);

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.current.forEach(particle => {
      ctx.save();
      
      ctx.globalAlpha = particle.opacity;
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      
      ctx.fillStyle = particle.color;
      
      // Draw different shapes based on the particle type
      if (particle.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      }
      
      ctx.restore();
      
      // Update particle position for next frame - slower movement
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.rotation += particle.rotationSpeed;
      
      // Reset particles that fall below canvas
      if (particle.y > canvas.height) {
        particle.y = -particle.size;
        particle.x = Math.random() * canvas.width;
      }
      
      // Reset particles that go outside horizontal bounds
      if (particle.x < -particle.size || particle.x > canvas.width + particle.size) {
        particle.x = Math.random() * canvas.width;
      }
    });
    
    if (isActive) {
      animationRef.current = requestAnimationFrame(drawParticles);
    }
  }, [isActive]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Make canvas full window size for layout-wide animation
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Recreate particles after resize
      if (isActive) {
        createParticles();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    setTimeout(handleResize, 0);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [createParticles, isActive]);
  
  // Start or stop animation
  useEffect(() => {
    if (isActive) {
      // Start animation
      createParticles();
      animationRef.current = requestAnimationFrame(drawParticles);
    } else {
      // Stop animation and clear canvas
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Clear canvas completely
      clearCanvas();
      
      // Clear particles array
      particles.current = [];
    }
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      clearCanvas();
    };
  }, [isActive, createParticles, drawParticles, clearCanvas]);

  // If not active, don't render anything
  if (!isActive) {
    return null;
  }

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 100
      }}
    />
  );
};

// Congratulations modal component
const CongratulationsModal = ({ isOpen, onClose }) => {
  // Debug: log when modal state changes
  React.useEffect(() => {
  }, [isOpen]);

  // Return null early if not open - but log it
  if (!isOpen) {
    return null;
  }
  
  
  const handleClose = () => {
    // Call the onClose function which will handle acknowledgment
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 200,
              duration: 0.8
            }}
            className="relative w-full max-w-[85vw] sm:max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden z-[61]"
          >
            <div className="relative p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <div className="relative z-10 w-full">
                <div className="mb-4 sm:mb-6 bg-blue-100 dark:bg-blue-900/30 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto">
                  <PartyPopper className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-600 dark:text-blue-400" />
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-gray-800 dark:text-gray-100">
                  Félicitations !
                </h2>
                
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 md:mb-8 mx-auto max-w-xs sm:max-w-sm">
                  Votre profil est maintenant complet ! Vous êtes prêt à vous connecter avec des recruteurs potentiels et à profiter pleinement de toutes les fonctionnalités.
                </p>
                
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm sm:text-base"
                  onClick={handleClose}
                >
                  Continuer
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

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
  const [minContentHeight, setMinContentHeight] = useState('100vh');
  const [initialRender, setInitialRender] = useState(true);
  const [isShowingConfetti, setIsShowingConfetti] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const { theme, isDark } = useProtectedTheme();

  // Reset loading state when user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingState(LOADING_STATES.INITIAL);
      setUserData(null);
      setProfileData(null);
    }
  }, [isAuthenticated]);

  // Pages qui doivent être affichées en plein écran sans marges internes
  const fullScreenPages = []; // Removed '/register'
  const isFullScreenPage = fullScreenPages.includes(location.pathname);

  // Function to calculate and set the minimum content height
  const calculateMinHeight = useCallback(() => {
    // Get viewport height
    const viewportHeight = window.innerHeight;
    // Set minimum content height to be viewport height minus navbar height (64px)
    // Add a buffer of 100px to ensure the footer is well below the viewport
    setMinContentHeight(`${viewportHeight - 64 + 200}px`);
  }, []);

  // Create a memoized refresh function that can be called from child components
  const refreshProfileData = useCallback(async (options = {}) => {
    if (authService.isLoggedIn()) {
      try {
        setLoadingState(LOADING_STATES.LOADING);
        // Fetch profile data, forcing a refresh to bypass cache
        const newProfileData = await profileService.getAllProfileData({ 
          forceRefresh: options.forceRefresh || true,
          preventImmediateRefresh: options.preventImmediateRefresh || false 
        });
        // S'assurer que les données sont bien mises à jour avant de les retourner
        setProfileData(newProfileData);
        setLoadingState(LOADING_STATES.COMPLETE);
        return newProfileData; // Retourner les nouvelles données pour permettre aux composants de les utiliser
      } catch (error) {
        // Silently handle error
        setLoadingState(LOADING_STATES.ERROR);
        return null;
      }
    }
    return null;
  }, []);

  // Listen for profile completion event - improved version
  useEffect(() => {
    let isMounted = true;
    async function handleProfileCompletion(event) {
      // Toujours forcer le refresh et utiliser la valeur retournée
      const newProfileData = await refreshProfileData({ forceRefresh: true });
      const latestIsAcknowledged = !!(newProfileData && newProfileData.stats && newProfileData.stats.profile && newProfileData.stats.profile.isAcknowledged);
      if (isShowingConfetti || showCongratulations) return;
      if (latestIsAcknowledged) {
        // Ne rien faire si acknowledged
        return;
      }
      if (isMounted) {
        setIsShowingConfetti(true);
        setTimeout(() => setShowCongratulations(true), 800);
      }
    }
    document.addEventListener('profile:completion', handleProfileCompletion);
    return () => {
      isMounted = false;
      document.removeEventListener('profile:completion', handleProfileCompletion);
    };
  }, [isShowingConfetti, showCongratulations, refreshProfileData]);

  // Properly handle closing the modal - now defined AFTER refreshProfileData
  const handleCloseCongratulations = useCallback(() => {
    setIsShowingConfetti(false);
    setShowCongratulations(false);
    // Do not set any localStorage keys here. Only rely on backend acknowledgment.
    profileService.acknowledgeProfileCompletion()
      .then(() => {
        // Always force refresh after acknowledgment
        return refreshProfileData({ forceRefresh: true });
      })
      .catch(err => {
        console.error('Failed to acknowledge profile completion from modal:', err);
      });
  }, [refreshProfileData]);

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

  // Écouter les événements d'authentification
  useEffect(() => {
    // Fonction pour récupérer les données utilisateur initiales
    const fetchInitialUserData = async () => {
      if (authService.isLoggedIn()) {
        try {
          const minimalUser = authService.getUser();
          if (minimalUser) {
            setUserData(minimalUser);
            setLoadingState(LOADING_STATES.MINIMAL);
            if (!minimalUser._minimal) {
              setLoadingState(LOADING_STATES.COMPLETE);
              try {
                // OPTIMISATION : fetch profil et stats en parallèle
                const [initialProfileData, stats] = await Promise.all([
                  profileService.getAllProfileData({ forceRefresh: false }),
                  profileService.getStats({ forceRefresh: false })
                ]);
                // Fusionner les stats dans le profileData pour rendre isAcknowledged disponible plus vite
                if (stats && stats.stats) {
                  initialProfileData.stats = stats.stats;
                }
                setProfileData(initialProfileData);
                // Refresh différé (9s) toujours en parallèle
                setTimeout(async () => {
                  const [refreshedProfileData, refreshedStats] = await Promise.all([
                    profileService.getAllProfileData({ forceRefresh: true }),
                    profileService.getStats({ forceRefresh: true })
                  ]);
                  if (refreshedStats && refreshedStats.stats) {
                    refreshedProfileData.stats = refreshedStats.stats;
                  }
                  setProfileData(refreshedProfileData);
                }, 9000);
              } catch (profileError) {
                // Silently handle profile loading error
              }
            }
          } else {
            setLoadingState(LOADING_STATES.LOADING);
            const userData = await authService.getCurrentUser();
            setUserData(userData);
            setLoadingState(LOADING_STATES.COMPLETE);
          }
          setTimeout(() => {
            setShowProgress(true);
          }, 300);
        } catch (error) {
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
        // We might already have complete data from the event, so reflect that possibility.
        // However, we will rely on the refreshProfileData triggered elsewhere 
        // (e.g., by ProfileProgress) to fetch and set the definitive full profileData state.
        // Avoid setting loading state directly to COMPLETE here unless absolutely certain,
        // as the context refresh might still be in progress.
        // Consider if setLoadingState(LOADING_STATES.COMPLETE) is safe here or should be removed.
        // For now, let's assume minimal user data update is the primary goal here.
        
        // REMOVED: Do not fetch profile data here again, rely on refreshProfileData from context.
        // profileService.getAllProfileData()
        //   .then(profileData => {
        //     setProfileData(profileData);
        //     // Potentially set loading state complete *after* profile data is confirmed set.
        //     setLoadingState(LOADING_STATES.COMPLETE); 
        //   })
        //   .catch(error => {
        //     console.warn('Error loading profile data after update:', error);
        //     // Handle error appropriately, maybe revert loading state or show error message
        //   });
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
      <div className={`flex flex-col min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        {/* Only show Navbar for authenticated users */}
        {isAuthenticated && <Navbar />}
        
        {/* Congratulations Modal : n'afficher que si le profil est chargé ET acknowledged à false */}
        <CongratulationsModal 
          isOpen={showCongratulations && profileData && profileData.stats && profileData.stats.profile && !profileData.stats.profile.isAcknowledged} 
          onClose={handleCloseCongratulations} 
        />
        
        {/* Main content avec gestion améliorée de l'espace */}
        <main 
          className={`flex-grow transition-colors duration-300 ${
            isFullScreenPage 
              ? 'px-0 py-0' 
              : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full'
          } ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
          style={{ 
            minHeight: minContentHeight,
            maxWidth: isFullScreenPage ? '100%' : undefined
          }}
        >
          {/* Passer l'état de chargement au contexte Outlet */}
          <div className="w-full max-w-[2000px] mx-auto">
            <Outlet context={{ 
              userData, 
              profileData, 
              loadingState,
              isLoading,
              hasMinimalData,
              theme,
              isDark: theme === 'dark'
            }} />
          </div>
        </main>

        {/* Confetti animation */}
        <LayoutConfetti isActive={isShowingConfetti} />
        <SlidingChat />
      </div>
    </ProfileContext.Provider>
  );
};

export default MainLayout;
