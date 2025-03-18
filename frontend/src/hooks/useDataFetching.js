import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for lazy loading data from an API
 * 
 * @param {Function} fetchFunction - Function that returns a promise to fetch data
 * @param {Object} options - Configuration options
 * @param {boolean} options.loadOnMount - Whether to load data when component mounts
 * @param {Array} options.dependencies - Dependencies array that triggers data reload
 * @param {boolean} options.keepPreviousData - Whether to keep previous data while loading new data
 * @returns {Object} - State and functions for managing the data fetching
 */
export const useDataFetching = (fetchFunction, {
  loadOnMount = false,
  dependencies = [],
  keepPreviousData = true
} = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Use ref to avoid redundant fetches
  const isFetchingRef = useRef(false);
  
  // Function to fetch data
  const fetchData = useCallback(async (params) => {
    if (isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      if (!keepPreviousData) {
        setData(null);
      }
      
      setError(null);
      
      const result = await fetchFunction(params);
      setData(result);
      setHasLoaded(true);
      
      return result;
    } catch (err) {
      // console.error('Error fetching data:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchFunction, keepPreviousData]);
  
  // Reset data and state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setHasLoaded(false);
  }, []);
  
  // Load data on mount if enabled
  useEffect(() => {
    if (loadOnMount) {
      fetchData();
    }
  }, [loadOnMount, fetchData, ...dependencies]);
  
  return {
    data,
    loading,
    error,
    fetchData,
    reset,
    hasLoaded
  };
};

/**
 * Custom hook for lazy loading data when a component becomes visible
 * 
 * @param {Function} fetchFunction - Function that returns a promise to fetch data
 * @param {Object} options - Configuration options
 * @param {boolean} options.triggerOnce - Whether to trigger the fetch only once
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {Array} options.dependencies - Dependencies array that triggers intersection observer reset
 * @returns {Object} - State, functions and ref for the intersection observer
 */
export const useVisibilityFetch = (fetchFunction, {
  triggerOnce = true,
  threshold = 0.1,
  dependencies = []
} = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  
  const fetchData = useCallback(async () => {
    if (loading || hasLoaded) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      setData(result);
      setHasLoaded(true);
      
      return result;
    } catch (err) {
      // console.error('Error fetching data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, loading, hasLoaded]);
  
  // Set up the intersection observer
  useEffect(() => {
    const options = {
      root: null, // Use the viewport
      rootMargin: '0px',
      threshold
    };
    
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsVisible(entry.isIntersecting);
      
      if (entry.isIntersecting && !hasLoaded) {
        fetchData();
        
        if (triggerOnce) {
          observer.disconnect();
        }
      }
    }, options);
    
    observerRef.current = observer;
    
    // Start observing when ref is attached to a DOM element
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchData, threshold, triggerOnce, hasLoaded, ...dependencies]);
  
  // Function to manually attach the observer to an element
  const attachObserver = useCallback((element) => {
    if (!element || !observerRef.current) return;
    
    observerRef.current.observe(element);
  }, []);
  
  // Function to manually detach the observer from an element
  const detachObserver = useCallback((element) => {
    if (!element || !observerRef.current) return;
    
    observerRef.current.unobserve(element);
  }, []);
  
  return {
    data,
    loading,
    error,
    isVisible,
    hasLoaded,
    elementRef,
    attachObserver,
    detachObserver,
    fetchData
  };
};

/**
 * Custom hook for lazy loading data when a user interaction occurs (like button click)
 * 
 * @param {Function} fetchFunction - Function that returns a promise to fetch data
 * @returns {Object} - State and functions for interaction-based data fetching
 */
export const useInteractionFetch = (fetchFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const fetchData = useCallback(async (params) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction(params);
      setData(result);
      setHasLoaded(true);
      
      return result;
    } catch (err) {
      // console.error('Error fetching data:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, loading]);
  
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setHasLoaded(false);
  }, []);
  
  return {
    data,
    loading,
    error,
    fetchData,
    hasLoaded,
    reset
  };
}; 