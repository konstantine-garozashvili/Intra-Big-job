/**
 * Utilitaire pour accéder au queryClient global
 * Ce fichier permet d'accéder au queryClient depuis n'importe où dans l'application
 */

// Variable pour stocker l'instance du queryClient
let queryClientInstance = null;

/**
 * Définit l'instance du queryClient
 * @param {Object} client - Instance du queryClient
 */
export const setQueryClient = (client) => {
  queryClientInstance = client;
};

/**
 * Récupère l'instance du queryClient
 * @returns {Object|null} - Instance du queryClient ou null si non définie
 */
export const getQueryClient = () => {
  return queryClientInstance;
};

/**
 * Vide le cache du queryClient
 * Cette fonction est utile pour effacer toutes les données en cache lors de la déconnexion
 */
export const clearQueryCache = () => {
  if (queryClientInstance) {
    // console.log('Vidage du cache React Query...');
    queryClientInstance.clear();
    return true;
  }
  // console.warn('Impossible de vider le cache: queryClient non défini');
  return false;
}; 