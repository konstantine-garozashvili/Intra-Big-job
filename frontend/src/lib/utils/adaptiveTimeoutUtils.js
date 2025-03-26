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
  adjustmentFactor: 1
};

// Store the current machine's performance metrics
let currentPerformance = {
  ...BASE_PERFORMANCE
};

// Store if the system has been initialized
let isInitialized = false;

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
 * @returns {number} An adjustment factor (higher means slower machine)
 */
const calculateAdjustmentFactor = (benchmarkTime) => {
  // If the machine is faster than the baseline, we'll use a factor < 1
  // If slower, we'll use a factor > 1
  return benchmarkTime / BASE_PERFORMANCE.benchmarkTime;
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
    const benchmarkTime = measurePerformance();
    const adjustmentFactor = calculateAdjustmentFactor(benchmarkTime);
    
    currentPerformance = {
      benchmarkTime,
      adjustmentFactor
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
 * @returns {number} The adjusted timeout duration
 */
const calculateAdaptiveTimeout = (baseDuration, options = {}) => {
  if (!isInitialized) {
    initialize();
  }
  
  const { adjustmentFactor } = currentPerformance;
  const adjustedDuration = baseDuration * adjustmentFactor;
  
  // Apply min/max constraints
  const min = options.min ?? baseDuration / 2;
  const max = options.max ?? baseDuration * 2;
  
  return Math.max(min, Math.min(adjustedDuration, max));
};

/**
 * Creates a setTimeout that adapts to the machine's performance
 * @param {Function} callback - The function to execute after the timeout
 * @param {number} baseDuration - The base timeout duration in milliseconds
 * @param {Object} options - Configuration options (min, max)
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
 * @param {Object} options - Configuration options (min, max)
 * @returns {number} The interval ID
 */
const adaptiveSetInterval = (callback, baseDuration, options = {}) => {
  const adjustedDuration = calculateAdaptiveTimeout(baseDuration, options);
  return setInterval(callback, adjustedDuration);
};

/**
 * Creates a promise that resolves after an adaptive timeout
 * @param {number} baseDuration - The base timeout duration in milliseconds
 * @param {Object} options - Configuration options (min, max)
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

// Initialize on module load
initialize();

export {
  initialize,
  calculateAdaptiveTimeout,
  adaptiveSetTimeout,
  adaptiveSetInterval,
  adaptiveDelay,
  getPerformanceMetrics
};
