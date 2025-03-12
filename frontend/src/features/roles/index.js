// Export context and hooks
export { RoleProvider, useRoles, ROLES } from './roleContext';
export { useRolePermissions, useRoleUI } from './useRolePermissions';
export { default as RoleGuard } from './RoleGuard';

// Export a function to initialize the roles feature
export const initializeRoles = (queryClient) => {
  // You can add any initialization logic here if needed
  // For example, prefetching role data
  
  return {
    // Return any methods that might be useful for initialization
    invalidateRoles: () => queryClient.invalidateQueries({ queryKey: ['userRoles'] }),
    clearRoles: () => queryClient.removeQueries({ queryKey: ['userRoles'] }),
  };
}; 