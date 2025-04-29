import React, { useEffect } from 'react';
import UserProfileSettings from '../components/UserProfileSettings';
import { queryClient } from '@/lib/services/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/services/authService';

const SettingsProfile = () => {
  const { loadUserData } = useAuth();

  // Force data refresh on component mount to ensure we have the latest user data
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        // First invalidate any cached user data
        queryClient.invalidateQueries({ queryKey: ['user'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['userProfileData'] });
        queryClient.invalidateQueries({ queryKey: ['unified-user-data'] });
        
        // Force a fresh data load 
        await loadUserData();
        
        // Trigger the user:data-updated event to ensure all components refresh
        document.dispatchEvent(new CustomEvent('user:data-updated', { 
          detail: { user: authService.getUser() } 
        }));
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };

    refreshUserData();
  }, [loadUserData]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Mon compte</h1>
      <UserProfileSettings />
    </div>
  );
};

export default SettingsProfile;