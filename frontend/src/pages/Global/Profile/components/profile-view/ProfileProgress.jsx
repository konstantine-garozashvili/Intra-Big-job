import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { CheckCircle2, XCircle, InfoIcon, ExternalLinkIcon, PieChart, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ProfileContext } from "@/components/MainLayout";
import profileService from "../../services/profileService";

const ProfileProgress = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { refreshProfileData, isProfileLoading, profileData } = useContext(ProfileContext);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousCompletionRef = useRef(0);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [localAcknowledged, setLocalAcknowledged] = useState(false);
  const [hasDispatchedEvent, setHasDispatchedEvent] = useState(false);

  // Add event listeners for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      refreshProfileData();
    };

    document.addEventListener('user:data-updated', handleProfileUpdate);
    
    return () => {
      document.removeEventListener('user:data-updated', handleProfileUpdate);
    };
  }, [refreshProfileData]);

  // Initialize the acknowledged state from profile data and localStorage
  useEffect(() => {
    // First check localStorage for persistent storage
    try {
      const localStorageAck = localStorage.getItem('profile_completion_acknowledged');
      if (localStorageAck === 'true') {
        setLocalAcknowledged(true);
        setIsProfileComplete(true);
        return;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Then check from the profile data
    if (profileData?.stats?.profile?.isAcknowledged) {
      setLocalAcknowledged(true);
      setIsProfileComplete(true);
      
      // Also store in localStorage for persistence
      try {
        localStorage.setItem('profile_completion_acknowledged', 'true');
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [profileData]);

  // Function to refresh data with cache busting
  const forceFreshProfileData = async () => {
    try {
      console.log('Forcing fresh profile data...');
      
      // First check for existing acknowledgment
      const isAlreadyAcknowledged = localStorage.getItem('profile_completion_acknowledged') === 'true';
      const recentlyAcknowledged = (() => {
        try {
          const lastShownAt = parseInt(localStorage.getItem('profile_completion_acknowledged_at') || '0', 10);
          return Date.now() - lastShownAt < 10000; // 10 seconds
        } catch (e) {
          return false;
        }
      })();
      
      const currentlyShowing = localStorage.getItem('profile_completion_showing') === 'true';
      
      // First check what the current completion status is
      const before = profileData?.stats?.profile || { completedItems: 0 };
      console.log('Profile status before refresh:', before);
      
      // First refresh the profile data
      const newData = await refreshProfileData({ forceRefresh: true });
      console.log('Profile data refreshed');
      
      // Then get fresh stats
      const stats = await profileService.getStats({ forceRefresh: true });
      console.log('Fresh stats received:', stats);
      
      // Check if the profile just became complete with this refresh
      const after = stats?.stats?.profile || { completedItems: 0 };
      const justCompleted = (after.completedItems === 3) && 
                           (before.completedItems < 3 || before.completedItems === undefined);
                           
      console.log('Profile status after refresh:', after, 'Just completed:', justCompleted);
      
      // If we just completed the profile and it's not acknowledged, trigger the event
      const isLocalAcknowledged = localStorage.getItem('profile_completion_acknowledged') === 'true';
      if (justCompleted && !after.isAcknowledged && !isLocalAcknowledged && !recentlyAcknowledged && !currentlyShowing) {
        console.log('Profile just completed during data refresh! Triggering event...');
        
        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('profile:completion', {
          detail: { 
            timestamp: Date.now(),
            from: 'forceFreshProfileData',
            justCompleted: true
          }
        }));
      }
      
      // Check if acknowledged
      if (stats?.stats?.profile?.isAcknowledged) {
        setLocalAcknowledged(true);
        setIsProfileComplete(true);
        
        // Store in localStorage
        try {
          localStorage.setItem('profile_completion_acknowledged', 'true');
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      return newData;
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    }
  };
  
  // Refresh data on component mount with a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      forceFreshProfileData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const { completedItems, completionItems, isAcknowledged } = useMemo(() => {
    // Même si profileData est null, on continue avec des valeurs par défaut
    const data = profileData || {};
    
    const hasLinkedIn = Boolean(data?.linkedinUrl);
    const hasCv = Boolean(data?.hasCvDocument);
    const hasDiploma = (() => {
      const isDiplomaArray = Array.isArray(data?.diplomas);
      const diplomaCount = isDiplomaArray ? data.diplomas.length : 0;
      return isDiplomaArray && diplomaCount > 0;
    })();
    
    const items = [
      { 
        name: 'LinkedIn', 
        completed: hasLinkedIn,
        description: "Votre profil LinkedIn permet aux recruteurs de mieux vous connaître.",
        action: "/settings/profile"
      },
      { 
        name: 'CV', 
        completed: hasCv,
        description: "Votre CV est essentiel pour présenter votre parcours.",
        action: "/settings/career"
      },
      { 
        name: 'Diplôme', 
        completed: hasDiploma,
        description: "Vos diplômes certifient vos qualifications.",
        action: "/settings/career"
      }
    ].sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      return 0;
    });

    const completed = [hasLinkedIn, hasCv, hasDiploma].filter(Boolean).length;
    
    // Get acknowledgment status from multiple sources
    const localStorageAck = localStorage.getItem('profile_completion_acknowledged') === 'true';
    const statsAck = data?.stats?.profile?.isAcknowledged || false;
    const isAck = localAcknowledged || localStorageAck || statsAck;

    return { 
      completedItems: completed, 
      completionItems: items,
      isAcknowledged: isAck
    };
  }, [profileData, localAcknowledged]);

  // Check if profile just became complete
  useEffect(() => {
    // First, always check localStorage directly for the most up-to-date acknowledgment status
    let currentAcknowledged = false;
    try {
      currentAcknowledged = localStorage.getItem('profile_completion_acknowledged') === 'true';
      if (currentAcknowledged && !localAcknowledged) {
        console.log('Found acknowledgment in localStorage, updating local state');
        setLocalAcknowledged(true);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Log current state for debugging
    console.log('Profile status:', {
      completedItems,
      previousCompletion: previousCompletionRef.current,
      isAcknowledged,
      localAcknowledged,
      currentLocalStorage: currentAcknowledged,
      hasDispatchedEvent,
      profileDataPresent: !!profileData
    });
    
    // Check if the items were just completed (transition from incomplete to complete)
    const justCompleted = completedItems === 3 && previousCompletionRef.current < 3;
    
    // If we're in dev mode, allow forcing the event regardless of hasDispatchedEvent state
    const isDevMode = process.env.NODE_ENV === 'development';
    const forceDispatch = isDevMode && window.location.search.includes('force_event');
    
    // Logging to help debug the completion detection
    if (completedItems === 3) {
      console.log('Profile is complete! Checking conditions for celebration:');
      console.log('- isAcknowledged:', isAcknowledged);
      console.log('- localAcknowledged:', localAcknowledged);
      console.log('- localStorage acknowledgment:', currentAcknowledged);
      console.log('- hasDispatchedEvent:', hasDispatchedEvent);
      console.log('- justCompleted:', justCompleted);
      console.log('- forceDispatch:', forceDispatch);
    }
    
    // If completedItems is 3, this means the profile is complete
    if (completedItems === 3) {
      // Check if profile completion was recently acknowledged
      let recentlyAcknowledged = false;
      try {
        const lastShownAt = parseInt(localStorage.getItem('profile_completion_acknowledged_at') || '0', 10);
        const now = Date.now();
        recentlyAcknowledged = (now - lastShownAt < 10000); // 10 seconds
        
        if (recentlyAcknowledged) {
          console.log('Profile was recently acknowledged, skipping celebration');
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      
      // Also check if it's currently showing
      let currentlyShowing = false;
      try {
        currentlyShowing = localStorage.getItem('profile_completion_showing') === 'true';
      } catch (e) {
        // Ignore localStorage errors
      }
      
      // If not yet acknowledged, show celebration
      if ((!isAcknowledged && !localAcknowledged && !currentAcknowledged && !hasDispatchedEvent && !recentlyAcknowledged && !currentlyShowing) || forceDispatch) {
        console.log('🎉 TRIGGERING PROFILE COMPLETION EVENT 🎉');
        
        // Clear any existing acknowledgment in localStorage for testing in dev mode
        if (forceDispatch && isDevMode) {
          localStorage.removeItem('profile_completion_acknowledged');
          console.log('Cleared localStorage acknowledgment for testing');
        }
        
        // Mark that we've dispatched the event to prevent multiple dispatches
        setHasDispatchedEvent(true);
        
        // Dispatch an event that MainLayout will listen for to trigger animation
        const celebrationEvent = new CustomEvent('profile:completion', {
          detail: { 
            timestamp: Date.now(),
            completedItems,
            justCompleted,
            forceDispatch
          }
        });
        document.dispatchEvent(celebrationEvent);
        console.log('Event dispatched:', celebrationEvent);
        
        // Log if the event was actually received by checking in next tick
        setTimeout(() => {
          console.log('Checking if event was received...');
        }, 100);
        
        // We no longer send the acknowledgment here with a delay
        // Instead, the "Continue" button in the congratulations modal will handle it
        
        // Delay hiding the widget by 4 seconds
        const timer = setTimeout(() => {
          setIsProfileComplete(true);
        }, 4000);
        
        return () => {
          clearTimeout(timer);
        };
      }
      // Mark as complete even if already acknowledged
      setIsProfileComplete(true);
    } else {
      // If profile is no longer complete, reset the event dispatch flag
      setHasDispatchedEvent(false);
    }
    
    // Update the previous completion reference
    previousCompletionRef.current = completedItems;
  }, [completedItems, isAcknowledged, localAcknowledged, forceFreshProfileData, hasDispatchedEvent, profileData]);

  const handleRefresh = async () => {
    if (isRefreshing || isProfileLoading) return;
    
    setIsRefreshing(true);
    try {
      await forceFreshProfileData();
    } catch (error) {
      // Error handling silently
    }
  };

  useEffect(() => {
    if (!isProfileLoading && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [isProfileLoading, isRefreshing]);

  // Si le profil est complet et reconnu, ne pas afficher le widget
  if ((isProfileComplete && completedItems === 3) || isAcknowledged) {
    return null;
  }

  const showLoadingState = (isProfileLoading && !profileData) || isRefreshing;

  if (showLoadingState) {
    return (
      <button
        className="fixed right-4 sm:right-8 bottom-4 sm:bottom-8 z-20 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90"
        disabled
      >
        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
        <span className="font-medium">Chargement...</span>
      </button>
    );
  }

  // Toujours afficher le composant, même sans données
  const percentage = Math.round((completedItems / 3) * 100);
  const itemsToComplete = 3 - completedItems;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 sm:right-8 bottom-4 sm:bottom-8 z-20 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-lg text-sm ${
          isOpen 
            ? 'bg-background text-foreground hover:bg-muted' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-medium">
          {itemsToComplete === 0 
            ? "Profil complet ✨" 
            : `${itemsToComplete} élément${itemsToComplete > 1 ? 's' : ''} à compléter`}
        </span>
      </button>

      {isOpen && (
        <div className="fixed right-4 sm:right-8 bottom-16 sm:bottom-24 w-72 sm:w-80 z-10">
          <div className="bg-background/80 backdrop-blur-lg rounded-xl shadow-lg border border-border/5 overflow-hidden">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">Complétude du profil</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="inline-flex items-center justify-center rounded-full w-4 h-4 text-muted-foreground hover:text-primary transition-colors">
                        <InfoIcon className="w-3 h-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 sm:w-64 p-3" align="end">
                      <p className="text-xs text-muted-foreground">
                        Complétez ces informations pour augmenter la visibilité de votre profil auprès des recruteurs.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing || isProfileLoading}
                    className="inline-flex items-center justify-center rounded-full w-6 h-6 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                    title="Actualiser"
                  >
                    <RefreshCw className={`w-4 h-4 ${(isRefreshing || isProfileLoading) ? 'animate-spin' : ''}`} />
                  </button>
                  <span className="text-sm font-medium">
                    {completedItems}/3
                  </span>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-1.5 mb-3 sm:mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className={`space-y-2 transition-opacity duration-300 ${(isRefreshing || isProfileLoading) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {completionItems.map((item) => {
                  return (
                    <div 
                      key={item.name}
                      className={`flex items-start gap-2 sm:gap-3 p-2 rounded-lg transition-colors duration-300 ${
                        item.completed 
                          ? 'bg-green-50/50 dark:bg-green-900/10' 
                          : 'bg-red-50/50 dark:bg-red-900/10'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-colors duration-300 ${
                        item.completed 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}>
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          {!item.completed && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              asChild
                            >
                              <a href={item.action} className="flex items-center gap-1">
                                Compléter
                                <ExternalLinkIcon className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                        {item.name === 'CV' && item.completed && (
                          <Button
                            variant="outline"
                            size="xs"
                            className="mt-2 h-6 px-2 text-xs w-full justify-center"
                            onClick={() => console.log("Parse CV clicked!")}
                          >
                            Extraire LinkedIn du CV
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileProgress;