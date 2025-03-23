import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import userDataManager, { USER_DATA_EVENTS } from '@/lib/services/userDataManager';
import { getSessionId } from '@/lib/services/authService';

/**
 * Hook pour accéder aux données utilisateur de manière centralisée
 * Remplace différents hooks dispersés dans l'application
 * @param {Object} options - Options du hook
 * @param {boolean} options.enabled - Active ou désactive la requête
 * @param {boolean} options.preferComprehensiveData - Préfère les données complètes (profile/consolidated)
 * @param {function} options.onSuccess - Callback appelé en cas de succès
 * @param {function} options.onError - Callback appelé en cas d'erreur
 * @returns {Object} - Données et fonctions utilisateur
 */
export function useUserData(options = {}) {
  const {
    enabled = true,
    preferComprehensiveData = false,
    onSuccess,
    onError,
    ...queryOptions
  } = options;

  const queryClient = useQueryClient();
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const sessionId = getSessionId();
  
  // Optimisation : récupérer les données du localStorage immédiatement
  const [localStorageUser, setLocalStorageUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
    return null;
  });

  // Déterminer la route à utiliser
  const routeKey = preferComprehensiveData ? '/profile/consolidated' : '/api/me';
  
  // Force une requête au démarrage, que le composant soit monté ou non
  useEffect(() => {
    // Ne pas exécuter si désactivé ou pas de sessionId
    if (!enabled || !sessionId) return;
    
    // Vérifie si nous avons un token dans localStorage
    const hasToken = !!localStorage.getItem('token');
    if (!hasToken) return;
    
    console.log(`🔄 useUserData: Forcing initial data fetch for ${routeKey}`);
    const fetchData = async () => {
      try {
        const freshData = await userDataManager.getUserData({
          routeKey,
          forceRefresh: true,
          useCache: false,
        });
        
        // Mettre à jour le cache React Query
        if (freshData) {
          queryClient.setQueryData(['unified-user-data', routeKey, sessionId], freshData);
          
          // Mettre à jour le localStorage avec les données fraîches
          try {
            localStorage.setItem('user', JSON.stringify(freshData));
            setLocalStorageUser(freshData);
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
        }
      } catch (error) {
        console.error('Error in initial data fetch:', error);
      }
    };
    
    fetchData();
  }, [enabled, sessionId, routeKey, queryClient]);

  // Récupérer les données initiales du cache si disponibles
  const getCachedData = useCallback(() => {
    // D'abord essayer depuis userDataManager
    const cached = userDataManager.getCachedUserData();
    if (cached) {
      console.log(`🔄 useUserData: Retrieved cached data from userDataManager:`, cached);
      return cached;
    }
    
    // Ensuite essayer depuis localStorage
    if (localStorageUser) {
      console.log(`🔄 useUserData: Retrieved cached data from localStorage:`, localStorageUser);
      return localStorageUser;
    }
    
    return null;
  }, [localStorageUser]);

  // Utiliser React Query pour gérer l'état et le cache
  const {
    data: userData,
    isLoading: isQueryLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['unified-user-data', routeKey, sessionId],
    queryFn: async () => {
      console.log(`🔄 useUserData: queryFn executing for ${routeKey}`);
      setIsInitialLoading(true);
      try {
        // Check existing cache directly
        const existingCache = queryClient.getQueryData(['unified-user-data', routeKey, sessionId]);
        console.log(`🔄 useUserData: Existing query cache:`, existingCache);
        
        // Utiliser userDataManager pour récupérer les données
        const data = await userDataManager.getUserData({
          routeKey,
          forceRefresh: true,  // Forcer le rafraîchissement des données
          useCache: false      // Ne pas utiliser le cache pour les requêtes explicites
        });
        
        console.log(`🔄 useUserData: Data received from userDataManager:`, data);
        
        // Si nous avons des données, les sauvegarder dans localStorage
        if (data) {
          try {
            localStorage.setItem('user', JSON.stringify(data));
            setLocalStorageUser(data);
          } catch (e) {
            console.error('Error saving user data to localStorage:', e);
          }
        }
        
        setIsInitialLoading(false);
        return data;
      } catch (error) {
        console.error(`🔄 useUserData: Error fetching data:`, error);
        setIsInitialLoading(false);
        throw error;
      }
    },
    initialData: getCachedData,
    enabled: enabled && !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute (réduit pour forcer des actualisations plus fréquentes)
    cacheTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: true, // Activé pour assurer des données fraîches lors du retour sur l'onglet
    refetchOnMount: true,
    refetchInterval: false,
    retry: 2, // Augmenté pour améliorer la résilience
    retryDelay: 1000,
    ...queryOptions,
    onSuccess: (data) => {
      console.log(`🔄 useUserData: onSuccess with data:`, data);
      
      // Mettre à jour le localStorage
      if (data) {
        try {
          localStorage.setItem('user', JSON.stringify(data));
          setLocalStorageUser(data);
        } catch (e) {
          console.error('Error saving user data to localStorage:', e);
        }
      }
      
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => {
      console.error(`🔄 useUserData: onError:`, err);
      if (onError) onError(err);
    }
  });

  // Forcer un rechargement des données
  const forceRefresh = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      const freshData = await userDataManager.getUserData({
        routeKey,
        forceRefresh: true,
        useCache: false
      });
      
      // Mettre à jour le cache React Query avec les nouvelles données
      queryClient.setQueryData(['unified-user-data', routeKey, sessionId], freshData);
      
      // Mettre à jour également le localStorage
      if (freshData) {
        try {
          localStorage.setItem('user', JSON.stringify(freshData));
          setLocalStorageUser(freshData);
        } catch (e) {
          console.error('Error saving user data to localStorage:', e);
        }
      }
      
      setIsInitialLoading(false);
      return freshData;
    } catch (error) {
      setIsInitialLoading(false);
      throw error;
    }
  }, [routeKey, sessionId, queryClient]);

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useCallback((role) => {
    // Utiliser userData ou localStorageUser comme fallback
    const userToCheck = userData || localStorageUser;
    
    if (!userToCheck || !userToCheck.roles) return false;
    
    const roles = Array.isArray(userToCheck.roles) 
      ? userToCheck.roles 
      : (typeof userToCheck.roles === 'object' ? Object.values(userToCheck.roles) : []);
    
    return roles.some(r => 
      (typeof r === 'string' && r === role) || 
      (typeof r === 'object' && r.name === role)
    );
  }, [userData, localStorageUser]);

  // S'abonner aux événements de mise à jour des données utilisateur
  useEffect(() => {
    if (!enabled) return () => {};
    
    // S'abonner à l'événement de mise à jour
    const unsubscribe = userDataManager.subscribe(USER_DATA_EVENTS.UPDATED, (updatedData) => {
      if (updatedData) {
        queryClient.setQueryData(['unified-user-data', routeKey, sessionId], updatedData);
        
        // Mettre à jour également le localStorage
        try {
          localStorage.setItem('user', JSON.stringify(updatedData));
          setLocalStorageUser(updatedData);
        } catch (e) {
          console.error('Error saving updated user data to localStorage:', e);
        }
      }
    });
    
    return unsubscribe;
  }, [enabled, routeKey, sessionId, queryClient]);

  // Données dérivées basées sur le rôle de l'utilisateur
  const derivedData = useMemo(() => {
    // Utiliser userData ou localStorageUser comme fallback
    const userToUse = userData || localStorageUser;
    
    if (!userToUse) return {};
    
    // Déterminer le rôle principal
    let primaryRole = '';
    if (userToUse.roles && userToUse.roles.length > 0) {
      primaryRole = Array.isArray(userToUse.roles) ? userToUse.roles[0] : '';
    }
    
    // Déterminer les rôles spécifiques
    const isStudent = hasRole('ROLE_STUDENT');
    const isTeacher = hasRole('ROLE_TEACHER');
    const isAdmin = hasRole('ROLE_ADMIN');
    const isSuperAdmin = hasRole('ROLE_SUPER_ADMIN');
    const isGuest = hasRole('ROLE_GUEST');
    
    return {
      primaryRole,
      isStudent,
      isTeacher,
      isAdmin,
      isSuperAdmin,
      isGuest
    };
  }, [userData, localStorageUser, hasRole]);

  // Retourner tout ce dont les composants pourraient avoir besoin
  return {
    user: userData || localStorageUser, // Utiliser le fallback
    isLoading: (isQueryLoading || isInitialLoading) && !localStorageUser, // Ne pas afficher loading si on a des données locales
    isInitialLoading: isInitialLoading && !localStorageUser,
    isError,
    error,
    refetch,
    forceRefresh,
    hasRole,
    ...derivedData
  };
}

export default useUserData; 