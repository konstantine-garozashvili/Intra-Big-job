import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { CheckCircle2, XCircle, InfoIcon, ExternalLinkIcon, PieChart, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ProfileContext } from "@/components/MainLayout";

const ProfileProgress = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { refreshProfileData, isProfileLoading, profileData } = useContext(ProfileContext);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousCompletionRef = useRef(0);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // Add event listeners for profile updates
  useEffect(() => {
    // This function will be called when any part of the profile is updated
    const handleProfileUpdate = () => {
      refreshProfileData();
    };

    // Listen for events that indicate profile changes
    document.addEventListener('user:data-updated', handleProfileUpdate);
    
    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener('user:data-updated', handleProfileUpdate);
    };
  }, [refreshProfileData]);

  const { completedItems, completionItems } = useMemo(() => {
   
    if (!profileData) {
     
      return { completedItems: 0, completionItems: [] };
    }

    const hasLinkedIn = Boolean(profileData?.linkedinUrl);
    const hasCv = Boolean(profileData?.hasCvDocument);
    // Improved diploma check
    const hasDiploma = (() => {
      const isDiplomaArray = Array.isArray(profileData?.diplomas);
      const diplomaCount = isDiplomaArray ? profileData.diplomas.length : 0;
      const result = isDiplomaArray && diplomaCount > 0;
      return result;
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

    return { completedItems: completed, completionItems: items };
  }, [profileData]);

  // Check if profile just became complete
  useEffect(() => {
    // If completedItems transitioned from less than 3 to exactly 3, trigger celebration
    if (completedItems === 3 && previousCompletionRef.current < 3) {
      // Dispatch an event that MainLayout will listen for to trigger animation
      const celebrationEvent = new CustomEvent('profile:completion', {
        detail: { timestamp: Date.now() }
      });
      document.dispatchEvent(celebrationEvent);
      
      // Delay hiding the widget by 4 seconds
      const timer = setTimeout(() => {
        setIsProfileComplete(true);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
    
    // Update the previous completion reference
    previousCompletionRef.current = completedItems;
  }, [completedItems]);

  const handleRefresh = async () => {
    if (isRefreshing || isProfileLoading) return;
    
    setIsRefreshing(true);
    try {
      await refreshProfileData();
    } catch (error) {
      // Error handling silently
    }
  };

  useEffect(() => {
    if (!isProfileLoading && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [isProfileLoading, isRefreshing]);

  // If profile is complete, don't render the widget at all
  if (isProfileComplete && completedItems === 3) {
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

  if (!profileData) {
    return null;
  }

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