import { useEffect } from 'react';

/**
 * Custom hook to handle the browser's loading indicator
 * This hook will hide the browser's default loading indicator
 * and prevent the "Transfert des données" message from appearing
 */
const useLoadingIndicator = () => {
  useEffect(() => {
    // Function to hide the browser's loading indicator
    const hideLoadingIndicator = () => {
      // Remove any loading classes from the document
      document.documentElement.classList.remove('nprogress-busy');
      
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

    // Hide loading indicator on network requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      hideLoadingIndicator();
      return originalFetch.apply(this, args);
    };

    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
      hideLoadingIndicator();
      return originalXHROpen.apply(this, args);
    };

    return () => {
      // Restore original functions
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalXHROpen;
      
      // Remove event listener
      window.removeEventListener('beforeunload', hideLoadingIndicator);
    };
  }, []);
};

export default useLoadingIndicator; 