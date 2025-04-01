import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSessionId } from '@/lib/services/authService';

// Clé pour stocker l'état déshydraté dans sessionStorage
const HYDRATION_KEY = 'APP_QUERY_CACHE';

// Configuration de l'hydratation
const HYDRATION_CONFIG = {
  // Taille maximale des données à stocker (en caractères)
  MAX_STORAGE_SIZE: 100000, // ~100KB
  // Durée de validité des données en ms (10 minutes)
  MAX_AGE: 10 * 60 * 1000,
  // Préfixes des clés à ne pas hydrater (données sensibles ou trop volumineuses)
  EXCLUDED_PREFIXES: [
    ['session', 'document'],
    ['session', 'largeData'],
    ['auth', 'sensitive']
  ],
  // Types d'endpoints à conserver en priorité
  PRIORITY_ENDPOINTS: [
    '/api/me',
    '/api/profile',
    '/api/user'
  ]
};

/**
 * Composant pour gérer la persistance du cache React Query entre navigations
 * Ce composant utilise sessionStorage pour stocker l'état déshydraté
 */
const ReactQueryHydration = ({ children }) => {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();
  
  // Hydratation initiale au chargement de la page
  useEffect(() => {
    try {
      const hydrationData = sessionStorage.getItem(HYDRATION_KEY);
      if (hydrationData) {
        const data = JSON.parse(hydrationData);
        
        // Vérifier que les données sont valides et correspondent à la session actuelle
        if (data && 
            data.sessionId === sessionId && 
            data.timestamp && 
            (Date.now() - data.timestamp < HYDRATION_CONFIG.MAX_AGE)) {
              
          // Hydrater le cache avec les données stockées
          if (data.queries && Object.keys(data.queries).length > 0) {
            Object.entries(data.queries).forEach(([stringKey, value]) => {
              try {
                const queryKey = JSON.parse(stringKey);
                queryClient.setQueryData(queryKey, value);
              } catch (e) {
                console.warn(`Failed to hydrate query with key ${stringKey}:`, e);
              }
            });
          }
          
          console.info(`[ReactQueryHydration] Hydrated ${Object.keys(data.queries || {}).length} queries`);
        } else {
          // Données obsolètes ou d'une autre session, les supprimer
          sessionStorage.removeItem(HYDRATION_KEY);
        }
      }
    } catch (error) {
      console.error('[ReactQueryHydration] Error hydrating query client:', error);
      sessionStorage.removeItem(HYDRATION_KEY);
    }
  }, [queryClient, sessionId]);
  
  // Déshydratation avant de quitter la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        // Récupérer toutes les requêtes avec des données
        const queries = queryClient.getQueryCache().getAll()
          .filter(query => 
            query.state.status === 'success' && 
            query.state.data !== undefined && 
            query.state.data !== null
          );
          
        // Limiter aux requêtes importantes si trop nombreuses
        let filteredQueries = queries;
        if (queries.length > 20) {
          filteredQueries = queries.filter(query => {
            const key = JSON.stringify(query.queryKey);
            
            // Exclure certains préfixes (données sensibles ou trop volumineuses)
            for (const prefix of HYDRATION_CONFIG.EXCLUDED_PREFIXES) {
              const stringPrefix = JSON.stringify(prefix).slice(0, -1); // Enlever le dernier ]
              if (key.startsWith(stringPrefix)) {
                return false;
              }
            }
            
            // Inclure en priorité les requêtes importantes
            for (const endpoint of HYDRATION_CONFIG.PRIORITY_ENDPOINTS) {
              if (key.includes(endpoint)) {
                return true;
              }
            }
            
            // Limiter aux requêtes avec peu de données
            return estimateSize(query.state.data) < 10 * 1024; // Max 10KB par requête
          });
        }
        
        // Créer un objet de déshydratation
        const dehydratedQueries = {};
        let totalSize = 0;
        
        // Ajouter les requêtes filtrées à l'objet de déshydratation
        for (const query of filteredQueries) {
          const keyString = JSON.stringify(query.queryKey);
          const dataSize = estimateSize(query.state.data);
          
          // Vérifier si l'ajout de cette requête ne dépasse pas la taille maximale
          if (totalSize + dataSize < HYDRATION_CONFIG.MAX_STORAGE_SIZE) {
            dehydratedQueries[keyString] = query.state.data;
            totalSize += dataSize;
          } else {
            // On a atteint la taille maximale, arrêter l'ajout
            break;
          }
        }
        
        // Sauvegarder les données dans sessionStorage
        if (Object.keys(dehydratedQueries).length > 0) {
          sessionStorage.setItem(HYDRATION_KEY, JSON.stringify({
            sessionId,
            timestamp: Date.now(),
            queries: dehydratedQueries
          }));
          
          console.info(`[ReactQueryHydration] Dehydrated ${Object.keys(dehydratedQueries).length} queries (${Math.round(totalSize / 1024)}KB)`);
        }
      } catch (error) {
        console.error('[ReactQueryHydration] Error dehydrating query client:', error);
      }
    };
    
    // Estimer la taille d'un objet en octets
    const estimateSize = (obj) => {
      try {
        const str = JSON.stringify(obj);
        return str ? str.length : 0;
      } catch (e) {
        return 0;
      }
    };
    
    // Attacher l'écouteur d'événement
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Sauvegarder en cas de démontage du composant
      handleBeforeUnload();
    };
  }, [queryClient, sessionId]);
  
  return children;
};

export default ReactQueryHydration; 