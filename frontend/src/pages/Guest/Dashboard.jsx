import React, { useEffect, useContext, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserData } from '@/hooks/useDashboardQueries';
import { ProfileContext } from '@/components/MainLayout';
import apiService from '@/lib/services/apiService';

/**
 * Tableau de bord spécifique pour les invités
 */
const GuestDashboard = () => {
  const { data: user, isLoading, error, refetch } = useUserData();
  const { profileData, refreshProfileData, isProfileLoading } = useContext(ProfileContext);
  const [directlyLoadedData, setDirectlyLoadedData] = useState(null);
  
  // Direct API call to force correct data
  useEffect(() => {
    // Check if we've already loaded profile data recently to avoid redundant loading
    const lastLoadTime = localStorage.getItem('profileDataLoadTime');
    const now = Date.now();
    
    // Only load if we haven't loaded in the last 60 seconds
    if (lastLoadTime && (now - parseInt(lastLoadTime) < 60000)) {
      console.log("GuestDashboard - Skipping direct API load (loaded recently)");
      return;
    }
    
    const loadProfileDirectly = async () => {
      try {
        console.log("GuestDashboard - Loading profile directly from API");
        
        // Make multiple API calls to ensure we have complete data
        const results = await Promise.allSettled([
          apiService.get('/profile').catch(e => ({ data: null })),
          apiService.get('/documents').catch(e => ({ data: [] })),
          apiService.get('/user-diplomas').catch(e => ({ data: [] }))
        ]);
        
        console.log("GuestDashboard - Direct API results:", results);
        
        // Combine the results into a complete profile object
        const profileResult = results[0].status === 'fulfilled' ? results[0].value : { data: {} };
        const documentsResult = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
        const diplomasResult = results[2].status === 'fulfilled' ? results[2].value : { data: [] };
        
        const completeProfile = {
          ...profileResult.data,
          documents: documentsResult.data || [],
          diplomas: diplomasResult.data || [],
          _loadedDirectly: true,
          _loadTime: Date.now()
        };
        
        console.log("GuestDashboard - Combined profile data:", completeProfile);
        setDirectlyLoadedData(completeProfile);
        
        // Save the load time to prevent frequent reloading
        localStorage.setItem('profileDataLoadTime', Date.now().toString());
        
        // Force refresh context data too if available
        if (refreshProfileData && typeof refreshProfileData === 'function') {
          refreshProfileData({
            forceRefresh: true,
            bypassThrottle: true,
            directData: completeProfile // Pass the direct data for the context to use
          });
        }
      } catch (err) {
        console.error("GuestDashboard - Error loading profile directly:", err);
      }
    };
    
    // Run this effect once on mount
    loadProfileDirectly();
  }, []);
  
  // Force refresh profile data when dashboard loads - DISABLED since we now do direct loading
  // This eliminates duplicate API calls that were happening
  /* 
  useEffect(() => {
    const refreshData = async () => {
      try {
        console.log("GuestDashboard - Refreshing all data sources");
        
        // Refresh user data from the API
        if (typeof refetch === 'function') {
          await refetch();
        }
        
        // Only try to refresh profile if the context function exists
        if (refreshProfileData && typeof refreshProfileData === 'function') {
          console.log("GuestDashboard - Refreshing profile data");
          
          // Add a small delay to ensure context is fully initialized
          setTimeout(async () => {
            try {
              const newData = await refreshProfileData({
                forceRefresh: true,
                bypassThrottle: true 
              });
              console.log("GuestDashboard - Profile data refreshed:", newData ? 'success' : 'no data');
            } catch (err) {
              console.error("GuestDashboard - Error refreshing profile:", err);
            }
          }, 200);
        } else {
          console.warn("GuestDashboard - refreshProfileData function is not available in context");
        }
      } catch (err) {
        console.error("GuestDashboard - Error in refresh process:", err);
      }
    };
    
    refreshData();
  }, [refreshProfileData, refetch]); // Only depend on function references
  */
  
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const roleAlias = React.useMemo(() => {
    if (!user?.roles?.length) return '';
    const role = user.roles[0].replace('ROLE_', '');
    
    // Mapping des rôles vers des alias plus conviviaux
    const roleAliases = {
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'TEACHER': 'Formateur',
      'STUDENT': 'Étudiant',
      'HR': 'Ressources Humaines',
      'RECRUITER': 'Recruteur',
      'GUEST': 'Invité'
    };
    
    return roleAliases[role] || role;
  }, [user]);

  // Log the profile data we currently have in the dashboard component
  console.log("GuestDashboard - Current profile data:", { 
    contextData: profileData,
    directData: directlyLoadedData 
  });

  return (
    <DashboardLayout loading={isLoading || isProfileLoading} error={error?.message}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Bienvenue {user?.firstName} {user?.lastName}
        </h1>
        <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-500 rounded-md">
          <p className="text-lg text-gray-800">
            <span className="font-semibold">Rôle:</span> {roleAlias}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GuestDashboard; 