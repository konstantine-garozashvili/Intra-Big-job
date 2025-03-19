import { useEffect, useState } from 'react';
import { resetLoadingState } from '../lib/utils/loadingUtils';

/**
 * Hook to manage loading indicator behavior
 * Handles browser's default loading indicator and custom loading state
 * @returns {Object} Object containing isLoading state
 */
const useLoadingIndicator = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset loading state on mount
    resetLoadingState();

    // Create a meta tag to disable the browser's default loading indicator
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#ffffff';
    document.head.appendChild(meta);
    
    // Create a style tag to disable the browser's default loading indicator
    const style = document.createElement('style');
    style.textContent = `
      /* Disable browser's default loading indicator when our custom loader is active */
      html.custom-loader-active, 
      html.custom-loader-active body {
        cursor: auto !important;
      }
      
      /* Hide any progress indicators when our custom loader is active */
      html.custom-loader-active progress {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Add the custom-loader-active class initially
    document.documentElement.classList.add('custom-loader-active');
    
    // Handle page load complete
    const handlePageLoad = () => {
      setTimeout(() => {
        document.documentElement.classList.remove('custom-loader-active');
        setIsLoading(false);
      }, 300);
    };
    
    // Add load event listener
    window.addEventListener('load', handlePageLoad);
    
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reset loading state when page becomes visible again
        resetLoadingState();
        setIsLoading(false);
      }
    };
    
    // Setup mutation observer to track loading state
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          const isLoadingActive = document.documentElement.classList.contains('loading-active');
          setIsLoading(isLoadingActive);
        }
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Add visibility change event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // Clean up
      document.head.removeChild(meta);
      document.head.removeChild(style);
      document.documentElement.classList.remove('custom-loader-active');
      window.removeEventListener('load', handlePageLoad);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, []);

  return { isLoading };
};

export default useLoadingIndicator; 