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
    // Annuler toutes les requêtes en cours
    queryClientInstance.cancelQueries();
    
    // Vider complètement le cache
    queryClientInstance.clear();
    
    // Invalider explicitement toutes les requêtes pour s'assurer qu'elles sont rechargées
    queryClientInstance.invalidateQueries();
    
    // Réinitialiser l'état du client
    queryClientInstance.resetQueries();
    
    // Forcer un garbage collection pour libérer la mémoire
    setTimeout(() => {
      // Forcer un rafraîchissement des données après la déconnexion
      window.dispatchEvent(new CustomEvent('query-cache-cleared'));
    }, 0);
    
    return true;
  }
  // console.warn('Impossible de vider le cache: queryClient non défini');
  return false;
}; 