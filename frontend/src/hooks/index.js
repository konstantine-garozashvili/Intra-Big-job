// Hooks centralisés - useUserData est notre nouveau hook centralisé
export { useUserData } from './useUserData';
export { default as useUserDataCentralized } from './useUserData';
export { useApiQuery, useApiMutation, useApiInfiniteQuery, usePrefetchQuery } from './useReactQuery';
export { useTeacherDashboardData, useAdminDashboardData, useStudentDashboardData, useHRDashboardData } from './useDashboardQueries';