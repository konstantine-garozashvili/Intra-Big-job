import { useApiQuery } from './useReactQuery';
import { authService, getSessionId } from '@/lib/services/authService';
import { teacherService } from '@/lib/services/teacherService';
import apiService from '@/lib/services/apiService';
import { getQueryClient } from '@/lib/services/queryClient';
import useUserDataHook from './useUserData';

/**
 * Hook pour récupérer les données utilisateur avec React Query
 * @returns {Object} - Données utilisateur et état de la requête
 * @deprecated Utiliser le hook useUserData à la place
 */
export const useUserData = () => {
  // Utiliser notre nouveau hook centralisé avec le nom renommé
  const userData = useUserDataHook();
  
  // Retourner une structure compatible avec l'ancien hook
  return {
    data: userData.user,
    isLoading: userData.isLoading,
    isError: userData.isError,
    error: userData.error,
    refetch: userData.refetch,
    // Maintenir d'autres propriétés pour la rétrocompatibilité
    isFetching: userData.isLoading,
    isSuccess: !userData.isError && !userData.isLoading && !!userData.user,
  };
};

/**
 * Hook pour récupérer les données du dashboard formateur avec React Query
 * @returns {Object} - Données du dashboard formateur et état de la requête
 */
export const useTeacherDashboardData = () => {
  // Utiliser notre propre hook useUserData exporté ci-dessus (pas le hook importé)
  const userQuery = useUserData();
  const sessionId = getSessionId();
  
  // Utiliser useApiQuery pour récupérer les données du dashboard formateur
  const dashboardQuery = useApiQuery(
    '/teacher/dashboard', 
    ['teacher-dashboard', sessionId], 
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Toujours refetch au montage pour garantir des données fraîches
      refetchOnReconnect: false,
      // Utiliser initialData pour éviter l'affichage de chargement si possible
      initialData: () => {
        try {
          // Vérifier si des données sont déjà en cache
          const cachedData = getQueryClient().getQueryData(['teacher-dashboard', sessionId]);
          if (cachedData) return cachedData;
          return undefined;
        } catch (e) {
          return undefined;
        }
      },
      // Ne déclencher la requête que si les données utilisateur sont disponibles
      enabled: !!userQuery.data,
      // Fonction personnalisée pour récupérer les données du dashboard
      queryFn: async () => {
        try {
          // Pour l'instant, utiliser le service mock
          return await teacherService.getDashboardData();
        } catch (error) {
          throw error;
        }
      }
    }
  );
  
  return {
    user: userQuery.data,
    dashboardData: dashboardQuery.data,
    isLoading: userQuery.isLoading || dashboardQuery.isLoading,
    isError: userQuery.isError || dashboardQuery.isError,
    error: userQuery.error || dashboardQuery.error,
    refetch: () => {
      userQuery.refetch();
      dashboardQuery.refetch();
    }
  };
};

/**
 * Hook pour récupérer les données du dashboard administrateur avec React Query
 * @returns {Object} - Données du dashboard administrateur et état de la requête
 */
export const useAdminDashboardData = () => {
  const sessionId = getSessionId();
  
  // Get minimal user data from token if available
  const getMinimalUserData = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
    return null;
  };
  
  // Use minimal user data from token while full data loads
  const minimalUserData = getMinimalUserData();
  
  // S'assurer que le token est disponible
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  // Utiliser useApiQuery pour récupérer la liste des utilisateurs
  const usersQuery = useApiQuery(
    '/users', 
    ['admin-users', sessionId], 
    {
      staleTime: 10 * 60 * 1000, // 10 minutes (augmenté)
      cacheTime: 30 * 60 * 1000, // 30 minutes (augmenté)
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Toujours refetch au montage pour garantir des données fraîches
      refetchOnReconnect: false,
      // Utiliser initialData pour éviter l'affichage de chargement si possible
      initialData: () => {
        try {
          // Vérifier si des données sont déjà en cache
          const cachedData = getQueryClient().getQueryData(['admin-users', sessionId]);
          if (cachedData) return cachedData;
          return undefined;
        } catch (e) {
          return undefined;
        }
      },
      // N'activer la requête que si l'utilisateur est authentifié
      enabled: isAuthenticated,
      // Add a timeout to prevent hanging
      retry: 1,
      retryDelay: 1000,
      timeout: 4000, // Réduit de 8000ms à 4000ms
    }
  );
  
  // Load full user data in parallel
  const userQuery = useApiQuery('/api/me', ['user-data', sessionId], {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 1000,
    timeout: 4000, // Réduit de 8000ms à 4000ms
    // N'activer la requête que si l'utilisateur est authentifié
    enabled: isAuthenticated,
    select: (data) => {
      return data.user || data;
    }
  });
  
  return {
    // Use minimal user data as fallback if full data is still loading
    user: userQuery.data || minimalUserData,
    users: usersQuery.data?.data || [],
    isLoading: (userQuery.isLoading && !minimalUserData) || usersQuery.isLoading,
    isError: userQuery.isError || usersQuery.isError,
    error: userQuery.error || usersQuery.error,
    refetch: () => {
      userQuery.refetch();
      usersQuery.refetch();
    }
  };
};

/**
 * Hook pour récupérer les données du dashboard étudiant avec React Query
 * @returns {Object} - Données du dashboard étudiant et état de la requête
 */
export const useStudentDashboardData = () => {
  // Utiliser notre propre hook useUserData exporté ci-dessus (pas le hook importé)
  const userQuery = useUserData();
  
  // Pour l'instant, nous n'avons pas de données spécifiques à récupérer pour le dashboard étudiant
  // Mais nous pouvons préparer la structure pour les futures requêtes
  
  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
    refetch: () => {
      userQuery.refetch();
    }
  };
};

/**
 * Hook pour récupérer les données du dashboard RH avec React Query
 * @returns {Object} - Données du dashboard RH et état de la requête
 */
export const useHRDashboardData = () => {
  // Utiliser notre propre hook useUserData exporté ci-dessus (pas le hook importé)
  const userQuery = useUserData();
  
  // Pour l'instant, nous n'avons pas de données spécifiques à récupérer pour le dashboard RH
  // Mais nous pouvons préparer la structure pour les futures requêtes
  
  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
    refetch: () => {
      userQuery.refetch();
    }
  };
}; 