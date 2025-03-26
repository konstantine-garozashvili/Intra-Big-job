import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/services/apiService';
import { getSessionId } from '@/lib/services/authService';
import { queryClient } from '@/lib/services/queryClient';

/**
 * Custom hook for optimized profile data fetching
 * This hook provides improved caching, connection pooling, and error handling
 * specifically for user profile data with memory optimization
 */
export const useOptimizedProfile = (options = {}) => {
  // Use a unique session ID to prevent unnecessary refetches
  const sessionId = getSessionId();
  
  // Preload profile data in the background when hook is first used
  // This ensures data is ready for subsequent requests
  if (!window._profilePreloadInitiated) {
    window._profilePreloadInitiated = true;
    apiService.preloadProfileData();
  }
  
  // Monitor for low memory situations
  useMemoryMonitoring();
  
  return useQuery({
    queryKey: ['user-profile', sessionId],
    queryFn: async () => {
      // First check if we have very fresh cached data (under 20 seconds old)
      try {
        const cachedData = localStorage.getItem('user');
        if (cachedData && !options.skipCache) {
          const parsedData = JSON.parse(cachedData);
          const cacheTime = parsedData._extractedAt || 0;
          const cacheAge = Date.now() - cacheTime;
          
          // Use very fresh cache immediately for instant response
          if (cacheAge < 20000) { // 20 seconds
            console.log("useOptimizedProfile - Using very fresh cached data");
            
            // Refresh in background if needed but with memory optimization
            if (cacheAge > 5000) { // Older than 5 seconds
              setTimeout(() => {
                // Use background flag to indicate this is a background refresh
                // This allows the API service to optimize memory usage
                apiService.getUserProfile({ 
                  background: true,
                  noCache: true,
                  minimal: true // Request minimal data to save memory
                }).catch(() => {});
              }, 0);
            }
            
            return parsedData;
          }
        }
      } catch (e) {
        console.warn("useOptimizedProfile - Error accessing cached data:", e);
      }
      
      // Use the optimized getUserProfile method from apiService
      console.log("useOptimizedProfile - Fetching profile data");
      try {
        // Set a shorter timeout to fail fast and use cache
        const userData = await apiService.getUserProfile({
          timeout: 2000, // Short timeout for faster fallback to cache
          retries: 0,    // No retries to speed up response
          minimal: !options.fullData // Request minimal data by default to save memory
        });
        
        return userData;
      } catch (error) {
        console.error("useOptimizedProfile - Error fetching profile data:", error);
        
        // Try to use cached data as fallback
        try {
          const cachedData = localStorage.getItem('user');
          if (cachedData) {
            console.log("useOptimizedProfile - Using cached data as fallback after error");
            return JSON.parse(cachedData);
          }
        } catch (e) {
          // Error parsing cache
        }
        
        // Rethrow the error if we couldn't get fallback data
        throw error;
      }
    },
    // Optimized parameters for stability and performance with memory efficiency
    staleTime: 30000, // 30 seconds (reduced from minutes to ensure freshness)
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false, // Disable automatic refetching
    retry: 0, // No retries to speed up response
    retryDelay: 1000, // Fast retry delay
    // Memory optimization: limit cache size in React Query
    gcTime: 10 * 60 * 1000, // 10 minutes before garbage collection
    ...options,
  });
};

/**
 * Monitor memory usage and clear caches if memory is low
 * This helps prevent memory-related crashes
 */
function useMemoryMonitoring() {
  // Only set up the listener once
  if (window._memoryMonitoringInitiated) return;
  window._memoryMonitoringInitiated = true;
  
  // Check if performance memory API is available
  if (window.performance && window.performance.memory) {
    // Set up periodic memory check
    const memoryCheckInterval = setInterval(() => {
      const memoryInfo = window.performance.memory;
      
      // If using more than 80% of heap limit, clear caches
      if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
        console.warn('Memory usage high, clearing caches');
        apiService.clearMemoryCache();
        
        // Use our centralized queryClient instance
        if (queryClient && typeof queryClient.clear === 'function') {
          queryClient.clear();
        }
      }
    }, 30000); // Check every 30 seconds
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(memoryCheckInterval);
    });
  }
  
  // Listen for low memory events on mobile devices
  if ('onlowmemory' in window) {
    window.addEventListener('lowmemory', () => {
      console.warn('Low memory event detected, clearing caches');
      apiService.clearMemoryCache();
    });
  }
}

export default useOptimizedProfile;
