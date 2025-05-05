import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formationTeacherService } from '../services/formationTeacher.service';
import { toast } from 'sonner';

/**
 * Hook pour gérer les enseignants des formations
 * @returns {Object} Les fonctions et données pour gérer les enseignants des formations
 */
export const useFormationTeachers = (formationId = null) => {
  const queryClient = useQueryClient();

  // Clés de requête communes
  const QUERY_KEYS = {
    ALL_TEACHERS: ['formation-teachers'],
    AVAILABLE_TEACHERS: ['available-teachers'],
    FORMATION_TEACHERS: (id) => ['formation-teachers', 'formation', id],
    STATS: ['formation-teachers-stats']
  };

  // Configuration commune pour les requêtes
  const QUERY_CONFIG = {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2
  };

  // Récupérer tous les enseignants disponibles
  const {
    data: availableTeachers = [],
    isLoading: isLoadingAvailable,
    error: availableError
  } = useQuery({
    queryKey: QUERY_KEYS.AVAILABLE_TEACHERS,
    queryFn: async () => {
      const data = await formationTeacherService.getAvailableTeachers();
      return Array.isArray(data) ? data.filter(teacher => teacher && typeof teacher === 'object') : [];
    },
    ...QUERY_CONFIG
  });

  // Récupérer toutes les relations formation-enseignant
  const {
    data: allFormationTeachers = [],
    isLoading: isLoadingAll,
    error: allError
  } = useQuery({
    queryKey: QUERY_KEYS.ALL_TEACHERS,
    queryFn: async () => {
      const data = await formationTeacherService.getAllFormationTeachers();
      return Array.isArray(data) ? data.filter(item => {
        if (!item || typeof item !== 'object') return false;
        if (!item.formation || typeof item.formation !== 'object') return false;
        if (!item.user || typeof item.user !== 'object') return false;
        return true;
      }) : [];
    },
    ...QUERY_CONFIG
  });

  // Récupérer les enseignants d'une formation spécifique si formationId est fourni
  const {
    data: formationTeachers = [],
    isLoading: isLoadingFormation,
    error: formationError
  } = useQuery({
    queryKey: QUERY_KEYS.FORMATION_TEACHERS(formationId),
    queryFn: () => formationTeacherService.getTeachersByFormation(formationId),
    enabled: !!formationId,
    ...QUERY_CONFIG
  });

  // Récupérer les statistiques
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: QUERY_KEYS.STATS,
    queryFn: () => formationTeacherService.getStats(),
    ...QUERY_CONFIG
  });

  // Fonction utilitaire pour invalider et mettre à jour le cache
  const invalidateRelatedQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_TEACHERS }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AVAILABLE_TEACHERS }),
      formationId && queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FORMATION_TEACHERS(formationId) }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STATS })
    ]);
  };

  // Mutation pour créer une relation formation-enseignant
  const createMutation = useMutation({
    mutationFn: (params) => formationTeacherService.create(params),
    onMutate: async (newTeacher) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ALL_TEACHERS });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.FORMATION_TEACHERS(newTeacher.formationId) });

      // Snapshot des données précédentes
      const previousTeachers = queryClient.getQueryData(QUERY_KEYS.ALL_TEACHERS);
      const previousFormationTeachers = queryClient.getQueryData(QUERY_KEYS.FORMATION_TEACHERS(newTeacher.formationId));

      // Mise à jour optimiste
      const optimisticTeacher = {
        id: Date.now(), // ID temporaire
        isMainTeacher: newTeacher.isMainTeacher,
        formation: { id: newTeacher.formationId },
        user: { id: newTeacher.userId }
      };

      queryClient.setQueryData(QUERY_KEYS.ALL_TEACHERS, old => {
        return [...(old || []), optimisticTeacher];
      });

      if (formationId === newTeacher.formationId) {
        queryClient.setQueryData(QUERY_KEYS.FORMATION_TEACHERS(formationId), old => {
          return [...(old || []), optimisticTeacher];
        });
      }

      return { previousTeachers, previousFormationTeachers };
    },
    onError: (error, variables, context) => {
      // Restaurer les données en cas d'erreur
      if (context?.previousTeachers) {
        queryClient.setQueryData(QUERY_KEYS.ALL_TEACHERS, context.previousTeachers);
      }
      if (context?.previousFormationTeachers) {
        queryClient.setQueryData(QUERY_KEYS.FORMATION_TEACHERS(variables.formationId), context.previousFormationTeachers);
      }
      toast.error(error.message || 'Erreur lors de l\'ajout de l\'enseignant');
    },
    onSuccess: async () => {
      toast.success('Enseignant ajouté avec succès');
      await invalidateRelatedQueries();
    }
  });

  // Mutation pour mettre à jour une relation formation-enseignant
  const updateMutation = useMutation({
    mutationFn: ({ id, isMainTeacher }) => formationTeacherService.update(id, isMainTeacher),
    onMutate: async ({ id, isMainTeacher }) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ALL_TEACHERS });
      if (formationId) {
        await queryClient.cancelQueries({ queryKey: QUERY_KEYS.FORMATION_TEACHERS(formationId) });
      }

      // Snapshot des données précédentes
      const previousTeachers = queryClient.getQueryData(QUERY_KEYS.ALL_TEACHERS);
      const previousFormationTeachers = formationId ? 
        queryClient.getQueryData(QUERY_KEYS.FORMATION_TEACHERS(formationId)) : null;

      // Mise à jour optimiste
      const updateTeacher = (teachers) => {
        if (!Array.isArray(teachers)) return teachers;
        return teachers.map(teacher => 
          teacher.id === id ? { ...teacher, isMainTeacher } : teacher
        );
      };

      queryClient.setQueryData(QUERY_KEYS.ALL_TEACHERS, updateTeacher);
      if (formationId) {
        queryClient.setQueryData(QUERY_KEYS.FORMATION_TEACHERS(formationId), updateTeacher);
      }

      return { previousTeachers, previousFormationTeachers };
    },
    onError: (error, variables, context) => {
      // Restaurer les données en cas d'erreur
      if (context?.previousTeachers) {
        queryClient.setQueryData(QUERY_KEYS.ALL_TEACHERS, context.previousTeachers);
      }
      if (context?.previousFormationTeachers) {
        queryClient.setQueryData(QUERY_KEYS.FORMATION_TEACHERS(formationId), context.previousFormationTeachers);
      }
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    },
    onSuccess: async () => {
      toast.success('Statut de l\'enseignant mis à jour avec succès');
      await invalidateRelatedQueries();
    }
  });

  // Mutation pour supprimer une relation formation-enseignant
  const deleteMutation = useMutation({
    mutationFn: (id) => formationTeacherService.delete(id),
    onMutate: async (deletedId) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ALL_TEACHERS });
      if (formationId) {
        await queryClient.cancelQueries({ queryKey: QUERY_KEYS.FORMATION_TEACHERS(formationId) });
      }

      // Snapshot des données précédentes
      const previousTeachers = queryClient.getQueryData(QUERY_KEYS.ALL_TEACHERS);
      const previousFormationTeachers = formationId ?
        queryClient.getQueryData(QUERY_KEYS.FORMATION_TEACHERS(formationId)) : null;

      // Mise à jour optimiste
      const filterTeacher = (teachers) => {
        if (!Array.isArray(teachers)) return teachers;
        return teachers.filter(teacher => teacher.id !== deletedId);
      };

      queryClient.setQueryData(QUERY_KEYS.ALL_TEACHERS, filterTeacher);
      if (formationId) {
        queryClient.setQueryData(QUERY_KEYS.FORMATION_TEACHERS(formationId), filterTeacher);
      }

      return { previousTeachers, previousFormationTeachers };
    },
    onError: (error, variables, context) => {
      // Restaurer les données en cas d'erreur
      if (context?.previousTeachers) {
        queryClient.setQueryData(QUERY_KEYS.ALL_TEACHERS, context.previousTeachers);
      }
      if (context?.previousFormationTeachers) {
        queryClient.setQueryData(QUERY_KEYS.FORMATION_TEACHERS(formationId), context.previousFormationTeachers);
      }
      toast.error(error.message || 'Erreur lors de la suppression');
    },
    onSuccess: async () => {
      toast.success('Enseignant retiré avec succès');
      await invalidateRelatedQueries();
    }
  });

  return {
    // Données
    availableTeachers,
    allFormationTeachers,
    formationTeachers: formationId ? formationTeachers : allFormationTeachers,
    stats,

    // États de chargement
    isLoading: isLoadingAvailable || isLoadingAll || isLoadingStats || isLoadingFormation,
    isLoadingAvailable,
    isLoadingAll,
    isLoadingStats,
    isLoadingFormation,

    // Erreurs
    error: availableError || allError || statsError || formationError,
    availableError,
    allError,
    statsError,
    formationError,

    // Mutations
    createTeacher: createMutation.mutate,
    updateTeacher: updateMutation.mutate,
    deleteTeacher: deleteMutation.mutate,

    // États des mutations
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}; 