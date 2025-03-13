import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Create context
const ProfileLayoutContext = createContext({
  isLayoutLoading: false,
  setLayoutLoading: () => {},
  currentSection: null,
  isSidebarLoaded: false,
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
  const sidebarTimerRef = useRef(null);
  const previousPathRef = useRef('');

  // Effet pour charger la sidebar immédiatement lors du premier rendu
  useEffect(() => {
    // Simuler un temps de chargement plus long pour le skeleton
    // pour s'assurer que toutes les données utilisateur sont chargées
    sidebarTimerRef.current = setTimeout(() => {
      setIsSidebarLoaded(true);
    }, 1800); // Délai augmenté pour permettre le chargement complet des données utilisateur

    return () => {
      if (sidebarTimerRef.current) {
        clearTimeout(sidebarTimerRef.current);
      }
    };
  }, []);

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