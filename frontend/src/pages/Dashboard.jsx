import React, { useMemo, useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useOptimizedProfile } from '../hooks/useOptimizedProfile';
import { motion } from 'framer-motion';
import apiService from '@/lib/services/apiService';
import { usePerformanceOptimized } from '../hooks/usePerformanceOptimized';

/**
 * Composant Tableau de bord affiché comme page d'accueil pour les utilisateurs connectés
 * avec un message de bienvenue personnalisé selon le rôle
 */
const Dashboard = () => {
  // État local pour suivre si nous avons affiché les données de secours
  const [hasShownFallback, setHasShownFallback] = useState(false);
  // Track if we need full data or minimal data
  const [needsFullData, setNeedsFullData] = useState(false);
  // Track retry attempts
  const [retryCount, setRetryCount] = useState(0);
  // Track UI enhancement level
  const [enhancementLevel, setEnhancementLevel] = useState('minimal');
  // Track if animations should be enabled
  const [enableAnimations, setEnableAnimations] = useState(false);
  
  // Use performance optimized utilities
  const {
    setTimeout,
    delay,
    isSlowDevice,
    getDeviceType,
    createProgressiveStrategy,
    metrics,
    PerformanceDebugPanel,
    startMeasure,
    endMeasure
  } = usePerformanceOptimized({
    componentName: 'Dashboard',
    enableMonitoring: true
  });
  
  // Device information for optimizations
  const deviceInfo = useMemo(() => ({
    isSlowDevice: isSlowDevice(),
    deviceType: getDeviceType(),
    metrics: metrics.adaptiveTimeouts
  }), [isSlowDevice, getDeviceType, metrics.adaptiveTimeouts]);
  
  // Start measuring dashboard load time
  useEffect(() => {
    startMeasure('dashboard_load');
    return () => endMeasure('dashboard_load');
  }, [startMeasure, endMeasure]);
  
  // Preload profile data when dashboard mounts
  useEffect(() => {
    // Preload profile data in the background to warm up the cache
    // Use minimal data by default to save memory
    apiService.preloadProfileData({ 
      minimal: true,
      // For slow devices, reduce preload scope
      reducedScope: deviceInfo.isSlowDevice
    });
    
    // Clean up function to help with memory management
    return () => {
      // Clear any unnecessary data when unmounting
      if (window._dashboardCleanupTimeout) {
        clearTimeout(window._dashboardCleanupTimeout);
      }
    };
  }, [deviceInfo.isSlowDevice]);
  
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
    fullData: needsFullData,
    // For slow devices, use more aggressive caching
    cacheTime: deviceInfo.isSlowDevice ? 10 * 60 * 1000 : 5 * 60 * 1000
  });
  
  // Set up progressive enhancement strategy
  const progressiveStrategy = useMemo(() => {
    return createProgressiveStrategy({
      // Minimal UI - fast initial load with basic content
      minimal: () => {
        startMeasure('minimal_ui_render');
        setEnhancementLevel('minimal');
        setEnableAnimations(false);
        endMeasure('minimal_ui_render');
      },
      // Standard UI - add more content and basic animations
      standard: () => {
        startMeasure('standard_ui_render');
        setEnhancementLevel('standard');
        setEnableAnimations(true);
        endMeasure('standard_ui_render');
      },
      // Enhanced UI - add all features and full animations
      enhanced: () => {
        startMeasure('enhanced_ui_render');
        setEnhancementLevel('enhanced');
        // Only load full data if we're at enhanced level
        if (!needsFullData) {
          setNeedsFullData(true);
          delay(0).then(() => refetch());
        }
        endMeasure('enhanced_ui_render');
      },
      // Delays adjusted based on device performance
      standardDelay: deviceInfo.isSlowDevice ? 300 : 100,
      enhancedDelay: deviceInfo.isSlowDevice ? 1500 : 500
    });
  }, [createProgressiveStrategy, deviceInfo.isSlowDevice, needsFullData, delay, refetch, startMeasure, endMeasure]);
  
  // Apply progressive enhancement
  useEffect(() => {
    // Start with minimal UI
    progressiveStrategy.initial();
    
    // Upgrade to standard UI after a short delay
    const standardCleanup = progressiveStrategy.upgradeToStandard();
    
    // Upgrade to enhanced UI after a longer delay
    const enhancedCleanup = progressiveStrategy.upgradeToEnhanced((success) => {
      if (!success) {
        console.log('Skipped enhanced UI due to device limitations');
      }
    });
    
    return () => {
      standardCleanup();
      enhancedCleanup();
    };
  }, [progressiveStrategy]);
  
  // Forcer un refetch au montage du composant, mais seulement si nécessaire
  useEffect(() => {
    // Check if we already have user data before forcing a refetch
    if (!user && !isLoading) {
      console.log("Dashboard mounted, no user data available, forcing data refresh");
      // Use adaptive timeout for better performance across devices
      const clearTimer = setTimeout(() => {
        startMeasure('dashboard_refetch');
        refetch().catch(err => {
          console.error("Error refreshing dashboard data:", err);
        }).finally(() => {
          endMeasure('dashboard_refetch');
        });
      }, 20, { prioritizeSpeed: true }); // Adaptive timeout based on 20ms base duration
      
      return clearTimer;
    } else {
      console.log("Dashboard mounted, user data already available, skipping refetch");
    }
  }, [refetch, user, isLoading, setTimeout, startMeasure, endMeasure]);
  
  // Only load full data when needed (e.g., when user interacts with profile)
  const loadFullProfileData = () => {
    if (!needsFullData) {
      setNeedsFullData(true);
      // Refetch with full data using adaptive delay
      delay(0).then(() => {
        startMeasure('load_full_profile');
        refetch().finally(() => {
          endMeasure('load_full_profile');
        });
      });
    }
  };
  
  // Memory optimization: clean up unused resources when idle
  useEffect(() => {
    // Set up a timer to clean up resources after inactivity
    const setupCleanupTimer = () => {
      if (window._dashboardCleanupTimeout) {
        clearTimeout(window._dashboardCleanupTimeout);
      }
      
      // Use adaptive timeout for cleanup
      const clearTimer = setTimeout(() => {
        // Clear any unnecessary caches after 5 minutes of inactivity
        if (!document.hasFocus()) {
          console.log("Dashboard inactive, cleaning up resources");
          apiService.clearMemoryCache();
        }
      }, 5 * 60 * 1000, { prioritizeSpeed: false }); // 5 minutes with adaptive adjustment
      
      window._dashboardCleanupTimeout = clearTimer;
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
  }, [setTimeout]);
  
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
      console.log("Dashboard fallback: localStorage check", !!storedUser);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing localStorage user:", e);
      return null;
    }
  }, [user]);
  
  // Utiliser soit les données de l'API, soit les données de fallback
  const displayUser = user || fallbackUser;
  
  // Debugging - log complet des données disponibles
  useEffect(() => {
    console.log("Dashboard component state:", {
      user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, roles: user.roles } : null,
      fallbackUser: fallbackUser ? { id: fallbackUser.id, firstName: fallbackUser.firstName, roles: fallbackUser.roles } : null,
      displayUser: displayUser ? { id: displayUser.id, firstName: displayUser.firstName, roles: displayUser.roles } : null,
      isLoading,
      error: error?.message,
      performanceMetrics: metrics,
      deviceInfo,
      enhancementLevel
    });
    
    if (displayUser) {
      // Tentative de mise à jour localStorage si nécessaire
      try {
        localStorage.setItem('user', JSON.stringify(displayUser));
      } catch (e) {
        console.error("Error updating localStorage user:", e);
      }
    }
  }, [user, fallbackUser, displayUser, isLoading, error, metrics, deviceInfo, enhancementLevel]);
  
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
    if (!displayUser && !isLoading && retryCount < 2) {
      console.log("No display user data, forcing reload");
      // Use adaptive timeout for reload with increasing delay based on retry count
      const reloadTimer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        startMeasure('dashboard_reload');
        refetch().catch(() => {
          // If we've tried twice and still no data, reload the page
          if (retryCount >= 1) {
            window.location.reload();
          }
        }).finally(() => {
          endMeasure('dashboard_reload');
        });
      }, 1000 * (retryCount + 1), { prioritizeSpeed: false }); // Adaptive timeout with increasing delay
      
      return () => clearTimeout(reloadTimer);
    }
  }, [displayUser, isLoading, setTimeout, retryCount, refetch, startMeasure, endMeasure]);

  // Render minimal skeleton loader during loading state
  const MinimalSkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-8 w-1/2 mb-4 rounded"></div>
    </div>
  );

  // Render standard skeleton loader with more details
  const StandardSkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-10 w-3/4 mb-8 rounded"></div>
      <div className="bg-gray-200 h-4 w-1/2 mb-2 rounded"></div>
      <div className="bg-gray-200 h-4 w-2/3 mb-2 rounded"></div>
    </div>
  );

  // Enhanced skeleton loader with full details
  const EnhancedSkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-10 w-3/4 mb-8 rounded"></div>
      <div className="bg-gray-200 h-4 w-1/2 mb-2 rounded"></div>
      <div className="bg-gray-200 h-4 w-2/3 mb-2 rounded"></div>
      <div className="bg-gray-200 h-4 w-1/3 mb-4 rounded"></div>
      <div className="flex space-x-4">
        <div className="bg-gray-200 h-20 w-20 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
          <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
        </div>
      </div>
    </div>
  );

  // Select the appropriate skeleton loader based on enhancement level
  const SkeletonLoader = () => {
    switch (enhancementLevel) {
      case 'enhanced':
        return <EnhancedSkeletonLoader />;
      case 'standard':
        return <StandardSkeletonLoader />;
      default:
        return <MinimalSkeletonLoader />;
    }
  };

  // Enhanced error component with retry functionality
  const ErrorDisplay = ({ message, onRetry }) => (
    <motion.div 
      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: enableAnimations ? 0.3 : 0 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            {message || "Problème de chargement des données utilisateur."}
          </p>
          <div className="mt-2">
            <button 
              onClick={onRetry} 
              className="text-sm font-medium text-yellow-700 hover:text-yellow-600 underline focus:outline-none"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render minimal content for slow devices
  const MinimalContent = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <h1 className="text-xl font-semibold text-gray-800">
        {welcomeMessage}
      </h1>
    </div>
  );

  // Render standard content with some enhancements
  const StandardContent = () => (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {welcomeMessage}
      </h1>
      {enhancementLevel === 'standard' && (
        <p className="text-gray-600">
          Bienvenue sur votre tableau de bord.
        </p>
      )}
    </div>
  );

  // Render enhanced content with full features
  const EnhancedContent = () => (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: enableAnimations ? 0.3 : 0 }}
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {welcomeMessage}
      </h1>
      <p className="text-gray-600 mb-4">
        Bienvenue sur votre tableau de bord. Toutes les fonctionnalités sont disponibles.
      </p>
      {/* Additional enhanced content would go here */}
    </motion.div>
  );

  // Select the appropriate content based on enhancement level
  const renderContent = () => {
    if (!displayUser) return null;
    
    switch (enhancementLevel) {
      case 'enhanced':
        return <EnhancedContent />;
      case 'standard':
        return <StandardContent />;
      default:
        return <MinimalContent />;
    }
  };

  return (
    <DashboardLayout error={error?.message} isLoading={isLoading && !displayUser}>
      {/* Performance debug panel in development mode */}
      <PerformanceDebugPanel />
      
      {displayUser ? (
        renderContent()
      ) : isLoading ? (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: enableAnimations ? 0.3 : 0 }}
        >
          <SkeletonLoader />
        </motion.div>
      ) : (
        <ErrorDisplay 
          message={error?.message} 
          onRetry={() => {
            setRetryCount(prev => prev + 1);
            startMeasure('error_retry');
            refetch().finally(() => {
              endMeasure('error_retry');
            });
          }} 
        />
      )}
    </DashboardLayout>
  );
};

// Utiliser React.memo pour éviter les re-rendus inutiles
export default React.memo(Dashboard);
