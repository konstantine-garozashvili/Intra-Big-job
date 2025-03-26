import { useEffect, useCallback, useMemo, useState } from 'react';
import { useAdaptiveTimeout } from './useAdaptiveTimeout';
import performanceMonitor from '../lib/utils/performanceMonitor';

/**
 * React hook that provides performance-optimized utilities for components
 * Combines adaptive timeouts with performance monitoring
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.componentName - Name of the component for performance tracking
 * @param {boolean} options.enableMonitoring - Whether to enable performance monitoring
 * @param {boolean} options.adaptiveTimeouts - Whether to enable adaptive timeouts
 * @returns {Object} Performance-optimized utilities
 */
export const usePerformanceOptimized = (options = {}) => {
  const {
    componentName = 'UnnamedComponent',
    enableMonitoring = process.env.NODE_ENV === 'development',
    adaptiveTimeouts = true
  } = options;
  
  // Get adaptive timeout utilities
  const {
    setTimeout,
    setInterval,
    delay,
    getMetrics: getTimeoutMetrics,
    isSlowDevice,
    getDeviceType,
    getConnectionType,
    createProgressiveStrategy
  } = useAdaptiveTimeout();
  
  // Track performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  
  // Initialize performance monitoring
  useEffect(() => {
    if (!enableMonitoring) return;
    
    // Initialize performance monitoring for this component
    performanceMonitor.initPerformanceMonitor({
      enabled: true,
      sampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1
    });
    
    // Start measuring component render time
    const cleanup = performanceMonitor.measureComponentRender(componentName);
    
    // Update metrics periodically
    const intervalId = setInterval(() => {
      const metrics = performanceMonitor.getAllMetrics();
      setPerformanceMetrics(metrics);
    }, 2000);
    
    return () => {
      cleanup();
      clearInterval(intervalId);
    };
  }, [componentName, enableMonitoring, setInterval]);
  
  // Create measured versions of common operations
  const measuredFetch = useCallback((url, options = {}) => {
    return performanceMonitor.measureFunction(
      () => fetch(url, options),
      `fetch_${url.split('?')[0].split('/').pop()}`
    );
  }, []);
  
  // Create optimized data fetching function
  const optimizedFetch = useCallback(async (url, options = {}) => {
    const deviceType = getDeviceType();
    const connection = getConnectionType();
    const slow = isSlowDevice();
    
    // Adjust fetch options based on device capabilities
    const optimizedOptions = {
      ...options,
      // Add timeout based on connection type
      timeout: slow ? 30000 : 15000,
      // For slow connections, reduce priority
      priority: slow ? 'low' : (options.priority || 'auto'),
      // Add custom headers for tracking
      headers: {
        ...options.headers,
        'X-Device-Type': deviceType,
        'X-Connection-Type': connection
      }
    };
    
    try {
      // Use measured fetch for performance tracking
      const response = await measuredFetch(url, optimizedOptions);
      
      // For slow devices, optimize response handling
      if (slow && response.ok) {
        // For large responses on slow devices, process incrementally
        const contentLength = response.headers.get('Content-Length');
        if (contentLength && parseInt(contentLength, 10) > 100000) {
          // For large responses, use streaming to avoid blocking the main thread
          const reader = response.body.getReader();
          const chunks = [];
          
          // Read chunks with adaptive delays to avoid blocking UI
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            
            // Small delay to allow UI to remain responsive
            if (chunks.length % 5 === 0) {
              await delay(0);
            }
          }
          
          // Combine chunks into final response
          const blob = new Blob(chunks);
          const text = await blob.text();
          return JSON.parse(text);
        }
      }
      
      return response.json();
    } catch (error) {
      console.error('Optimized fetch error:', error);
      throw error;
    }
  }, [getDeviceType, getConnectionType, isSlowDevice, measuredFetch, delay]);
  
  // Create a function to optimize resource loading
  const optimizeResourceLoading = useCallback((resources, loadFn) => {
    const slow = isSlowDevice();
    const deviceType = getDeviceType();
    
    // For slow devices, load fewer resources or lower quality versions
    const optimizedResources = resources.map(resource => {
      // Skip non-critical resources on slow devices
      if (slow && resource.priority === 'low') {
        return { ...resource, skip: true };
      }
      
      // Use lower quality resources on mobile
      if (deviceType === 'mobile' && resource.mobileUrl) {
        return { ...resource, url: resource.mobileUrl };
      }
      
      return resource;
    });
    
    // Filter out skipped resources
    const resourcesToLoad = optimizedResources.filter(r => !r.skip);
    
    // Load resources with adaptive delays between each
    return resourcesToLoad.reduce((promise, resource, index) => {
      return promise.then(async results => {
        // Add small delay between resource loads to avoid blocking the main thread
        if (index > 0 && slow) {
          await delay(50);
        }
        
        try {
          const result = await loadFn(resource);
          return [...results, result];
        } catch (error) {
          console.error(`Failed to load resource: ${resource.url}`, error);
          return [...results, null];
        }
      });
    }, Promise.resolve([]));
  }, [isSlowDevice, getDeviceType, delay]);
  
  // Get combined performance metrics
  const metrics = useMemo(() => {
    return {
      // Adaptive timeout metrics
      adaptiveTimeouts: getTimeoutMetrics(),
      // Performance monitoring metrics
      performance: performanceMetrics,
      // Device information
      device: {
        type: getDeviceType(),
        connection: getConnectionType(),
        isSlowDevice: isSlowDevice()
      }
    };
  }, [getTimeoutMetrics, performanceMetrics, getDeviceType, getConnectionType, isSlowDevice]);
  
  // Create a debug panel component for development
  const PerformanceDebugPanel = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed bottom-2 right-2 bg-black/80 text-white text-xs p-2 rounded-md z-50 opacity-50 hover:opacity-100 transition-opacity">
        <div className="font-bold mb-1">Performance Metrics</div>
        <div>Device: {metrics.device.type}</div>
        <div>Slow: {metrics.device.isSlowDevice ? 'Yes' : 'No'}</div>
        <div>Connection: {metrics.device.connection}</div>
        <div>Timeout Factor: {metrics.adaptiveTimeouts.adjustmentFactor?.toFixed(2)}x</div>
        {metrics.performance && Object.keys(metrics.performance).length > 0 && (
          <div className="mt-1">
            <div className="font-bold">Measurements:</div>
            {Object.keys(metrics.performance)
              .filter(key => key !== '_resources' && metrics.performance[key])
              .slice(0, 3)
              .map(key => (
                <div key={key}>
                  {key}: {metrics.performance[key].average?.toFixed(1)}ms
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }, [metrics]);
  
  return {
    // Adaptive timeout utilities
    setTimeout,
    setInterval,
    delay,
    
    // Performance monitoring utilities
    startMeasure: performanceMonitor.startMeasure,
    endMeasure: performanceMonitor.endMeasure,
    measureFunction: performanceMonitor.measureFunction,
    
    // Optimized utilities
    optimizedFetch,
    optimizeResourceLoading,
    createProgressiveStrategy,
    
    // Device information
    isSlowDevice,
    getDeviceType,
    getConnectionType,
    
    // Performance metrics
    metrics,
    
    // Debug component
    PerformanceDebugPanel
  };
};

export default usePerformanceOptimized;
