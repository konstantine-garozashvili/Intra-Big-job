import React, { useEffect, useCallback } from 'react';
import UserProfileSettings from '../components/UserProfileSettings';
import { queryClient } from '@/lib/services/queryClient';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/services/authService';

const SettingsProfile = () => {
  const { loadUserData } = useAuth();

  // Mémoiser la fonction de refresh pour éviter les re-rendus inutiles
  const refreshUserData = useCallback(async () => {
    try {
      await loadUserData();
      // Ne déclencher l'événement que si les données ont vraiment changé
      const currentUser = authService.getUser();
      if (currentUser) {
        document.dispatchEvent(new CustomEvent('user:data-updated', { 
          detail: { user: currentUser } 
        }));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [loadUserData]);

  // Force data refresh on component mount to ensure we have the latest user data
  useEffect(() => {
    let cancelled = false;
    
    // Ne charger qu'au montage initial
    refreshUserData();
    
    return () => { cancelled = true; };
  }, []); // Dépendance vide pour ne s'exécuter qu'au montage

  console.log("RENDER SettingsProfile");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Mon compte</h1>
      <UserProfileSettings />
    </div>
  );
};

// Wrapper avec React.memo pour éviter les re-rendus inutiles
export default React.memo(SettingsProfile);