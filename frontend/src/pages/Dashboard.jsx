import React, { useMemo, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useOptimizedProfile } from '../hooks/useOptimizedProfile';
import { motion } from 'framer-motion';
import apiService from '@/lib/services/apiService';
import { useUserData } from '../hooks/useDashboardQueries';
import axios from 'axios';
/**
 * Composant Tableau de bord affiché comme page d'accueil pour les utilisateurs connectés
 * avec un message de bienvenue personnalisé selon le rôle
 */
const Dashboard = () => {
  // État local pour suivre si nous avons affiché les données de secours
  const [hasShownFallback, setHasShownFallback] = useState(false);
  // Track if we need full data or minimal data
  const [needsFullData, setNeedsFullData] = useState(false);
  
  // Preload profile data when dashboard mounts
  useEffect(() => {
    // Preload profile data in the background to warm up the cache
    // Use minimal data by default to save memory
    apiService.preloadProfileData({ minimal: true });
    
    // Clean up function to help with memory management
    return () => {
      // Clear any unnecessary data when unmounting
      if (window._dashboardCleanupTimeout) {
        clearTimeout(window._dashboardCleanupTimeout);
      }
    };
  }, []);
  
  // Utiliser le hook optimisé pour récupérer les données utilisateur
  const { 
    data: user, 
    error, 
    isLoading, 
    refetch 
  } = useOptimizedProfile({
    // Use shorter staleTime for dashboard to ensure fresh data
    staleTime: 20000, // 20 seconds
    // Enable refetch on mount for dashboard to ensure fresh data
    refetchOnMount: true,
    // Use minimal data by default to save memory
    fullData: needsFullData
  });
  
  // Forcer un refetch au montage du composant, mais seulement si nécessaire
  useEffect(() => {
    // Check if we already have user data before forcing a refetch
    if (!user && !isLoading) {
      // Use a shorter timeout to improve perceived performance
      const timer = setTimeout(() => {
        refetch().catch(err => {
          console.error("Error refreshing dashboard data:", err);
        });
      }, 20); // Reduced from 50ms to 20ms for faster response
      
      return () => clearTimeout(timer);
    }
  }, [refetch, user, isLoading]);
  
  // Only load full data when needed (e.g., when user interacts with profile)
  const loadFullProfileData = () => {
    if (!needsFullData) {
      setNeedsFullData(true);
      // Refetch with full data
      setTimeout(() => refetch(), 0);
    }
  };
  
  // Memory optimization: clean up unused resources when idle
  useEffect(() => {
    // Set up a timer to clean up resources after inactivity
    const setupCleanupTimer = () => {
      if (window._dashboardCleanupTimeout) {
        clearTimeout(window._dashboardCleanupTimeout);
      }
      
      window._dashboardCleanupTimeout = setTimeout(() => {
        // Clear any unnecessary caches after 5 minutes of inactivity
        if (!document.hasFocus()) {
          apiService.clearMemoryCache();
        }
      }, 5 * 60 * 1000); // 5 minutes
    };
    
    // Set up initial timer
    setupCleanupTimer();
    
    // Reset timer on user interaction
    const resetTimer = () => setupCleanupTimer();
    window.addEventListener('click', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('mousemove', resetTimer);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('mousemove', resetTimer);
      if (window._dashboardCleanupTimeout) {
        clearTimeout(window._dashboardCleanupTimeout);
      }
    };
  }, []);
  
  // Marquer quand nous avons affiché les données de secours
  useEffect(() => {
    if (user && !hasShownFallback) {
      setHasShownFallback(true);
    }
  }, [user, hasShownFallback]);
  
  // Aussi essayer de récupérer les données du localStorage comme filet de sécurité
  const fallbackUser = useMemo(() => {
    if (user) return null; // Ne pas calculer si nous avons déjà des données
    
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  }, [user]);
  
  // Utiliser soit les données de l'API, soit les données de fallback
  const displayUser = user || fallbackUser;
  
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const welcomeMessage = useMemo(() => {
    if (!displayUser) return '';
    
    // Extraire le rôle correctement
    let role = '';
    if (displayUser.roles) {
      if (Array.isArray(displayUser.roles) && displayUser.roles.length > 0) {
        role = displayUser.roles[0].replace('ROLE_', '');
      } else if (typeof displayUser.roles === 'string') {
        role = displayUser.roles.replace('ROLE_', '');
      }
    }
    
    return `Bienvenue ${displayUser.firstName || ''} ${displayUser.lastName || ''} - ${role}`;
  }, [displayUser]);
  
  // Si pas de données du tout, essayer de forcer un rechargement
  useEffect(() => {
    if (!displayUser && !isLoading) {
      const reloadTimer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return () => clearTimeout(reloadTimer);
    }
  }, [displayUser, isLoading]);

  return (
    <DashboardLayout error={error?.message} isLoading={isLoading && !displayUser}>
      {displayUser ? (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            {welcomeMessage}
          </h1>
        </motion.div>
      ) : !isLoading ? (
        <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
          Problème de chargement des données utilisateur. 
          <button 
            onClick={() => refetch()} 
            className="ml-2 text-blue-600 underline"
          >
            Réessayer
          </button>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default React.memo(Dashboard);
