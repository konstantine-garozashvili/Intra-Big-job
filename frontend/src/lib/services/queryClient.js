/**
 * Ce fichier exporte le queryClient pour pouvoir l'utiliser dans les hooks
 */

let queryClient = null;

/**
 * Définit l'instance du queryClient
 * @param {Object} client - L'instance du queryClient
 */
export const setQueryClient = (client) => {
  queryClient = client;
};

/**
 * Récupère l'instance du queryClient
 * @returns {Object} - L'instance du queryClient
 */
export const getQueryClient = () => {
  return queryClient;
};

export { queryClient }; 