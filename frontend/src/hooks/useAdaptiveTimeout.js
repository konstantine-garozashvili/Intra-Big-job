import { useCallback, useEffect, useRef, useMemo } from 'react';
import { 
  adaptiveSetTimeout, 
  adaptiveSetInterval, 
  adaptiveDelay, 
  getPerformanceMetrics,
  isSlowDevice,
  getDeviceType,
  getConnectionType
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
  
  // Get device information for optimizations
  const deviceInfo = useMemo(() => ({
    isSlowDevice: isSlowDevice(),
    deviceType: getDeviceType(),
    connectionType: getConnectionType(),
    performanceMetrics: getPerformanceMetrics()
  }), []);
  
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
   * @param {Object} timeoutOptions - Configuration options
   * @param {number} timeoutOptions.min - Minimum timeout duration
   * @param {number} timeoutOptions.max - Maximum timeout duration
   * @param {boolean} timeoutOptions.prioritizeSpeed - If true, prioritize speed over reliability
   * @returns {Function} Function to clear this specific timeout
   */
  const setTimeout = useCallback((callback, baseDuration, timeoutOptions = {}) => {
    // For UI operations on mobile, prioritize speed by default
    const isMobileUI = deviceInfo.deviceType === 'mobile' && !timeoutOptions.hasOwnProperty('prioritizeSpeed');
    const options = {
      ...timeoutOptions,
      // For UI operations on mobile, prioritize speed by default unless explicitly set
      prioritizeSpeed: isMobileUI ? true : timeoutOptions.prioritizeSpeed
    };
    
    const id = adaptiveSetTimeout(callback, baseDuration, options);
    timeoutIds.current.add(id);
    
    // Return a function to clear this specific timeout
    return () => {
      clearTimeout(id);
      timeoutIds.current.delete(id);
    };
  }, [deviceInfo.deviceType]);
  
  /**
   * Creates a setInterval that adapts to the machine's performance and cleans up on unmount
   * 
   * @param {Function} callback - The function to execute at each interval
   * @param {number} baseDuration - The base interval duration in milliseconds
   * @param {Object} intervalOptions - Configuration options
   * @param {number} intervalOptions.min - Minimum interval duration
   * @param {number} intervalOptions.max - Maximum interval duration
   * @param {boolean} intervalOptions.prioritizeSpeed - If true, prioritize speed over reliability
   * @returns {Function} Function to clear this specific interval
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
   * @param {Object} delayOptions - Configuration options
   * @param {number} delayOptions.min - Minimum delay duration
   * @param {number} delayOptions.max - Maximum delay duration
   * @param {boolean} delayOptions.prioritizeSpeed - If true, prioritize speed over reliability
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
  
  /**
   * Checks if the current device is a slow device
   * 
   * @returns {boolean} Whether the device is considered slow
   */
  const checkIsSlowDevice = useCallback(() => {
    return deviceInfo.isSlowDevice;
  }, [deviceInfo.isSlowDevice]);
  
  /**
   * Gets the current device type
   * 
   * @returns {string} The device type ('desktop', 'mobile', or 'tablet')
   */
  const getDevice = useCallback(() => {
    return deviceInfo.deviceType;
  }, [deviceInfo.deviceType]);
  
  /**
   * Gets the current connection type
   * 
   * @returns {string} The connection type
   */
  const getConnection = useCallback(() => {
    return deviceInfo.connectionType;
  }, [deviceInfo.connectionType]);
  
  /**
   * Creates a progressive enhancement strategy based on device capabilities
   * 
   * @param {Object} options - Configuration options
   * @param {Function} options.minimal - Function to render minimal UI
   * @param {Function} options.standard - Function to render standard UI
   * @param {Function} options.enhanced - Function to render enhanced UI
   * @param {number} options.standardDelay - Delay before upgrading to standard UI (default: 100ms)
   * @param {number} options.enhancedDelay - Delay before upgrading to enhanced UI (default: 500ms)
   * @returns {Object} Progressive enhancement utilities
   */
  const createProgressiveStrategy = useCallback((options = {}) => {
    const {
      minimal,
      standard,
      enhanced,
      standardDelay = 100,
      enhancedDelay = 500
    } = options;
    
    // Determine the appropriate strategy based on device capabilities
    const strategy = {
      // Initial render - always use minimal for fast initial load
      initial: minimal,
      
      // Upgrade to standard UI after a delay
      upgradeToStandard: (callback) => {
        // For slow devices, use a longer delay
        const delay = deviceInfo.isSlowDevice ? standardDelay * 2 : standardDelay;
        
        return setTimeout(() => {
          if (standard && typeof standard === 'function') {
            standard();
          }
          if (callback && typeof callback === 'function') {
            callback();
          }
        }, delay, { prioritizeSpeed: true });
      },
      
      // Upgrade to enhanced UI after a longer delay
      upgradeToEnhanced: (callback) => {
        // Skip enhanced UI on very slow devices
        if (deviceInfo.isSlowDevice && deviceInfo.connectionType === 'slow-2g') {
          if (callback && typeof callback === 'function') {
            callback(false); // Indicate enhancement was skipped
          }
          return () => {}; // Return empty cleanup function
        }
        
        // For slow devices, use a much longer delay or skip entirely
        const delay = deviceInfo.isSlowDevice ? enhancedDelay * 3 : enhancedDelay;
        
        return setTimeout(() => {
          if (enhanced && typeof enhanced === 'function') {
            enhanced();
          }
          if (callback && typeof callback === 'function') {
            callback(true); // Indicate enhancement was applied
          }
        }, delay, { prioritizeSpeed: false });
      },
      
      // Check if we should skip enhanced features entirely
      shouldSkipEnhancement: () => {
        return deviceInfo.isSlowDevice && 
               (deviceInfo.connectionType === 'slow-2g' || deviceInfo.performanceMetrics.adjustmentFactor > 3);
      }
    };
    
    return strategy;
  }, [deviceInfo, setTimeout]);
  
  return {
    setTimeout,
    setInterval,
    delay,
    getMetrics,
    isSlowDevice: checkIsSlowDevice,
    getDeviceType: getDevice,
    getConnectionType: getConnection,
    createProgressiveStrategy
  };
};

export default useAdaptiveTimeout;
