import { useApiQuery } from './useReactQuery';
import { authService, getSessionId } from '@/lib/services/authService';
import { teacherService } from '@/lib/services/teacherService';
import apiService from '@/lib/services/apiService';
import { getQueryClient } from '@/lib/services/queryClient';
import useUserDataHook from './useUserData';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook pour récupérer et gérer les données de l'utilisateur
 * Optimisé pour éviter les problèmes d'affichage intermittent
 */
export const useUserData = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      console.log("useUserData - Starting user data fetch");
      try {
        // Récupérer les données complètes de l'utilisateur
        console.log("useUserData - Calling authService.getCurrentUser()");
        const userData = await authService.getCurrentUser();
        console.log("useUserData - Received user data:", userData);
        return userData;
      } catch (error) {
        console.error("useUserData - Error fetching user data:", error);
        
        // En cas d'erreur, essayer de récupérer les données minimales du localStorage
        try {
          console.log("useUserData - Attempting to get minimal data from localStorage");
          const minimalData = authService.getMinimalUserData();
          console.log("useUserData - Minimal data from localStorage:", minimalData);
          if (minimalData) {
            return minimalData;
          }
        } catch (localError) {
          console.error("useUserData - Error retrieving minimal data:", localError);
        }
        
        // Si toutes les tentatives échouent, propager l'erreur
        throw error;
      }
    },
    // Paramètres optimisés pour la stabilité et la performance
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 60 * 60 * 1000, // 1 heure
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    onSuccess: (data) => {
      console.log("useUserData - Success callback with data:", data);
    },
    onError: (error) => {
      console.error("useUserData - Error callback:", error);
    }
  });
};

/**
 * Hook pour récupérer les statistiques du tableau de bord
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // TODO: Implémenter l'appel API pour récupérer les statistiques
      return {
        totalStudents: 120,
        activeFormations: 8,
        completionRate: 85,
        upcomingEvents: 3
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook pour récupérer les activités récentes
 */
export const useRecentActivities = () => {
  return useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      // TODO: Implémenter l'appel API pour récupérer les activités récentes
      return [
        {
          id: 1,
          type: 'formation',
          title: 'Développement Web Avancé',
          date: new Date(Date.now() - 3600000),
          status: 'completed'
        },
        {
          id: 2,
          type: 'course',
          title: 'Introduction à React',
          date: new Date(Date.now() - 86400000),
          status: 'in-progress'
        },
        {
          id: 3,
          type: 'assignment',
          title: 'Projet Final JavaScript',
          date: new Date(Date.now() - 172800000),
          status: 'pending'
        }
      ];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
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
  const sessionId = getSessionId();
  
  // Get minimal user data from token if available
  const getMinimalUserData = () => {
    try {
      return authService.getMinimalUserData();
    } catch (e) {
      console.error('Error retrieving minimal user data:', e);
    }
    return null;
  };
  
  // Use minimal user data from localStorage while full data loads
  const minimalUserData = getMinimalUserData();
  
  // S'assurer que le token est disponible
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  // Load full user data
  const userQuery = useApiQuery('/api/me', ['user-data-hr', sessionId], {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 1000,
    timeout: 4000,
    // N'activer la requête que si l'utilisateur est authentifié
    enabled: isAuthenticated,
    select: (data) => {
      return data.user || data;
    },
    // Utiliser initialData pour éviter l'affichage de chargement si possible
    initialData: () => {
      // Si nous avons des données minimales, les utiliser comme initialData
      if (minimalUserData) return minimalUserData;
      
      try {
        // Vérifier si des données sont déjà en cache
        const cachedData = getQueryClient().getQueryData(['user-data-hr', sessionId]);
        if (cachedData) return cachedData;
        return undefined;
      } catch (e) {
        return undefined;
      }
    }
  });
  
  // Pour l'instant, nous n'avons pas de données spécifiques supplémentaires à récupérer pour le dashboard HR
  // Mais la structure est prête pour les futures extensions
  
  return {
    // Use minimal user data as fallback if full data is still loading
    user: userQuery.data || minimalUserData,
    isLoading: userQuery.isLoading && !minimalUserData,
    isError: userQuery.isError,
    error: userQuery.error,
    refetch: () => {
      userQuery.refetch();
    }
  };
}; 