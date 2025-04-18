/**
 * Service de déduplication pour les requêtes API
 * Intégration avec React Query, apiService et userDataManager
 */

import { getSessionId } from './authService';
import { getQueryClient } from './queryClient';
import apiService from './apiService';

// Map des requêtes en cours pour la déduplication
const pendingRequests = new Map();

// Statistics for monitoring
const stats = {
  deduplicatedRequests: 0,
  totalRequests: 0,
  savedRequests: 0
};

// Configuration
const CONFIG = {
  // Time to keep entries in the deduplication map (ms)
  DEDUPLICATION_ENTRY_TTL: 10000, // 10 seconds
  // Maximum parallel requests for the same endpoint
  MAX_PARALLEL_REQUESTS: 3,
  // Debug mode
  DEBUG: import.meta.env.DEV || false
};

/**
 * Génère une clé unique pour une requête
 * @param {string} endpoint - L'endpoint de l'API
 * @param {Array|string} queryKey - La clé de la requête React Query
 * @param {Object} params - Paramètres additionnels (optionnel)
 * @returns {string} - Clé unique pour cette requête
 */
const generateRequestKey = (endpoint, queryKey, params = {}) => {
  const finalQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  const sessionId = getSessionId();
  
  // Pour les endpoints critiques, inclure les paramètres dans la clé
  const isCriticalEndpoint = 
    endpoint.includes('/profile') || 
    endpoint.includes('/me') || 
    endpoint.includes('/user');
  
  const paramsKey = isCriticalEndpoint && params ? 
    JSON.stringify(params) : 
    '';
  
  return `${sessionId}:${endpoint}:${finalQueryKey.join(':')}${paramsKey ? `:${paramsKey}` : ''}`;
};

/**
 * Service de déduplication des requêtes API
 */
const deduplicationService = {
  /**
   * Enregistre une requête en cours et renvoie une promesse
   * @param {string} endpoint - L'endpoint de l'API
   * @param {Array|string} queryKey - La clé de la requête React Query
   * @param {Function} queryFn - La fonction qui effectue la requête
   * @param {Object} options - Options supplémentaires (staleTime, etc.)
   * @returns {Promise} - La promesse de la requête (nouvelle ou existante)
   */
  executeOrDeduplicateQuery: async (endpoint, queryKey, queryFn, options = {}) => {
    const requestKey = generateRequestKey(endpoint, queryKey, options.params);
    stats.totalRequests++;
    
    // Vérifier si une requête identique est déjà en cours
    if (pendingRequests.has(requestKey)) {
      stats.deduplicatedRequests++;
      if (CONFIG.DEBUG) {
        console.info(`[Deduplication] Reusing existing request for: ${endpoint}`);
      }
      return pendingRequests.get(requestKey);
    }
    
    // Créer une nouvelle promesse
    const promise = new Promise(async (resolve, reject) => {
      try {
        // Exécuter la requête
        const data = await queryFn();
        
        // Stocker dans le cache de React Query
        const queryClient = getQueryClient();
        const sessionId = getSessionId();
        const finalQueryKey = Array.isArray(queryKey) ? 
          ['session', sessionId, ...queryKey] : 
          ['session', sessionId, queryKey];
        
        queryClient.setQueryData(finalQueryKey, data);
        
        // Résoudre la promesse avec les données
        resolve(data);
      } catch (error) {
        reject(error);
      } finally {
        // Supprimer la requête de la map après un délai pour éviter les requêtes en rafale
        setTimeout(() => {
          pendingRequests.delete(requestKey);
        }, 500);
      }
    });
    
    // Ajouter la promesse à la map des requêtes en cours
    pendingRequests.set(requestKey, promise);
    
    // Programmer l'expiration de l'entrée
    setTimeout(() => {
      if (pendingRequests.has(requestKey)) {
        pendingRequests.delete(requestKey);
      }
    }, CONFIG.DEDUPLICATION_ENTRY_TTL);
    
    return promise;
  },
  
  /**
   * Vérifie si des données sont présentes dans le cache pour une clé donnée
   * @param {Array|string} queryKey - La clé de la requête
   * @returns {boolean} - true si les données sont dans le cache, false sinon
   */
  hasCache: (queryKey) => {
    const sessionId = getSessionId();
    const queryClient = getQueryClient();
    const finalQueryKey = Array.isArray(queryKey) ? 
      ['session', sessionId, ...queryKey] : 
      ['session', sessionId, queryKey];
    
    const data = queryClient.getQueryData(finalQueryKey);
    return !!data;
  },
  
  /**
   * Exécute ou réutilise une requête API existante en gérant les doublons
   * @param {string} endpoint - L'endpoint de l'API
   * @param {string} method - La méthode HTTP (get, post, put, delete)
   * @param {Object} params - Les paramètres de la requête
   * @param {Object} options - Options supplémentaires pour la requête
   * @returns {Promise} - La promesse de la requête
   */
  executeRequest: async (endpoint, method = 'get', params = {}, options = {}) => {
    const requestKey = `${method}:${endpoint}:${JSON.stringify(params)}`;
    
    // Vérifier si une requête identique est déjà en cours
    if (pendingRequests.has(requestKey)) {
      stats.savedRequests++;
      if (CONFIG.DEBUG) {
        console.info(`[Deduplication] Reusing existing ${method.toUpperCase()} request for: ${endpoint}`);
      }
      return pendingRequests.get(requestKey);
    }
    
    // Créer une nouvelle promesse
    const promise = new Promise(async (resolve, reject) => {
      try {
        let response;
        
        switch (method.toLowerCase()) {
          case 'get':
            response = await apiService.get(endpoint, { ...options, params });
            break;
          case 'post':
            response = await apiService.post(endpoint, params, options);
            break;
          case 'put':
            response = await apiService.put(endpoint, params, options);
            break;
          case 'delete':
            response = await apiService.delete(endpoint, { ...options, data: params });
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
        
        resolve(response);
      } catch (error) {
        reject(error);
      } finally {
        // Supprimer la requête de la map après un court délai
        setTimeout(() => {
          pendingRequests.delete(requestKey);
        }, 300);
      }
    });
    
    // Ajouter la promesse à la map des requêtes en cours
    pendingRequests.set(requestKey, promise);
    
    // Programmer l'expiration de l'entrée
    setTimeout(() => {
      pendingRequests.delete(requestKey);
    }, CONFIG.DEDUPLICATION_ENTRY_TTL);
    
    return promise;
  },
  
  /**
   * Invalide une entrée dans le cache de déduplication
   * @param {string} endpoint - L'endpoint à invalider
   */
  invalidateRequest: (endpoint) => {
    // Supprimer toutes les entrées correspondant à cet endpoint
    for (const [key, value] of pendingRequests.entries()) {
      if (key.includes(endpoint)) {
        pendingRequests.delete(key);
      }
    }
  },
  
  /**
   * Retourne les statistiques de déduplication
   * @returns {Object} - Les statistiques
   */
  getStats: () => {
    return {
      ...stats,
      // Calculer le pourcentage de requêtes économisées
      savedRequestsPercentage: stats.totalRequests > 0 
        ? Math.round((stats.deduplicatedRequests / stats.totalRequests) * 100) 
        : 0,
      // Nombre de requêtes en cours
      pendingRequestsCount: pendingRequests.size
    };
  },
  
  /**
   * Efface toutes les requêtes en cours
   * Utile lors de la déconnexion
   */
  clear: () => {
    pendingRequests.clear();
  }
};

export default deduplicationService; 