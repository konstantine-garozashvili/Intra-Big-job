import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import userDataManager, { USER_DATA_EVENTS } from '@/lib/services/userDataManager';
import { getSessionId } from '@/lib/services/authService';
import { authService } from '@/lib/services/authService';
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
  // Add isAuthenticated state
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isLoggedIn());
  
  const [componentId] = useState(() => 
    `user_data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
  const [localStorageUser, setLocalStorageUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // Error parsing user from localStorage
    }
    return null;
  });

  const routeKey = preferComprehensiveData ? '/profile/consolidated' : '/api/me';
  
  // Add a ref to track the last time we fetched data to prevent too frequent refreshes
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  useEffect(() => {
    userDataManager.requestRegistry.registerRouteUser(routeKey, componentId);
    
    if (preferComprehensiveData) {
      userDataManager.requestRegistry.registerRouteUser('/api/profile/picture', componentId);
    }
    
    return () => {
      userDataManager.requestRegistry.unregisterRouteUser(routeKey, componentId);
      
      if (preferComprehensiveData) {
        userDataManager.requestRegistry.unregisterRouteUser('/api/profile/picture', componentId);
      }
    };
  }, [routeKey, componentId, preferComprehensiveData]);
  
  useEffect(() => {
    if (!enabled || !sessionId) return;
    
    const hasToken = !!localStorage.getItem('token');
    if (!hasToken) return;
    
    // Only fetch if we haven't fetched in the last 10 seconds
    const now = Date.now();
    if (now - lastFetchTime < 10000) {
      return;
    }
    
    const fetchData = async () => {
      setIsInitialLoading(true);
      try {
        // Use a timestamp-based requestId to help with debugging
        const requestId = `useUserData_${componentId}_${now}`;
        
        const freshData = await userDataManager.getUserData({
          routeKey,
          forceRefresh: false, // Change to false to allow using cache
          useCache: true,      // Allow using cache
          requestId           // Add requestId for tracing
        });
        
        if (freshData) {
          queryClient.setQueryData(['unified-user-data', routeKey, sessionId], freshData);
          
          try {
            localStorage.setItem('user', JSON.stringify(freshData));
            setLocalStorageUser(freshData);
          } catch (e) {
            // Error saving to localStorage
          }
        }
        
        // Update the last fetch time
        setLastFetchTime(now);
      } catch (error) {
        // Error in initial data fetch
        console.warn("Error fetching user data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    fetchData();
  }, [enabled, sessionId, routeKey, queryClient]);

  const getCachedData = useCallback(() => {
    // Add debouncing/memoization to prevent excessive cache reads
    try {
      // First try to get from query cache which is faster
      const queryCached = queryClient.getQueryData(['unified-user-data', routeKey, sessionId]);
      if (queryCached) return queryCached;
      
      // Then try userDataManager cache
      const cached = userDataManager.getCachedUserData();
      if (cached) return cached;
      
      // Finally try localStorage
      return localStorageUser;
    } catch (e) {
      return localStorageUser;
    }
  }, [routeKey, sessionId, localStorageUser, queryClient]);

  const fetchUserData = useCallback(async () => {
    setIsInitialLoading(true);
    
    try {
      // Check token first for guest accounts which might not have an API endpoint
      const token = localStorage.getItem('token');
      let tokenData = null;
      
      if (token) {
        try {
          // Extract user data from token
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          tokenData = JSON.parse(jsonPayload);
          console.log("useUserData - Token data:", tokenData);
          
          // If this is a guest user, we might not need to make the API call
          if (tokenData.roles && tokenData.roles.includes('ROLE_GUEST')) {
            console.log("useUserData - Guest user detected in token");
          }
        } catch (tokenError) {
          console.error("useUserData - Error parsing token:", tokenError);
        }
      }
      
      // Attempt to get data from API
      const response = await userDataManager.coordinateRequest(
        routeKey,
        componentId,
        async () => {
          const existingCache = queryClient.getQueryData(['unified-user-data', routeKey, sessionId]);
          
          return await apiService.get(routeKey, {
            noCache: true,
            retries: 2,
            timeout: 12000
          });
        }
      );
      
      console.log("useUserData - API response:", response);
      
      let normalizedData;
      
      // If API response is empty but we have token data, use that
      if ((!response || Object.keys(response).length === 0) && tokenData) {
        console.log("useUserData - Using token data as fallback");
        normalizedData = {
          id: tokenData.id || tokenData.userId || "",
          email: tokenData.username || tokenData.email || "",
          firstName: tokenData.firstName || tokenData.first_name || "",
          lastName: tokenData.lastName || tokenData.last_name || "",
          roles: tokenData.roles || [],
          // Add other defaults
          profilePictureUrl: "",
          diplomas: [],
          addresses: [],
          stats: { profile: { completionPercentage: 0 } },
          _source: "token" // Mark the source for debugging
        };
      } else if (response) {
        if (response.user && typeof response.user === 'object') {
          normalizedData = response;
        } 
        else if (response.id || response.email) {
          normalizedData = {
            ...response,
            firstName: response.firstName || response.first_name || "",
            lastName: response.lastName || response.last_name || "",
            email: response.email || "",
            profilePictureUrl: response.profilePictureUrl || response.profile_picture_url || "",
            diplomas: Array.isArray(response.diplomas) ? response.diplomas : [],
            addresses: Array.isArray(response.addresses) ? response.addresses : [],
            stats: response.stats || { profile: { completionPercentage: 0 } },
            _source: "direct" // Mark the source for debugging
          };
        }
        else if ((response.data && typeof response.data === 'object') || response.success) {
          const userData = response.data || {};
          normalizedData = {
            ...userData,
            firstName: userData.firstName || userData.first_name || "",
            lastName: userData.lastName || userData.last_name || "",
            email: userData.email || "",
            profilePictureUrl: userData.profilePictureUrl || userData.profile_picture_url || "",
            diplomas: Array.isArray(userData.diplomas) ? userData.diplomas : [],
            addresses: Array.isArray(userData.addresses) ? userData.addresses : [],
            stats: userData.stats || { profile: { completionPercentage: 0 } },
            _source: "wrapped" // Mark the source for debugging
          };
        }
        else {
          normalizedData = {
            ...response,
            _source: "unknown" // Mark the source for debugging
          };
        }
      } else {
        normalizedData = {
          firstName: "",
          lastName: "",
          email: "",
          profilePictureUrl: "",
          diplomas: [],
          addresses: [],
          stats: { profile: { completionPercentage: 0 } },
          _source: "empty" // Mark the source for debugging
        };
      }
      
      if (normalizedData) {
        try {
          localStorage.setItem('user', JSON.stringify(normalizedData));
          setLocalStorageUser(normalizedData);
        } catch (e) {
          // Error saving user data to localStorage
        }
      }
      
      setIsInitialLoading(false);
      return normalizedData;
    } catch (error) {
      setIsInitialLoading(false);
      throw error;
    }
  }, [routeKey, componentId, queryClient, sessionId]);

  const {
    data: userData,
    isLoading: isQueryLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['unified-user-data', routeKey, sessionId, isAuthenticated],
    queryFn: fetchUserData,
    initialData: getCachedData,
    enabled: enabled && !!sessionId && isAuthenticated,
    staleTime: 1 * 60 * 1000,
    cacheTime: 20 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: false,
    retry: 2,
    retryDelay: 1000,
    ...queryOptions,
    onSuccess: (data) => {
      if (data) {
        try {
          localStorage.setItem('user', JSON.stringify(data));
          setLocalStorageUser(data);
        } catch (e) {
          // Error saving user data to localStorage
        }
      }
      
      if (onSuccess) onSuccess(data);
    },
    onError: (err) => {
      if (onError) onError(err);
    }
  });

  const forceRefresh = useCallback(async () => {
    if (userDataManager.requestRegistry.getActiveRequest(routeKey)) {
      return null;
    }
    
    if (userDataManager.requestRegistry.shouldThrottleRequest(routeKey)) {
      return null;
    }
    
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
      
      queryClient.setQueryData(['unified-user-data', routeKey, sessionId], freshData);
      
      if (freshData) {
        try {
          localStorage.setItem('user', JSON.stringify(freshData));
          setLocalStorageUser(freshData);
        } catch (e) {
          // Error saving user data to localStorage
        }
      }
      
      setIsInitialLoading(false);
      return freshData;
    } catch (error) {
      setIsInitialLoading(false);
      throw error;
    }
  }, [routeKey, sessionId, queryClient, componentId]);

  const hasRole = useCallback((role) => {
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

  // Add listener for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      const newAuthState = authService.isLoggedIn();
      
      if (newAuthState !== isAuthenticated) {
        setIsAuthenticated(newAuthState);
        
        // We'll let the React Query hook handle the refetch based on auth state
        // No direct refetch call here to avoid infinite loops
      }
    };
    
    // Check auth state immediately
    handleAuthChange();
    
    // Listen for auth state changes
    window.addEventListener('auth-state-change', handleAuthChange);
    window.addEventListener('login-success', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-state-change', handleAuthChange);
      window.removeEventListener('login-success', handleAuthChange);
    };
  }, []); // Empty dependency array to ensure this only runs once

  // Améliorer la gestion des événements de mise à jour
  useEffect(() => {
    if (!enabled) return () => {};
    
    // Variable pour limiter la fréquence des requêtes
    let lastUpdateTime = Date.now();
    const UPDATE_THROTTLE_MS = 2000; // 2 secondes minimum entre les mises à jour
    let pendingUpdate = false;
    
    // S'abonner à l'événement de mise à jour avec contrôle de fréquence
    const unsubscribe = userDataManager.subscribe(USER_DATA_EVENTS.UPDATED, (updateType) => {
      // Si c'est une mise à jour de photo de profil uniquement, ne pas refetch toutes les données
      if (updateType === 'profile_picture') {
        return;
      }
      
      // Vérifier si la route est partagée entre plusieurs composants
      if (userDataManager.requestRegistry.isRouteShared(routeKey)) {
        
        // Si une requête est déjà en cours, ne pas en lancer une nouvelle
        if (userDataManager.requestRegistry.getActiveRequest(routeKey)) {
          return;
        }
      }
      
      // Vérifier si une mise à jour est déjà en attente ou si la dernière mise à jour est trop récente
      const now = Date.now();
      if (pendingUpdate || (now - lastUpdateTime < UPDATE_THROTTLE_MS)) {
        
        // Si aucune mise à jour n'est en attente, programmer une mise à jour différée
        if (!pendingUpdate) {
          pendingUpdate = true;
          setTimeout(() => {
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
    const hasNestedData = rawData.data && typeof rawData.data === 'object';
    
    // Déterminer la source des données utilisateur
    let userSource;
    if (hasNestedUser) {
      userSource = rawData.user;
    } else if (hasNestedData) {
      userSource = rawData.data;
    } else {
      userSource = rawData;
    }
    
    // Extraire les propriétés de base avec fallbacks
    const extractValue = (obj, keys, defaultValue = "") => {
      for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) {
          return obj[key];
        }
      }
      return defaultValue;
    };
    
    // Extraire et normaliser le profil étudiant 
    let studentProfile = null;
    
    // Vérifier les différentes sources possibles pour studentProfile
    if (userSource.studentProfile) {
      studentProfile = { ...userSource.studentProfile };
    } else if (rawData.studentProfile) {
      studentProfile = { ...rawData.studentProfile };
    } else if (hasNestedData && rawData.data.studentProfile) {
      studentProfile = { ...rawData.data.studentProfile };
    }
    
    // Ensure portfolioUrl is captured and preserved
    if (studentProfile) {
      // Make sure we preserve the portfolioUrl if it exists
      if (studentProfile.portfolioUrl === undefined) {
        const possibleSources = [
          userSource.studentProfile?.portfolioUrl,
          rawData.studentProfile?.portfolioUrl,
          rawData.data?.studentProfile?.portfolioUrl
        ];
        
        for (const source of possibleSources) {
          if (source !== undefined) {
            studentProfile.portfolioUrl = source;
            break;
          }
        }
      }
    }
    
    return {
      // Extraire et normaliser les propriétés utilisateur
      id: extractValue(userSource, ['id']),
      firstName: extractValue(userSource, ['firstName', 'first_name']),
      lastName: extractValue(userSource, ['lastName', 'last_name']),
      fullName: extractValue(userSource, ['fullName', 'full_name']),
      email: extractValue(userSource, ['email']),
      phoneNumber: extractValue(userSource, ['phoneNumber', 'phone_number']),
      linkedinUrl: extractValue(userSource, ['linkedinUrl', 'linkedin_url']),
      profilePictureUrl: extractValue(userSource, ['profilePictureUrl', 'profile_picture_url']),
      profilePicturePath: extractValue(userSource, ['profilePicturePath', 'profile_picture_path']),
      birthDate: extractValue(userSource, ['birthDate', 'birth_date']),
      age: extractValue(userSource, ['age'], null),
      nationality: userSource.nationality || null,
      theme: userSource.theme || null,
      roles: Array.isArray(userSource.roles) ? userSource.roles : [],
      specialization: userSource.specialization || null,
      
      // Extraire et normaliser les tableaux associés
      diplomas: Array.isArray(userSource.diplomas) ? userSource.diplomas : 
                (Array.isArray(rawData.diplomas) ? rawData.diplomas : []),
      
      addresses: Array.isArray(userSource.addresses) ? userSource.addresses : 
                 (Array.isArray(rawData.addresses) ? rawData.addresses : []),
      
      documents: Array.isArray(userSource.documents) ? userSource.documents : 
                 (Array.isArray(rawData.documents) ? rawData.documents : []),
      
      // Ajouter le profil étudiant normalisé
      studentProfile,
      
      // Statistiques utilisateur
      stats: userSource.stats || (rawData.stats || { profile: { completionPercentage: 0 } }),
      
      // Dates de création/modification
      createdAt: extractValue(userSource, ['createdAt', 'created_at']),
      updatedAt: extractValue(userSource, ['updatedAt', 'updated_at']),
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