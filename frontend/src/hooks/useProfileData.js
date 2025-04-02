import { useState, useEffect, useCallback } from 'react';
import profileDataService from '../lib/services/profileDataService';

/**
 * Hook pour gérer les données de profil utilisateur
 * 
 * @param {Object} options - Options de configuration
 * @param {boolean} options.loadOnMount - Charger les données au montage du composant
 * @param {boolean} options.loadingInitialState - État de chargement initial
 * @returns {Object} - Données et fonctions de gestion du profil
 */
export const useProfileData = (options = {}) => {
  const { loadOnMount = true, loadingInitialState = true } = options;
  
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(loadingInitialState);
  const [error, setError] = useState(null);
  
  // Fonction pour charger les données du profil
  const loadProfileData = useCallback(async (forceRefresh = false) => {
    console.log('useProfileData: Loading profile data (forceRefresh:', forceRefresh, ')');
    
    // Si nous avons déjà des données et que nous ne forçons pas le rafraîchissement
    if (profileData && !forceRefresh) {
      console.log('useProfileData: Using existing data');
      return profileData;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await profileDataService.getProfileData({ forceRefresh });
      
      setProfileData(data);
      console.log('useProfileData: Profile data loaded successfully');
      
      return data;
    } catch (err) {
      console.error('useProfileData: Error loading profile data:', err);
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [profileData]);
  
  // Fonction pour mettre à jour le profil
  const updateProfile = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedData = await profileDataService.updateProfile(data);
      setProfileData(updatedData);
      
      return updatedData;
    } catch (err) {
      console.error('useProfileData: Error updating profile:', err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // S'abonner aux mises à jour du profileDataService
  useEffect(() => {
    // Fonction de callback pour les mises à jour
    const handleProfileUpdate = (updatedProfile) => {
      console.log('useProfileData: Received profile update from service');
      setProfileData(updatedProfile);
    };
    
    // S'abonner aux mises à jour
    const unsubscribe = profileDataService.subscribe(handleProfileUpdate);
    
    // Charger les données au montage si demandé
    if (loadOnMount) {
      loadProfileData();
    }
    
    // Se désabonner à la destruction du composant
    return () => {
      unsubscribe();
    };
  }, [loadOnMount, loadProfileData]);
  
  // Fonction utilitaire pour obtenir le nom complet
  const getFullName = useCallback(() => {
    if (!profileData) return '';
    
    const firstName = profileData.firstName || '';
    const lastName = profileData.lastName || '';
    
    return `${firstName} ${lastName}`.trim();
  }, [profileData]);
  
  // Fonction utilitaire pour obtenir la ville
  const getCity = useCallback(() => {
    if (!profileData) return 'Non renseignée';
    
    return profileData.city || 'Non renseignée';
  }, [profileData]);
  
  // Fonction utilitaire pour obtenir les rôles
  const getRoles = useCallback(() => {
    if (!profileData || !Array.isArray(profileData.roles)) return [];
    
    return profileData.roles;
  }, [profileData]);
  
  // Fonction utilitaire pour obtenir l'adresse principale
  const getMainAddress = useCallback(() => {
    if (!profileData || !Array.isArray(profileData.addresses) || profileData.addresses.length === 0) {
      return null;
    }
    
    return profileData.addresses[0];
  }, [profileData]);
  
  return {
    profileData,
    isLoading,
    error,
    loadProfileData,
    updateProfile,
    getFullName,
    getCity,
    getRoles,
    getMainAddress
  };
};

export default useProfileData;