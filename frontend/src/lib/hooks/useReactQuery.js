import { QueryClient } from 'react-query';

// Configuration par défaut pour React Query
const defaultQueryOptions = {
  staleTime: 60000, // 1 minute
  cacheTime: 300000, // 5 minutes
  retry: 1,
  refetchOnWindowFocus: false
};

/**
 * Fonction utilitaire pour effectuer des requêtes avec gestion d'erreurs
 * @param {string} url - URL de la requête
 * @param {Object} options - Options de la requête
 * @returns {Promise} - Promise avec la réponse de l'API
 */
export async function fetchWithErrorHandling(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Check if the response is ok (status in the range 200-299)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`
    }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Crée des options de requête pour React Query
 * @param {Array|string} queryKey - Clé de la requête
 * @param {Object} options - Options supplémentaires
 * @returns {Object} - Options de requête
 */
export const createQueryOptions = (queryKey, options = {}) => ({
  ...defaultQueryOptions,
  ...options,
  queryKey
});

/**
 * Crée un client React Query avec une configuration optimisée
 * @returns {QueryClient} - Client React Query
 */
export function createOptimizedQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...defaultQueryOptions
      }
    }
  });
}

// Exporter d'autres fonctions et constantes utiles du hook 