import React, { useEffect, useContext, useRef } from 'react';
import UserProfileSettings from '../components/UserProfileSettings';
import { ProfileContext } from '@/components/MainLayout';
import { useRoles } from '@/features/roles';
import { toast } from 'sonner';

// Global refresh tracking to prevent duplicate refreshes across multiple component instances
const GLOBAL_REFRESH = {
  lastAttemptTime: 0,
  inProgress: false,
  completedRecently: false,
  // Keep track of LinkedIn URL discovery attempts globally
  linkedinUrlAttempted: false
};

// Check if there is already a LinkedIn URL in session storage
try {
  const cachedLinkedIn = sessionStorage.getItem('linkedinUrl');
  if (cachedLinkedIn) {
    const cachedData = JSON.parse(cachedLinkedIn);
    if (cachedData && cachedData.url) {
      // If we already have a LinkedIn URL, mark it as attempted
      GLOBAL_REFRESH.linkedinUrlAttempted = true;
    }
  }
} catch (e) {
  // Ignore sessionStorage errors
}

const SettingsProfile = () => {
  const { refreshProfileData, profileData } = useContext(ProfileContext);
  const { hasRole } = useRoles();
  
  // Use refs to track component state
  const isMounted = useRef(false);
  const refreshAttempted = useRef(false);
  const linkedinRefreshAttempted = useRef(false);
  
  useEffect(() => {
    // Skip if already mounted to prevent duplicate effects
    if (isMounted.current) return;
    isMounted.current = true;
    
    const loadProfileData = async () => {
      try {
        // Check if a refresh is already in progress or completed recently globally
        const now = Date.now();
        const timeSinceLastRefresh = now - GLOBAL_REFRESH.lastAttemptTime;
        
        // Don't refresh if another component instance is already refreshing or did so recently
        if (GLOBAL_REFRESH.inProgress || (timeSinceLastRefresh < 5000 && GLOBAL_REFRESH.completedRecently)) {
          console.log("SettingsProfile - Skipping refresh (already in progress or completed recently)");
          return;
        }
        
        // Check if we already have a LinkedIn URL in session storage
        let hasLinkedInUrl = false;
        try {
          const cachedLinkedIn = sessionStorage.getItem('linkedinUrl');
          if (cachedLinkedIn) {
            const cachedData = JSON.parse(cachedLinkedIn);
            if (cachedData && cachedData.url) {
              hasLinkedInUrl = true;
              console.log("SettingsProfile - LinkedIn URL already in session:", cachedData.url);
            }
          }
        } catch (e) {
          // Ignore sessionStorage errors
        }
        
        const isGuest = hasRole('ROLE_GUEST');
        const lastLoginTime = parseInt(localStorage.getItem('lastLoginTime') || '0');
        const lastProfileRefreshTime = parseInt(localStorage.getItem('lastProfileRefreshTime') || '0');
        const timeElapsedSinceRefresh = now - lastProfileRefreshTime;
        
        // If we already have the LinkedIn URL and it's not a guest user, we can skip refresh
        if (hasLinkedInUrl && !isGuest && timeElapsedSinceRefresh < 300000) { // 5 minutes
          console.log("SettingsProfile - Skipping refresh (LinkedIn URL already exists)");
          return;
        }
        
        console.log("SettingsProfile - Profile refresh check:", { 
          isGuest, 
          hasLinkedInUrl,
          timeElapsedSinceLogin: Math.round((now - lastLoginTime) / 1000) + 's',
          timeElapsedSinceRefresh: Math.round(timeElapsedSinceRefresh / 1000) + 's',
          needsRefresh: isGuest || (timeElapsedSinceRefresh > 30000) || !lastProfileRefreshTime || !hasLinkedInUrl
        });
        
        // Only refresh if necessary - for guests, if no LinkedIn URL, or if it's been >30s since last refresh
        if (isGuest || timeElapsedSinceRefresh > 30000 || !lastProfileRefreshTime || !hasLinkedInUrl) {
          if (!refreshAttempted.current) {
            console.log("SettingsProfile - Initiating profile data refresh");
            refreshAttempted.current = true;
            GLOBAL_REFRESH.inProgress = true;
            GLOBAL_REFRESH.lastAttemptTime = now;
            
            try {
              const result = await refreshProfileData({ 
                forceRefresh: true,
                bypassThrottle: true
              });
              
              // Store refresh timestamp
              localStorage.setItem('lastProfileRefreshTime', now.toString());
              console.log("SettingsProfile - Profile refresh complete");
              
              // Check if LinkedIn URL was found in this refresh
              let foundLinkedinUrl = false;
              try {
                const cachedLinkedIn = sessionStorage.getItem('linkedinUrl');
                if (cachedLinkedIn) {
                  const cachedData = JSON.parse(cachedLinkedIn);
                  if (cachedData && cachedData.url) {
                    foundLinkedinUrl = true;
                    console.log("SettingsProfile - LinkedIn URL found:", cachedData.url);
                    // Mark as attempted globally to prevent other components from trying
                    GLOBAL_REFRESH.linkedinUrlAttempted = true;
                  }
                }
              } catch (e) {
                // Ignore sessionStorage errors
              }
              
              // One-time LinkedIn URL check for guest users only if not already attempted globally
              if (isGuest && !foundLinkedinUrl && !linkedinRefreshAttempted.current && !GLOBAL_REFRESH.linkedinUrlAttempted) {
                linkedinRefreshAttempted.current = true;
                GLOBAL_REFRESH.linkedinUrlAttempted = true;
                console.log("SettingsProfile - LinkedIn URL missing, scheduling one final check");
                
                // Use a longer delay to avoid immediate refresh
                setTimeout(() => {
                  if (document.hidden || !isMounted.current) return;
                  
                  // Only do this once
                  console.log("SettingsProfile - Executing final LinkedIn URL check");
                  refreshProfileData({ 
                    forceRefresh: true, 
                    bypassThrottle: true,
                    silent: true 
                  });
                }, 3000);
              }
            } finally {
              GLOBAL_REFRESH.inProgress = false;
              GLOBAL_REFRESH.completedRecently = true;
              
              // Reset the "completed recently" flag after 5 seconds
              setTimeout(() => {
                GLOBAL_REFRESH.completedRecently = false;
              }, 5000);
            }
          }
        } else {
          console.log("SettingsProfile - Profile refresh not needed");
        }
      } catch (error) {
        console.error("Error refreshing profile data:", error);
        GLOBAL_REFRESH.inProgress = false;
      }
    };
    
    loadProfileData();
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [refreshProfileData, hasRole]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Mon compte</h1>
      <UserProfileSettings />
    </div>
  );
};

export default SettingsProfile;