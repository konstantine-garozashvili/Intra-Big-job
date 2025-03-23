// Hooks centralisés - useUserData est notre nouveau hook centralisé
export { default as useUserDataCentralized } from './useUserData';
export { useUserData } from './useDashboardQueries'; // Réexporté pour la compatibilité
export { useApiQuery, useApiMutation, useApiInfiniteQuery, usePrefetchQuery } from './useReactQuery';
export { useTeacherDashboardData, useAdminDashboardData, useStudentDashboardData, useHRDashboardData } from './useDashboardQueries';