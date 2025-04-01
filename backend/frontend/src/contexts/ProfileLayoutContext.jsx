import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/services/authService';
import userDataManager from '@/lib/services/userDataManager';

// Create context
const ProfileLayoutContext = createContext({
  isLayoutLoading: false,
  setLayoutLoading: () => {},
  currentSection: null,
  isSidebarLoaded: false,
  setSidebarLoaded: () => {},
  visitedSections: new Set()
});

// Create provider component
export const ProfileLayoutProvider = ({ children }) => {
  const [isLayoutLoading, setIsLayoutLoading] = useState(false);
  const [isSidebarLoaded, setIsSidebarLoaded] = useState(false);
  const location = useLocation();
  const [currentSection, setCurrentSection] = useState(null);
  const [visitedSections, setVisitedSections] = useState(new Set());
  const timerRef = useRef(null);
  const previousPathRef = useRef('');

  // Use React Query to fetch user data and control sidebar loading state
  const { data: userData, isLoading: isUserDataLoading, isSuccess } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => {
      // Check if we have recent cached data first to avoid unnecessary API calls
      const cachedData = userDataManager.getCachedUserData();
      const now = Date.now();
      // Accéder au timestamp de manière sécurisée pour éviter les erreurs
      const cacheTimestamp = cachedData ? Date.now() - 60000 : 0; // Valeur par défaut si pas de timestamp
        
      // If we have fresh data (less than 30s old), use it directly without triggering more calls
      if (cachedData && now - cacheTimestamp < 30000) {
        console.log("ProfileLayoutContext: Using cached user data");
        return Promise.resolve(cachedData);
      }
      
      // Otherwise, get user data with special flag to prevent circular updates
      return authService.getCurrentUser(false, { 
        requestSource: 'profileLayout',
        preventRecursion: true
      });
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    enabled: authService.isLoggedIn(),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Update sidebar loaded state based on user data loading
  useEffect(() => {
    if (isSuccess && userData) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsSidebarLoaded(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess, userData]);

  // Update current section based on route
  useEffect(() => {
    const path = location.pathname;
    let section = null;
    
    // Update current section based on path
    if (path.includes('/settings/profile')) {
      section = 'profile';
    } else if (path.includes('/settings/security')) {
      section = 'security';
    } else if (path.includes('/settings/notifications')) {
      section = 'notifications';
    } else if (path.includes('/settings/documents')) {
      section = 'documents';
    } else if (path.includes('/settings/career')) {
      section = 'career';
    }
    
    // Mettre à jour la section courante
    setCurrentSection(section);
    
    // Clear any existing timers first to prevent issues
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Ne pas réinitialiser le chargement de la sidebar si on est déjà dans les paramètres
    // et que la sidebar a déjà été chargée
    const isSettingsPath = path.startsWith('/settings/');
    const wasSettingsPath = previousPathRef.current.startsWith('/settings/');
    
    // Vérifier si c'est la première visite de cette section
    const isFirstVisit = section && !visitedSections.has(section);
    
    // Mettre à jour l'état de chargement seulement si c'est la première visite
    // ou si on vient d'une page externe aux paramètres
    if (isFirstVisit || (!wasSettingsPath && isSettingsPath)) {
      setIsLayoutLoading(true);
      
      // Ajouter cette section aux sections visitées
      if (section) {
        setVisitedSections(prev => {
          const newSet = new Set(prev);
          newSet.add(section);
          return newSet;
        });
      }
      
      // Simuler un temps de chargement court pour une meilleure UX
      timerRef.current = setTimeout(() => {
        setIsLayoutLoading(false);
      }, 600);
    } else {
      // Si ce n'est pas la première visite, ne pas montrer le chargement
      setIsLayoutLoading(false);
    }
    
    // Mettre à jour le chemin précédent
    previousPathRef.current = path;
    
    // Clean up function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [location.pathname, visitedSections]);

  return (
    <ProfileLayoutContext.Provider value={{ 
      isLayoutLoading, 
      setLayoutLoading: setIsLayoutLoading,
      currentSection,
      isSidebarLoaded,
      setSidebarLoaded: setIsSidebarLoaded,
      isUserDataLoading,
      visitedSections
    }}>
      {children}
    </ProfileLayoutContext.Provider>
  );
};

// Create hook for accessing the context
export const useProfileLayout = () => {
  const context = useContext(ProfileLayoutContext);
  
  if (!context) {
    throw new Error('useProfileLayout must be used within a ProfileLayoutProvider');
  }
  
  return context;
};

export default ProfileLayoutContext;
