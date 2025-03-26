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
 * Vide le cache du queryClient de manière sûre
 * Cette fonction est utile pour effacer toutes les données en cache lors de la déconnexion
 * ou du changement d'utilisateur
 */
export const clearQueryCache = () => {
  if (queryClientInstance) {
    try {
      // Méthode simple et fiable qui ne cause pas de problème avec DevTools
      queryClientInstance.clear();
      
      // Déclencher un événement pour informer l'application
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('query-cache-cleared'));
      }, 0);
      
      return true;
    } catch (error) {
      console.error('Error clearing query cache:', error);
      return false;
    }
  }
  
  console.warn('Impossible de vider le cache: queryClient non défini');
  return false;
}; 