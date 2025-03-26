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
      gcTime: 10 * 60 * 1000, // 10 minutes before garbage collection
      // Enable detailed logging in development mode
      logging: import.meta.env.DEV,
      // Track queries in devtools
      meta: {
        tracked: true,
        devtools: {
          enabled: import.meta.env.DEV,
          position: 'bottom',
          initialIsOpen: true,
          layout: 'horizontal'
        }
      }
    },
  },
  // Enable detailed logging in development mode only
  logger: import.meta.env.DEV 
    ? {
        log: (...args) => console.log('[ReactQuery]', ...args),
        warn: (...args) => console.warn('[ReactQuery]', ...args),
        error: (...args) => console.error('[ReactQuery]', ...args)
      }
    : {
        log: () => {},
        warn: () => {},
        error: (...args) => console.error(...args)
      }
});

// Initialize the queryClient with some test data for debugging
if (import.meta.env.DEV) {
  // Add a test query that stays active
  queryClient.setQueryData(['persistent-test-query'], {
    message: 'React Query is working!',
    timestamp: new Date().toISOString(),
    status: 'active'
  });

  // Add a test mutation
  queryClient.setQueryData(['persistent-mutation'], {
    message: 'Mutation example',
    status: 'idle'
  });

  // Add a test error state
  queryClient.setQueryData(['error-test-query'], {
    message: 'Error state example',
    status: 'error'
  });
}

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