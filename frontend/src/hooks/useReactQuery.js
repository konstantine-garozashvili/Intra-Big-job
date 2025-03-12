import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Configuration de base pour les requêtes API
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Normalise une URL d'API
 * @param {string} path - Le chemin de l'API
 * @returns {string} - L'URL complète normalisée
 */
const normalizeApiUrl = (path) => {
  // Supprimer le "/api" à la fin de baseUrl si path commence par "/api"
  if (path.startsWith('/api')) {
    return `${API_URL.replace(/\/api$/, '')}${path}`;
  } 
  
  // Ajouter un "/" si nécessaire
  return `${API_URL}${API_URL.endsWith('/') || path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Hook pour effectuer des requêtes GET avec mise en cache
 * @param {string} endpoint - Endpoint de l'API
 * @param {Array|string} queryKey - Clé pour identifier la requête dans le cache
 * @param {Object} options - Options supplémentaires pour useQuery
 * @returns {Object} - Résultat de useQuery
 */
export function useApiQuery(endpoint, queryKey, options = {}) {
  const finalQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  
  return useQuery({
    queryKey: finalQueryKey,
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token'); // Adapter selon votre gestion d'authentification
        const response = await axios.get(normalizeApiUrl(endpoint), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    ...options
  });
}

/**
 * Hook pour effectuer des requêtes POST/PUT/DELETE avec invalidation du cache
 * @param {string} endpoint - Endpoint de l'API
 * @param {string} method - Méthode HTTP (post, put, delete)
 * @param {Array|string} invalidateQueryKey - Clé à invalider après mutation
 * @param {Object} options - Options supplémentaires pour useMutation
 * @returns {Object} - Résultat de useMutation
 */
export function useApiMutation(endpoint, method = 'post', invalidateQueryKey, options = {}) {
  const queryClient = useQueryClient();
  const finalInvalidateKey = Array.isArray(invalidateQueryKey) ? invalidateQueryKey : [invalidateQueryKey];
  
  return useMutation({
    mutationFn: async (data) => {
      try {
        const token = localStorage.getItem('token'); // Adapter selon votre gestion d'authentification
        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        };
        
        // Pour les requêtes multipart/form-data, ne pas définir Content-Type
        // car axios le fera automatiquement avec la boundary correcte
        if (!(data instanceof FormData)) {
          headers['Content-Type'] = 'application/json';
        }
        
        // Determine the actual endpoint URL
        let finalEndpoint = endpoint;
        
        // If endpoint is a function, call it with the data to get the dynamic endpoint
        if (typeof endpoint === 'function') {
          finalEndpoint = endpoint(data);
        }
        
        // For DELETE requests with an ID, append the ID to the endpoint if it's a simple value
        if (method.toLowerCase() === 'delete' && typeof data !== 'object' && finalEndpoint === endpoint) {
          finalEndpoint = `${finalEndpoint}/${data}`;
        }
        
        // Handle different HTTP methods appropriately
        let response;
        
        if (method.toLowerCase() === 'delete') {
          // Pour les requêtes DELETE, ajouter des options supplémentaires
          response = await axios.delete(
            normalizeApiUrl(finalEndpoint),
            { 
              headers,
              data: typeof data === 'object' ? data : {}, // Only pass data object if it's an object
              timeout: 10000 // Timeout de 10 secondes
            }
          );
        } else if (method.toLowerCase() === 'get') {
          // Pour les requêtes GET, utiliser params au lieu du corps
          response = await axios.get(
            normalizeApiUrl(finalEndpoint),
            { 
              params: data,
              headers,
              timeout: 10000
            }
          );
        } else {
          // Pour les requêtes POST, PUT, PATCH
          response = await axios[method.toLowerCase()](
            normalizeApiUrl(finalEndpoint),
            data,
            { 
              headers,
              timeout: 10000
            }
          );
        }
        
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalider les requêtes associées pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: finalInvalidateKey });
      
      // Appeler onSuccess des options si défini
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options
  });
}

/**
 * Hook pour la pagination infinie
 * @param {string} endpoint - Endpoint de l'API
 * @param {Array|string} queryKey - Clé pour identifier la requête dans le cache
 * @param {Function} getNextPageParam - Fonction pour obtenir le paramètre de la page suivante
 * @param {Object} options - Options supplémentaires pour useInfiniteQuery
 * @returns {Object} - Résultat de useInfiniteQuery
 */
export function useApiInfiniteQuery(endpoint, queryKey, getNextPageParam, options = {}) {
  const finalQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  
  return useInfiniteQuery({
    queryKey: finalQueryKey,
    queryFn: async ({ pageParam }) => {
      try {
        const token = localStorage.getItem('token'); // Adapter selon votre gestion d'authentification
        const url = normalizeApiUrl(endpoint);
        const separator = url.includes('?') ? '&' : '?';
        const paginatedUrl = pageParam ? `${url}${separator}${pageParam}` : url;
        
        const response = await axios.get(paginatedUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    getNextPageParam,
    ...options
  });
}

/**
 * Hook pour précharger des données dans le cache
 * @param {string} endpoint - Endpoint de l'API
 * @param {Array|string} queryKey - Clé pour identifier la requête dans le cache
 */
export function usePrefetchQuery(endpoint, queryKey) {
  const queryClient = useQueryClient();
  const finalQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  
  const prefetch = async () => {
    try {
      await queryClient.prefetchQuery({
        queryKey: finalQueryKey,
        queryFn: async () => {
          const token = localStorage.getItem('token'); // Adapter selon votre gestion d'authentification
          const response = await axios.get(normalizeApiUrl(endpoint), {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          return response.data;
        }
      });
    } catch (error) {
      // Silently handle error
    }
  };
  
  return { prefetch };
} 