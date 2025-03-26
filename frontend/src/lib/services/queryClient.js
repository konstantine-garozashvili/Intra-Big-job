/**
 * Ce fichier exporte le queryClient pour pouvoir l'utiliser dans les hooks
 */

import { QueryClient } from '@tanstack/react-query';

// Configuration du QueryClient avec des options par défaut optimisées
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      logging: false, // Disable query logging in console
    },
  },
  logger: {
    log: () => {},
    warn: () => {},
    error: () => {}
  }
});

/**
 * Définit l'instance du queryClient
 * @param {Object} client - L'instance du queryClient
 * @deprecated Cette fonction est conservée pour compatibilité mais n'est plus nécessaire
 */
export const setQueryClient = (client) => {
  // Cette fonction existe pour la compatibilité avec le code existant
  // mais ne fait rien car nous utilisons déjà une instance exportée
  console.debug('setQueryClient called, but no action needed as queryClient is already initialized');
};

/**
 * Récupère l'instance du queryClient
 * @returns {Object} - L'instance du queryClient
 */
export const getQueryClient = () => {
  return queryClient;
};