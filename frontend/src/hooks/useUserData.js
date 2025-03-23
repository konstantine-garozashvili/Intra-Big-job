import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import userDataManager, { USER_DATA_EVENTS } from '@/lib/services/userDataManager';
import { getSessionId } from '@/lib/services/authService';
import apiService from '@/lib/services/apiService';

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
  
  // Générer un ID unique pour ce composant
  const [componentId] = useState(() => 
    `user_data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
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
  
  // Enregistrer/désenregistrer ce composant comme utilisateur des routes pertinentes
  useEffect(() => {
    // Enregistrer ce composant au montage
    userDataManager.requestRegistry.registerRouteUser(routeKey, componentId);
    
    // Si on utilise les données complètes, on est aussi potentiellement intéressé par la photo de profil
    if (preferComprehensiveData) {
      userDataManager.requestRegistry.registerRouteUser('/api/profile/picture', componentId);
    }
    
    return () => {
      // Désenregistrer ce composant au démontage
      userDataManager.requestRegistry.unregisterRouteUser(routeKey, componentId);
      
      if (preferComprehensiveData) {
        userDataManager.requestRegistry.unregisterRouteUser('/api/profile/picture', componentId);
      }
    };
  }, [routeKey, componentId, preferComprehensiveData]);
  
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

  // Créer une fonction pour fetcher les données avec coordination
  const fetchUserData = useCallback(async () => {
    console.log(`🔄 useUserData: queryFn executing for ${routeKey}`);
    setIsInitialLoading(true);
    
    try {
      // Utiliser le système de coordination pour éviter les requêtes dupliquées
      const data = await userDataManager.coordinateRequest(
        routeKey,
        componentId,
        async () => {
          console.log(`🔄 Component ${componentId} initiating user data request to ${routeKey}`);
          
          // Check existing cache directly
          const existingCache = queryClient.getQueryData(['unified-user-data', routeKey, sessionId]);
          console.log(`🔄 useUserData: Existing query cache:`, existingCache);
          
          // Faire l'appel API directement pour mieux contrôler le comportement
          return await apiService.get(routeKey, {
            noCache: true,  // Forcer le rafraîchissement des données
            retries: 2,     // Nombre de tentatives en cas d'échec
            timeout: 12000  // Timeout en ms
          });
        }
      );
      
      console.log(`🔄 useUserData: Data received from coordinated request:`, data);
      
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
  }, [routeKey, componentId, queryClient, sessionId]);

  // Utiliser React Query pour gérer l'état et le cache
  const {
    data: userData,
    isLoading: isQueryLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['unified-user-data', routeKey, sessionId],
    queryFn: fetchUserData,
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

  // Forcer un rechargement des données avec coordination
  const forceRefresh = useCallback(async () => {
    // Vérifier si une requête est déjà en cours pour cette route
    if (userDataManager.requestRegistry.getActiveRequest(routeKey)) {
      console.log(`🔄 useUserData: Active request detected for ${routeKey}, skipping refresh`);
      return null;
    }
    
    // Vérifier s'il faut limiter la fréquence des requêtes
    if (userDataManager.requestRegistry.shouldThrottleRequest(routeKey)) {
      console.log(`🔄 useUserData: Throttling refresh request to ${routeKey}`);
      return null;
    }
    
    // Si tout est OK, lancer la requête
    try {
      setIsInitialLoading(true);
      const freshData = await userDataManager.coordinateRequest(
        routeKey,
        componentId,
        () => userDataManager.getUserData({
          routeKey,
          forceRefresh: true,
          useCache: false
        })
      );
      
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
  }, [routeKey, sessionId, queryClient, componentId]);

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

  // Améliorer la gestion des événements de mise à jour
  useEffect(() => {
    if (!enabled) return () => {};
    
    // Variable pour limiter la fréquence des requêtes
    let lastUpdateTime = Date.now();
    const UPDATE_THROTTLE_MS = 2000; // 2 secondes minimum entre les mises à jour
    let pendingUpdate = false;
    
    // S'abonner à l'événement de mise à jour avec contrôle de fréquence
    const unsubscribe = userDataManager.subscribe(USER_DATA_EVENTS.UPDATED, (updateType) => {
      console.log(`🔄 useUserData: Received UPDATE event with type:`, updateType);
      
      // Si c'est une mise à jour de photo de profil uniquement, ne pas refetch toutes les données
      if (updateType === 'profile_picture') {
        console.log('🔄 useUserData: Ignoring profile_picture update to prevent recursive fetching');
        return;
      }
      
      // Vérifier si la route est partagée entre plusieurs composants
      if (userDataManager.requestRegistry.isRouteShared(routeKey)) {
        console.log(`🔄 useUserData: Route ${routeKey} is shared, being cautious with updates`);
        
        // Si une requête est déjà en cours, ne pas en lancer une nouvelle
        if (userDataManager.requestRegistry.getActiveRequest(routeKey)) {
          console.log(`🔄 useUserData: Active request detected for ${routeKey}, skipping update`);
          return;
        }
      }
      
      // Vérifier si une mise à jour est déjà en attente ou si la dernière mise à jour est trop récente
      const now = Date.now();
      if (pendingUpdate || (now - lastUpdateTime < UPDATE_THROTTLE_MS)) {
        console.log(`🔄 useUserData: Throttling update, last update was ${now - lastUpdateTime}ms ago`);
        
        // Si aucune mise à jour n'est en attente, programmer une mise à jour différée
        if (!pendingUpdate) {
          pendingUpdate = true;
          setTimeout(() => {
            console.log('🔄 useUserData: Processing delayed update');
            lastUpdateTime = Date.now();
            pendingUpdate = false;
            
            if (updateType) {
              // En cas de mise à jour avec type spécifique, invalider les données 
              // mais ne pas forcer un refetch immédiat
              queryClient.invalidateQueries(['unified-user-data', routeKey, sessionId]);
            } else {
              // Seulement pour les invalidations générales complètes
              refetch();
            }
          }, UPDATE_THROTTLE_MS - (now - lastUpdateTime));
        }
        return;
      }
      
      // Mettre à jour le timestamp de la dernière mise à jour
      lastUpdateTime = now;
      
      if (updateType) {
        // En cas de mise à jour avec type spécifique, invalider les données
        // mais ne pas forcément refetch immédiatement pour éviter les boucles
        queryClient.invalidateQueries(['unified-user-data', routeKey, sessionId]);
      } else {
        // Pour les invalidations générales, refetch toutes les données
        refetch();
      }
    });
    
    return unsubscribe;
  }, [enabled, routeKey, sessionId, queryClient, refetch]);

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

  // Normaliser les données de l'utilisateur pour assurer une structure cohérente
  const normalizedUser = useMemo(() => {
    const rawData = userData || localStorageUser || {};
    
    // Vérifier si les données sont déjà à la racine ou dans un sous-objet
    const hasNestedUser = rawData.user && typeof rawData.user === 'object';
    const userSource = hasNestedUser ? rawData.user : rawData;
    
    // Créer un objet utilisateur normalisé
    return {
      ...rawData,
      // Propriétés standards de l'utilisateur
      id: userSource.id,
      firstName: userSource.firstName || userSource.firstname || userSource.first_name || "",
      lastName: userSource.lastName || userSource.lastname || userSource.last_name || "",
      email: userSource.email || "",
      phoneNumber: userSource.phoneNumber || userSource.phone_number || userSource.phonenumber || "",
      birthDate: userSource.birthDate || userSource.birth_date || userSource.birthdate || "",
      profilePictureUrl: userSource.profilePictureUrl || userSource.profile_picture_url || "",
      profilePicturePath: userSource.profilePicturePath || userSource.profile_picture_path || "",
      city: userSource.city || "",
      nationality: userSource.nationality || "",
      gender: userSource.gender || "",
      linkedinUrl: userSource.linkedinUrl || userSource.linkedin_url || "",
      specialization: userSource.specialization || {},
      
      // S'assurer que les rôles sont correctement formatés
      roles: Array.isArray(userSource.roles) 
        ? userSource.roles.map(role => {
            if (typeof role === 'string') {
              return { id: 0, name: role };
            } else if (typeof role === 'object' && role !== null && role.name) {
              return role;
            } else {
              return { id: 0, name: 'USER' };
            }
          })
        : [{ id: 0, name: 'USER' }],
      
      // Propriétés spécifiques au profil étudiant
      studentProfile: rawData.studentProfile || {
        isSeekingInternship: false,
        isSeekingApprenticeship: false,
        currentInternshipCompany: null,
        internshipStartDate: null,
        internshipEndDate: null,
        portfolioUrl: null,
        situationType: null
      },
      
      // Collections
      diplomas: Array.isArray(rawData.diplomas) ? rawData.diplomas : [],
      addresses: Array.isArray(rawData.addresses) ? rawData.addresses : [],
      documents: Array.isArray(rawData.documents) ? rawData.documents : [],
      stats: rawData.stats || { profile: { completionPercentage: 0 } }
    };
  }, [userData, localStorageUser]);

  // Retourner tout ce dont les composants pourraient avoir besoin
  return {
    user: normalizedUser,
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

// Export both as named and default export for compatibility
export default useUserData; 