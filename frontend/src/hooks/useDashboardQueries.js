import { useApiQuery } from './useReactQuery';
import { authService } from '@/lib/services/authService';
import { teacherService } from '@/lib/services/teacherService';
import apiService from '@/lib/services/apiService';

/**
 * Hook pour récupérer les données utilisateur avec React Query
 * @returns {Object} - Données utilisateur et état de la requête
 */
export const useUserData = () => {
  return useApiQuery('/me', 'user-data', {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    select: (data) => {
      // Extraire l'objet utilisateur si la réponse contient un objet "user"
      return data.user || data;
    }
  });
};

/**
 * Hook pour récupérer les données du dashboard enseignant avec React Query
 * @returns {Object} - Données du dashboard enseignant et état de la requête
 */
export const useTeacherDashboardData = () => {
  // Utiliser useApiQuery pour récupérer les données utilisateur
  const userQuery = useUserData();
  
  // Utiliser useApiQuery pour récupérer les données du dashboard enseignant
  const dashboardQuery = useApiQuery(
    '/teacher/dashboard', 
    'teacher-dashboard', 
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      enabled: !!userQuery.data, // Ne déclencher la requête que si les données utilisateur sont disponibles
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
  // Utiliser useApiQuery pour récupérer les données utilisateur
  const userQuery = useUserData();
  
  // Utiliser useApiQuery pour récupérer la liste des utilisateurs
  const usersQuery = useApiQuery(
    '/users', 
    'admin-users', 
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
      enabled: !!userQuery.data, // Ne déclencher la requête que si les données utilisateur sont disponibles
    }
  );
  
  return {
    user: userQuery.data,
    users: usersQuery.data?.data || [],
    isLoading: userQuery.isLoading || usersQuery.isLoading,
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
  // Utiliser useApiQuery pour récupérer les données utilisateur
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
  // Utiliser useApiQuery pour récupérer les données utilisateur
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