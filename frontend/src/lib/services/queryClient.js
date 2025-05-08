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
        // Éviter les options qui peuvent causer des conflits avec le rendu des DevTools
        // tout en gardant la configuration originale
        devtools: {
          enabled: import.meta.env.DEV
        }
      }
    },
  },
  // Enable detailed logging in development mode only
  logger: import.meta.env.DEV 
    ? {
        log: () => {},
        warn: () => {},
        error: (...args) => console.error(...args)
      }
    : {
        log: () => {},
        warn: () => {},
        error: (...args) => console.error(...args)
      }
});

// We'll initialize test data in main.jsx instead to avoid duplication
// This prevents the queryClient from being initialized multiple times

/**
 * Définit l'instance du queryClient
 * @param {Object} client - L'instance du queryClient
 * @deprecated Cette fonction est conservée pour compatibilité mais n'est plus nécessaire
 */
export const setQueryClient = (client) => {
  // Cette fonction existe pour la compatibilité avec le code existant
  // mais ne fait rien car nous utilisons déjà une instance exportée
};

/**
 * Récupère l'instance du queryClient
 * @returns {Object} - L'instance du queryClient
 */
export const getQueryClient = () => {
  return queryClient;
};
