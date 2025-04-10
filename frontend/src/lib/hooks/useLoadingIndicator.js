import { useEffect, useState, useCallback } from 'react';
import { resetLoadingState, setLoadingState } from '../utils/loadingUtils';

/**
 * Hook personnalisé pour gérer l'indicateur de chargement
 * @param {Object} options - Options de configuration
 * @param {boolean} options.initialState - État initial du chargement
 * @param {number} options.minimumDisplayTime - Temps minimum d'affichage en ms
 * @param {boolean} options.showDelayed - Afficher l'indicateur après un délai
 * @param {number} options.delayTime - Temps de délai avant affichage en ms
 * @returns {Object} - État et méthodes de contrôle du chargement
 */
const useLoadingIndicator = (options = {}) => {
  const {
    initialState = false,
    minimumDisplayTime = 300,
    showDelayed = true,
    delayTime = 500
  } = options;
  
  // État local pour le chargement
  const [isLoading, setIsLoading] = useState(initialState);
  
  // État pour suivre quand le chargement a commencé
  const [loadingStartTime, setLoadingStartTime] = useState(0);
  
  // État pour contrôler l'affichage après un délai
  const [shouldShow, setShouldShow] = useState(!showDelayed && initialState);
  
  // Identifiants des timeouts pour le nettoyage
  const [delayTimeoutId, setDelayTimeoutId] = useState(null);
  const [minTimeTimeoutId, setMinTimeTimeoutId] = useState(null);
  
  /**
   * Commence le chargement
   */
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setLoadingStartTime(Date.now());
    
    // Si on utilise l'affichage différé, définir un timeout
    if (showDelayed) {
      clearTimeout(delayTimeoutId);
      const timeoutId = setTimeout(() => {
        setShouldShow(true);
      }, delayTime);
      setDelayTimeoutId(timeoutId);
    } else {
      setShouldShow(true);
    }
    
    // Indiquer l'état de chargement global
    setLoadingState(true);
  }, [delayTime, delayTimeoutId, showDelayed]);
  
  /**
   * Termine le chargement en respectant le temps minimum d'affichage
   */
  const stopLoading = useCallback(() => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - loadingStartTime;
    
    // Si le temps minimum n'est pas écoulé, attendre avant de cacher
    if (elapsedTime < minimumDisplayTime) {
      const remainingTime = minimumDisplayTime - elapsedTime;
      
      clearTimeout(minTimeTimeoutId);
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setShouldShow(false);
        resetLoadingState();
      }, remainingTime);
      setMinTimeTimeoutId(timeoutId);
    } else {
      // Sinon, cacher immédiatement
      setIsLoading(false);
      setShouldShow(false);
      resetLoadingState();
    }
  }, [loadingStartTime, minimumDisplayTime, minTimeTimeoutId]);
  
  // Nettoyer les timeouts quand le composant est démonté
  useEffect(() => {
    return () => {
      clearTimeout(delayTimeoutId);
      clearTimeout(minTimeTimeoutId);
    };
  }, [delayTimeoutId, minTimeTimeoutId]);
  
  return {
    isLoading,
    isVisible: isLoading && shouldShow,
    startLoading,
    stopLoading
  };
};

export default useLoadingIndicator; 