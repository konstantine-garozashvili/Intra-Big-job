import { useCallback, useEffect, useRef } from 'react';
import { 
  adaptiveSetTimeout, 
  adaptiveSetInterval, 
  adaptiveDelay, 
  getPerformanceMetrics 
} from '../lib/utils/adaptiveTimeoutUtils';

/**
 * React hook for using adaptive timeouts that adjust based on machine performance
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.initializeOnMount - Whether to initialize the system on mount
 * @returns {Object} Timeout utilities that adapt to machine performance
 */
export const useAdaptiveTimeout = (options = {}) => {
  const { initializeOnMount = true } = options;
  
  // Refs to store timeout and interval IDs for cleanup
  const timeoutIds = useRef(new Set());
  const intervalIds = useRef(new Set());
  
  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      // Clean up all timeouts
      timeoutIds.current.forEach(id => clearTimeout(id));
      timeoutIds.current.clear();
      
      // Clean up all intervals
      intervalIds.current.forEach(id => clearInterval(id));
      intervalIds.current.clear();
    };
  }, []);
  
  /**
   * Creates a setTimeout that adapts to the machine's performance and cleans up on unmount
   * 
   * @param {Function} callback - The function to execute after the timeout
   * @param {number} baseDuration - The base timeout duration in milliseconds
   * @param {Object} timeoutOptions - Configuration options (min, max)
   * @returns {number} The timeout ID
   */
  const setTimeout = useCallback((callback, baseDuration, timeoutOptions = {}) => {
    const id = adaptiveSetTimeout(callback, baseDuration, timeoutOptions);
    timeoutIds.current.add(id);
    
    // Return a function to clear this specific timeout
    return () => {
      clearTimeout(id);
      timeoutIds.current.delete(id);
    };
  }, []);
  
  /**
   * Creates a setInterval that adapts to the machine's performance and cleans up on unmount
   * 
   * @param {Function} callback - The function to execute at each interval
   * @param {number} baseDuration - The base interval duration in milliseconds
   * @param {Object} intervalOptions - Configuration options (min, max)
   * @returns {number} The interval ID
   */
  const setInterval = useCallback((callback, baseDuration, intervalOptions = {}) => {
    const id = adaptiveSetInterval(callback, baseDuration, intervalOptions);
    intervalIds.current.add(id);
    
    // Return a function to clear this specific interval
    return () => {
      clearInterval(id);
      intervalIds.current.delete(id);
    };
  }, []);
  
  /**
   * Creates a promise that resolves after an adaptive timeout
   * 
   * @param {number} baseDuration - The base timeout duration in milliseconds
   * @param {Object} delayOptions - Configuration options (min, max)
   * @returns {Promise} A promise that resolves after the timeout
   */
  const delay = useCallback((baseDuration, delayOptions = {}) => {
    return adaptiveDelay(baseDuration, delayOptions);
  }, []);
  
  /**
   * Gets the current performance metrics
   * 
   * @returns {Object} The current performance metrics
   */
  const getMetrics = useCallback(() => {
    return getPerformanceMetrics();
  }, []);
  
  return {
    setTimeout,
    setInterval,
    delay,
    getMetrics
  };
};

export default useAdaptiveTimeout;
