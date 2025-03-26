/**
 * Adaptive Timeout Utilities
 * 
 * This module provides utilities for creating timeouts that adapt to the performance
 * of the user's machine, ensuring consistent behavior across different hardware.
 */

// Base performance metrics (calibrated for an average machine)
const BASE_PERFORMANCE = {
  // Time in ms it takes to perform a simple computation benchmark
  benchmarkTime: 5,
  // Default adjustment factor
  adjustmentFactor: 1,
  // Device type (desktop, mobile, tablet)
  deviceType: 'desktop',
  // Connection type (if available)
  connectionType: 'unknown',
  // Whether the device is considered slow
  isSlowDevice: false
};

// Store the current machine's performance metrics
let currentPerformance = {
  ...BASE_PERFORMANCE
};

// Store if the system has been initialized
let isInitialized = false;

/**
 * Detects the device type based on user agent and screen size
 * @returns {string} 'mobile', 'tablet', or 'desktop'
 */
const detectDeviceType = () => {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'desktop'; // Default to desktop in non-browser environments
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  if (!isMobile) {
    return 'desktop';
  }
  
  // Check if it's a tablet based on screen size
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
  return isTablet ? 'tablet' : 'mobile';
};

/**
 * Detects the connection type if available
 * @returns {string} Connection type or 'unknown'
 */
const detectConnectionType = () => {
  if (typeof navigator !== 'undefined' && navigator.connection) {
    return navigator.connection.effectiveType || 'unknown';
  }
  return 'unknown';
};

/**
 * Measures the current device performance by running a simple benchmark
 * @returns {number} The time taken to run the benchmark in milliseconds
 */
const measurePerformance = () => {
  const startTime = performance.now();
  
  // Simple computation benchmark
  let result = 0;
  for (let i = 0; i < 10000; i++) {
    result += Math.sqrt(i);
  }
  
  const endTime = performance.now();
  return endTime - startTime;
};

/**
 * Calculates an adjustment factor based on the current machine's performance
 * @param {number} benchmarkTime - The time taken to run the benchmark
 * @param {string} deviceType - The detected device type
 * @param {string} connectionType - The detected connection type
 * @returns {number} An adjustment factor (higher means slower machine)
 */
const calculateAdjustmentFactor = (benchmarkTime, deviceType, connectionType) => {
  // Start with the basic performance ratio
  let factor = benchmarkTime / BASE_PERFORMANCE.benchmarkTime;
  
  // Apply device-specific adjustments
  if (deviceType === 'mobile') {
    // Mobile devices may need more aggressive adjustments
    factor *= 1.2;
  } else if (deviceType === 'tablet') {
    factor *= 1.1;
  }
  
  // Apply connection-specific adjustments
  if (connectionType === '2g') {
    factor *= 1.5;
  } else if (connectionType === 'slow-2g') {
    factor *= 2;
  } else if (connectionType === '3g') {
    factor *= 1.2;
  }
  
  return factor;
};

/**
 * Determines if the current device should be considered "slow"
 * @param {number} adjustmentFactor - The calculated adjustment factor
 * @param {string} deviceType - The detected device type
 * @param {string} connectionType - The detected connection type
 * @returns {boolean} Whether the device is considered slow
 */
const determineIfSlowDevice = (adjustmentFactor, deviceType, connectionType) => {
  // Consider a device slow if:
  // 1. The adjustment factor is high (slow performance)
  // 2. It's a mobile device on a slow connection
  // 3. It's any device on a very slow connection
  
  if (adjustmentFactor > 2) {
    return true;
  }
  
  if (deviceType === 'mobile' && (connectionType === '2g' || connectionType === 'slow-2g')) {
    return true;
  }
  
  if (connectionType === 'slow-2g') {
    return true;
  }
  
  return false;
};

/**
 * Initializes the adaptive timeout system by measuring performance
 * @param {Object} options - Configuration options
 * @param {boolean} options.force - Force reinitialization even if already initialized
 * @returns {Object} The current performance metrics
 */
const initialize = (options = {}) => {
  if (isInitialized && !options.force) {
    return currentPerformance;
  }
  
  try {
    const deviceType = detectDeviceType();
    const connectionType = detectConnectionType();
    const benchmarkTime = measurePerformance();
    const adjustmentFactor = calculateAdjustmentFactor(benchmarkTime, deviceType, connectionType);
    const isSlowDevice = determineIfSlowDevice(adjustmentFactor, deviceType, connectionType);
    
    currentPerformance = {
      benchmarkTime,
      adjustmentFactor,
      deviceType,
      connectionType,
      isSlowDevice
    };
    
    isInitialized = true;
    
    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Adaptive timeout system initialized:', currentPerformance);
    }
    
    return currentPerformance;
  } catch (error) {
    console.error('Error initializing adaptive timeout system:', error);
    // Fall back to base performance
    currentPerformance = { ...BASE_PERFORMANCE };
    return currentPerformance;
  }
};

/**
 * Calculates an adaptive timeout duration based on the base duration
 * @param {number} baseDuration - The base timeout duration in milliseconds
 * @param {Object} options - Configuration options
 * @param {number} options.min - Minimum timeout duration (default: baseDuration / 2)
 * @param {number} options.max - Maximum timeout duration (default: baseDuration * 2)
 * @param {boolean} options.prioritizeSpeed - If true, prioritize speed over reliability for UI responsiveness
 * @returns {number} The adjusted timeout duration
 */
const calculateAdaptiveTimeout = (baseDuration, options = {}) => {
  if (!isInitialized) {
    initialize();
  }
  
  const { adjustmentFactor, deviceType, isSlowDevice } = currentPerformance;
  let adjustedDuration = baseDuration * adjustmentFactor;
  
  // If this is a slow device and we're not prioritizing speed, add extra buffer time
  if (isSlowDevice && !options.prioritizeSpeed) {
    adjustedDuration *= 1.5;
  }
  
  // For mobile devices, optimize based on whether we're prioritizing speed
  if (deviceType === 'mobile') {
    if (options.prioritizeSpeed) {
      // For UI operations, we might want to be more aggressive
      adjustedDuration = Math.min(adjustedDuration, baseDuration * 1.5);
    }
  }
  
  // Apply min/max constraints
  const min = options.min ?? baseDuration / 2;
  const max = options.max ?? baseDuration * 2;
  
  return Math.max(min, Math.min(adjustedDuration, max));
};

/**
 * Creates a setTimeout that adapts to the machine's performance
 * @param {Function} callback - The function to execute after the timeout
 * @param {number} baseDuration - The base timeout duration in milliseconds
 * @param {Object} options - Configuration options (min, max, prioritizeSpeed)
 * @returns {number} The timeout ID
 */
const adaptiveSetTimeout = (callback, baseDuration, options = {}) => {
  const adjustedDuration = calculateAdaptiveTimeout(baseDuration, options);
  return setTimeout(callback, adjustedDuration);
};

/**
 * Creates a setInterval that adapts to the machine's performance
 * @param {Function} callback - The function to execute at each interval
 * @param {number} baseDuration - The base interval duration in milliseconds
 * @param {Object} options - Configuration options (min, max, prioritizeSpeed)
 * @returns {number} The interval ID
 */
const adaptiveSetInterval = (callback, baseDuration, options = {}) => {
  const adjustedDuration = calculateAdaptiveTimeout(baseDuration, options);
  return setInterval(callback, adjustedDuration);
};

/**
 * Creates a promise that resolves after an adaptive timeout
 * @param {number} baseDuration - The base timeout duration in milliseconds
 * @param {Object} options - Configuration options (min, max, prioritizeSpeed)
 * @returns {Promise} A promise that resolves after the timeout
 */
const adaptiveDelay = (baseDuration, options = {}) => {
  const adjustedDuration = calculateAdaptiveTimeout(baseDuration, options);
  return new Promise(resolve => setTimeout(resolve, adjustedDuration));
};

/**
 * Gets the current performance metrics
 * @returns {Object} The current performance metrics
 */
const getPerformanceMetrics = () => {
  if (!isInitialized) {
    initialize();
  }
  return { ...currentPerformance };
};

/**
 * Checks if the current device is considered slow
 * @returns {boolean} Whether the device is considered slow
 */
const isSlowDevice = () => {
  if (!isInitialized) {
    initialize();
  }
  return currentPerformance.isSlowDevice;
};

/**
 * Gets the current device type
 * @returns {string} The device type ('desktop', 'mobile', or 'tablet')
 */
const getDeviceType = () => {
  if (!isInitialized) {
    initialize();
  }
  return currentPerformance.deviceType;
};

/**
 * Gets the current connection type
 * @returns {string} The connection type
 */
const getConnectionType = () => {
  if (!isInitialized) {
    initialize();
  }
  return currentPerformance.connectionType;
};

// Initialize on module load
initialize();

// Listen for network changes if available
if (typeof navigator !== 'undefined' && navigator.connection) {
  navigator.connection.addEventListener('change', () => {
    // Re-initialize when network conditions change
    initialize({ force: true });
  });
}

// Re-measure on visibility change (e.g., when tab becomes active again)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Re-initialize when tab becomes visible again
      initialize({ force: true });
    }
  });
}

export {
  initialize,
  calculateAdaptiveTimeout,
  adaptiveSetTimeout,
  adaptiveSetInterval,
  adaptiveDelay,
  getPerformanceMetrics,
  isSlowDevice,
  getDeviceType,
  getConnectionType
};
