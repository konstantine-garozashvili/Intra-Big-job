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

  // Déterminer la route à utiliser
  const routeKey = preferComprehensiveData ? '/profile/consolidated' : '/api/me';
  
  console.log(`🔄 useUserData: Hook initialized with routeKey=${routeKey}, sessionId=${sessionId}, enabled=${enabled}`);

  // Récupérer les données initiales du cache si disponibles
  const getCachedData = useCallback(() => {
    const cached = userDataManager.getCachedUserData();
    console.log(`🔄 useUserData: Retrieved cached data:`, cached);
    return cached;
  }, []);

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
          forceRefresh: false,
          useCache: true
        });
        
        console.log(`🔄 useUserData: Data received from userDataManager:`, data);
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    retry: 1,
    ...queryOptions,
    onSuccess: (data) => {
      console.log(`🔄 useUserData: onSuccess with data:`, data);
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
      
      setIsInitialLoading(false);
      return freshData;
    } catch (error) {
      setIsInitialLoading(false);
      throw error;
    }
  }, [routeKey, sessionId, queryClient]);

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useCallback((role) => {
    if (!userData || !userData.roles) return false;
    
    const roles = Array.isArray(userData.roles) 
      ? userData.roles 
      : (typeof userData.roles === 'object' ? Object.values(userData.roles) : []);
    
    return roles.some(r => 
      (typeof r === 'string' && r === role) || 
      (typeof r === 'object' && r.name === role)
    );
  }, [userData]);

  // S'abonner aux événements de mise à jour des données utilisateur
  useEffect(() => {
    if (!enabled) return () => {};
    
    // S'abonner à l'événement de mise à jour
    const unsubscribe = userDataManager.subscribe(USER_DATA_EVENTS.UPDATED, (updatedData) => {
      if (updatedData) {
        queryClient.setQueryData(['unified-user-data', routeKey, sessionId], updatedData);
      }
    });
    
    return unsubscribe;
  }, [enabled, routeKey, sessionId, queryClient]);

  // Données dérivées basées sur le rôle de l'utilisateur
  const derivedData = useMemo(() => {
    if (!userData) return {};
    
    // Déterminer le rôle principal
    let primaryRole = '';
    if (userData.roles && userData.roles.length > 0) {
      primaryRole = Array.isArray(userData.roles) ? userData.roles[0] : '';
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
  }, [userData, hasRole]);

  // Retourner tout ce dont les composants pourraient avoir besoin
  return {
    user: userData,
    isLoading: isQueryLoading || isInitialLoading,
    isInitialLoading,
    isError,
    error,
    refetch,
    forceRefresh,
    hasRole,
    ...derivedData
  };
}

export default useUserData; 