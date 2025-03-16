import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle the browser's loading indicator
 * This hook will hide the browser's default loading indicator
 * and prevent the "Transfert des données" message from appearing
 */
const useLoadingIndicator = () => {
  // Use a ref to track if we've already applied the loading indicator fix
  const appliedRef = useRef(false);

  useEffect(() => {
    // Skip if we've already applied the fix
    if (appliedRef.current) return;
    
    // Mark as applied to prevent multiple applications
    appliedRef.current = true;
    
    // Function to hide the browser's loading indicator
    const hideLoadingIndicator = () => {
      // Remove any loading classes from the document
      document.documentElement.classList.remove('nprogress-busy');
      document.documentElement.classList.remove('loading');
      
      // Add a class to help with CSS targeting
      document.documentElement.classList.add('custom-loader-active');
      
      // Hide any loading indicators
      const loadingElements = document.querySelectorAll('#nprogress, .nprogress');
      loadingElements.forEach(el => {
        if (el) {
          el.style.display = 'none';
        }
      });
    };

    // Hide loading indicator on initial load
    hideLoadingIndicator();

    // Hide loading indicator before unload
    window.addEventListener('beforeunload', hideLoadingIndicator);
    
    // Add event listeners for page load events
    window.addEventListener('load', () => {
      // Remove the custom-loader-active class after the page has fully loaded
      setTimeout(() => {
        document.documentElement.classList.remove('custom-loader-active');
      }, 500);
    });
    
    window.addEventListener('DOMContentLoaded', hideLoadingIndicator);
    
    // Create a MutationObserver to watch for loading indicators
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
          // Only apply if the class contains loading-related classes
          const classList = document.documentElement.classList;
          if (classList.contains('nprogress-busy') || classList.contains('loading')) {
            hideLoadingIndicator();
          }
        }
      }
    });
    
    // Start observing the document
    observer.observe(document.documentElement, { 
      attributes: true,
      childList: false,
      subtree: false
    });

    // More careful approach to network requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      // Only hide the loading indicator for non-navigation fetches
      if (args[0] && typeof args[0] === 'string' && !args[0].includes('html')) {
        hideLoadingIndicator();
      }
      
      return originalFetch.apply(this, args);
    };

    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(...args) {
      return originalXHROpen.apply(this, args);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
      // Add event listeners to hide loading indicator
      this.addEventListener('loadstart', hideLoadingIndicator);
      this.addEventListener('loadend', () => {
        hideLoadingIndicator();
        // Remove the custom-loader-active class after the request is complete
        setTimeout(() => {
          document.documentElement.classList.remove('custom-loader-active');
        }, 100);
      });
      
      return originalXHRSend.apply(this, args);
    };

    return () => {
      // Restore original functions
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      XMLHttpRequest.prototype.send = originalXHRSend;
      
      // Remove event listeners
      window.removeEventListener('beforeunload', hideLoadingIndicator);
      window.removeEventListener('load', hideLoadingIndicator);
      window.removeEventListener('DOMContentLoaded', hideLoadingIndicator);
      
      // Disconnect the observer
      observer.disconnect();
    };
  }, []);
};

export default useLoadingIndicator; 