/**
 * Performance monitoring utility for tracking and optimizing application performance
 * Provides tools for measuring, logging, and analyzing performance metrics
 */

// Store performance measurements
let performanceData = {
  measurements: {},
  marks: {},
  resourceTiming: [],
  lastUpdate: Date.now()
};

// Configuration with sensible defaults
const config = {
  enabled: process.env.NODE_ENV === 'development' || localStorage.getItem('enablePerformanceMonitoring') === 'true',
  sampleRate: 0.1, // Only sample 10% of measurements in production
  logLevel: process.env.NODE_ENV === 'development' ? 'verbose' : 'warning',
  maxEntries: 100
};

/**
 * Initialize the performance monitor
 * @param {Object} options - Configuration options
 */
export const initPerformanceMonitor = (options = {}) => {
  // Merge options with defaults
  Object.assign(config, options);
  
  // Clear existing data
  resetPerformanceData();
  
  // Set up observers if enabled
  if (config.enabled) {
    setupObservers();
  }
  
  return {
    isEnabled: config.enabled,
    config
  };
};

/**
 * Reset all performance data
 */
export const resetPerformanceData = () => {
  performanceData = {
    measurements: {},
    marks: {},
    resourceTiming: [],
    lastUpdate: Date.now()
  };
};

/**
 * Set up performance observers
 */
const setupObservers = () => {
  // Only run in browser environment
  if (typeof window === 'undefined' || !window.PerformanceObserver) return;
  
  try {
    // Observe resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      // Keep only the most recent entries to avoid memory issues
      performanceData.resourceTiming = [
        ...performanceData.resourceTiming,
        ...entries.map(entry => ({
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration,
          initiatorType: entry.initiatorType,
          size: entry.transferSize || 0,
          timestamp: Date.now()
        }))
      ].slice(-config.maxEntries);
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
    
    // Observe long tasks
    if (window.PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          logPerformanceIssue('Long task detected', {
            duration: entry.duration,
            startTime: entry.startTime,
            attribution: entry.attribution
          });
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
    
    // Observe layout shifts
    if (window.PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        let cumulativeLayoutShift = 0;
        entries.forEach(entry => {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            cumulativeLayoutShift += entry.value;
          }
        });
        
        if (cumulativeLayoutShift > 0.1) {
          logPerformanceIssue('Significant layout shift detected', {
            cumulativeLayoutShift
          });
        }
      });
      
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    }
    
    // Return cleanup function
    return () => {
      resourceObserver.disconnect();
      if (window.PerformanceObserver.supportedEntryTypes.includes('longtask')) {
        longTaskObserver.disconnect();
      }
      if (window.PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
        layoutShiftObserver.disconnect();
      }
    };
  } catch (error) {
    console.error('Error setting up performance observers:', error);
  }
};

/**
 * Start measuring a performance metric
 * @param {string} name - Name of the measurement
 */
export const startMeasure = (name) => {
  if (!config.enabled) return;
  
  // Only sample a percentage of measurements in production
  if (process.env.NODE_ENV !== 'development' && Math.random() > config.sampleRate) {
    return;
  }
  
  try {
    performanceData.marks[name] = {
      startTime: performance.now(),
      name
    };
    
    // Also use the Performance API if available
    if (performance && performance.mark) {
      performance.mark(`${name}_start`);
    }
  } catch (error) {
    console.error('Error starting performance measure:', error);
  }
};

/**
 * End measuring a performance metric
 * @param {string} name - Name of the measurement
 * @returns {number|null} - Duration of the measurement in ms
 */
export const endMeasure = (name) => {
  if (!config.enabled || !performanceData.marks[name]) return null;
  
  try {
    const endTime = performance.now();
    const { startTime } = performanceData.marks[name];
    const duration = endTime - startTime;
    
    // Store the measurement
    if (!performanceData.measurements[name]) {
      performanceData.measurements[name] = [];
    }
    
    // Keep only the most recent measurements
    performanceData.measurements[name] = [
      ...performanceData.measurements[name],
      {
        duration,
        timestamp: Date.now()
      }
    ].slice(-config.maxEntries);
    
    // Also use the Performance API if available
    if (performance && performance.mark && performance.measure) {
      performance.mark(`${name}_end`);
      performance.measure(name, `${name}_start`, `${name}_end`);
    }
    
    // Log slow operations
    if (duration > 100) {
      logPerformanceIssue(`Slow operation detected: ${name}`, {
        duration,
        threshold: 100
      });
    }
    
    return duration;
  } catch (error) {
    console.error('Error ending performance measure:', error);
    return null;
  }
};

/**
 * Measure the execution time of a function
 * @param {Function} fn - Function to measure
 * @param {string} name - Name of the measurement
 * @returns {any} - Result of the function
 */
export const measureFunction = (fn, name) => {
  if (!config.enabled) return fn();
  
  startMeasure(name);
  try {
    const result = fn();
    
    // Handle promises
    if (result instanceof Promise) {
      return result.finally(() => {
        endMeasure(name);
      });
    }
    
    endMeasure(name);
    return result;
  } catch (error) {
    endMeasure(name);
    throw error;
  }
};

/**
 * Create a wrapped version of a function that measures performance
 * @param {Function} fn - Function to wrap
 * @param {string} name - Name of the measurement
 * @returns {Function} - Wrapped function
 */
export const createMeasuredFunction = (fn, name) => {
  return function measuredFunction(...args) {
    if (!config.enabled) return fn.apply(this, args);
    
    startMeasure(name);
    try {
      const result = fn.apply(this, args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.finally(() => {
          endMeasure(name);
        });
      }
      
      endMeasure(name);
      return result;
    } catch (error) {
      endMeasure(name);
      throw error;
    }
  };
};

/**
 * Log a performance issue
 * @param {string} message - Issue message
 * @param {Object} data - Additional data
 */
export const logPerformanceIssue = (message, data = {}) => {
  if (!config.enabled) return;
  
  const issueData = {
    message,
    timestamp: Date.now(),
    ...data
  };
  
  // Log based on configured level
  if (config.logLevel === 'verbose' || 
      (config.logLevel === 'warning' && data.duration > 500)) {
    console.warn('Performance issue:', issueData);
  }
  
  // Could send to monitoring service here
};

/**
 * Get performance metrics for a specific measurement
 * @param {string} name - Name of the measurement
 * @returns {Object|null} - Performance metrics
 */
export const getMetrics = (name) => {
  if (!config.enabled || !performanceData.measurements[name]) return null;
  
  const measurements = performanceData.measurements[name];
  if (measurements.length === 0) return null;
  
  // Calculate statistics
  const durations = measurements.map(m => m.duration);
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  const average = total / durations.length;
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  
  // Calculate percentiles
  durations.sort((a, b) => a - b);
  const p50 = durations[Math.floor(durations.length * 0.5)];
  const p90 = durations[Math.floor(durations.length * 0.9)];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  
  return {
    name,
    count: measurements.length,
    average,
    min,
    max,
    p50,
    p90,
    p95,
    total,
    recentSamples: measurements.slice(-5)
  };
};

/**
 * Get all performance metrics
 * @returns {Object} - All performance metrics
 */
export const getAllMetrics = () => {
  if (!config.enabled) return {};
  
  const metrics = {};
  
  // Process all measurements
  Object.keys(performanceData.measurements).forEach(name => {
    metrics[name] = getMetrics(name);
  });
  
  // Add resource timing data
  metrics._resources = {
    count: performanceData.resourceTiming.length,
    totalSize: performanceData.resourceTiming.reduce((sum, res) => sum + res.size, 0),
    byType: performanceData.resourceTiming.reduce((types, res) => {
      if (!types[res.initiatorType]) {
        types[res.initiatorType] = { count: 0, totalSize: 0 };
      }
      types[res.initiatorType].count++;
      types[res.initiatorType].totalSize += res.size;
      return types;
    }, {})
  };
  
  return metrics;
};

/**
 * Create a React hook for measuring component render performance
 * @param {string} componentName - Name of the component
 * @returns {Function} - Cleanup function
 */
export const measureComponentRender = (componentName) => {
  if (!config.enabled) return () => {};
  
  const name = `render_${componentName}`;
  startMeasure(name);
  
  // Return cleanup function
  return () => {
    endMeasure(name);
  };
};

/**
 * Analyze performance data to identify bottlenecks
 * @returns {Array} - List of performance issues
 */
export const analyzePerformance = () => {
  if (!config.enabled) return [];
  
  const issues = [];
  const metrics = getAllMetrics();
  
  // Analyze each measurement
  Object.keys(metrics).forEach(name => {
    if (name === '_resources') return;
    
    const metric = metrics[name];
    if (!metric) return;
    
    // Check for slow operations
    if (metric.p90 > 100) {
      issues.push({
        type: 'slow_operation',
        name,
        metric: 'p90',
        value: metric.p90,
        threshold: 100,
        severity: metric.p90 > 500 ? 'high' : 'medium'
      });
    }
    
    // Check for inconsistent performance
    if (metric.max > metric.average * 5 && metric.count > 5) {
      issues.push({
        type: 'inconsistent_performance',
        name,
        metric: 'variance',
        value: metric.max / metric.average,
        threshold: 5,
        severity: 'medium'
      });
    }
  });
  
  // Analyze resource loading
  if (metrics._resources && metrics._resources.count > 50) {
    issues.push({
      type: 'excessive_resources',
      count: metrics._resources.count,
      threshold: 50,
      totalSize: metrics._resources.totalSize,
      severity: 'medium'
    });
  }
  
  return issues;
};

/**
 * Get a summary of application performance
 * @returns {Object} - Performance summary
 */
export const getPerformanceSummary = () => {
  if (!config.enabled) {
    return {
      enabled: false,
      message: 'Performance monitoring is disabled'
    };
  }
  
  const metrics = getAllMetrics();
  const issues = analyzePerformance();
  
  return {
    enabled: true,
    timestamp: Date.now(),
    metrics,
    issues,
    resourceCount: performanceData.resourceTiming.length,
    measurementCount: Object.keys(performanceData.measurements).length
  };
};

export default {
  initPerformanceMonitor,
  startMeasure,
  endMeasure,
  measureFunction,
  createMeasuredFunction,
  getMetrics,
  getAllMetrics,
  analyzePerformance,
  getPerformanceSummary,
  measureComponentRender,
  resetPerformanceData
};
