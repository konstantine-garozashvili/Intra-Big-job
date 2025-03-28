import React, { useEffect, useContext, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useUserData } from '@/hooks/useDashboardQueries';
import { ProfileContext } from '@/components/MainLayout';
import apiService from '@/lib/services/apiService';
import { useRoles } from '@/features/roles/roleContext';
import { authService } from '@/lib/services/authService';

/**
 * Tableau de bord spécifique pour les invités
 */
const GuestDashboard = () => {
  const { data: user, isLoading, error, refetch } = useUserData();
  const { profileData, refreshProfileData, isProfileLoading } = useContext(ProfileContext);
  const [directlyLoadedData, setDirectlyLoadedData] = useState(null);
  const { roles, refreshRoles } = useRoles(); // Add roles context
  
  // Fallback to extract data from token if API fails
  useEffect(() => {
    // If we already have user data, don't try to extract from token
    if (user && user.firstName && user.lastName) {
      console.log("GuestDashboard - Using existing user data:", user);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      // Parse JWT token to extract user information
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const tokenData = JSON.parse(jsonPayload);
      console.log("GuestDashboard - Extracted token data:", tokenData);
      
      if (tokenData.firstName && tokenData.lastName) {
        console.log("GuestDashboard - Using data from token");
        
        // Create a user object from token data
        const tokenUser = {
          id: tokenData.id || tokenData.userId || "",
          firstName: tokenData.firstName || "",
          lastName: tokenData.lastName || "",
          email: tokenData.username || tokenData.email || "",
          roles: tokenData.roles || [],
          _extractedFromToken: true
        };
        
        // Update localStorage with token data to ensure consistency
        localStorage.setItem('user', JSON.stringify(tokenUser));
        
        // Force refresh roles to ensure they're loaded
        if (refreshRoles) {
          refreshRoles();
        }
        
        // Set directly loaded data from token
        setDirectlyLoadedData(tokenUser);
      }
    } catch (error) {
      console.error("GuestDashboard - Error extracting data from token:", error);
    }
  }, [user, refreshRoles]);
  
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
  }, [refreshProfileData]);
  
  // Utiliser useMemo pour éviter les re-rendus inutiles
  const roleAlias = React.useMemo(() => {
    // First try to get from user data
    if (user?.roles?.length) {
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
    }
    
    // Fallback to directly loaded data
    if (directlyLoadedData?.roles?.length) {
      const role = directlyLoadedData.roles[0].replace('ROLE_', '');
      
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
    }
    
    // Fallback to roles context
    if (roles && roles.length > 0) {
      const role = roles[0].replace('ROLE_', '');
      
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
    }
    
    return '';
  }, [user, directlyLoadedData, roles]);

  // Determine which user data source to use
  const displayUser = user || directlyLoadedData || {};

  // Log the profile data we currently have in the dashboard component
  console.log("GuestDashboard - Current data sources:", { 
    userData: user,
    contextData: profileData,
    directData: directlyLoadedData,
    roles: roles
  });

  return (
    <DashboardLayout loading={isLoading || isProfileLoading} error={error?.message}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Bienvenue {displayUser?.firstName} {displayUser?.lastName}
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