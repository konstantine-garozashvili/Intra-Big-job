import { useEffect } from 'react';
import { showGlobalLoader, hideGlobalLoader } from '../lib/utils/loadingUtils';

/**
 * LoadingOverlay component that shows a consistent loading indicator
 * using the global loading utilities
 * 
 * @param {Object} props Component props
 * @param {boolean} [props.isVisible=true] Whether the loading overlay should be visible
 * @returns {null} This component doesn't render any UI directly
 */
export default function LoadingOverlay({ isVisible = true }) {
  useEffect(() => {
    if (isVisible) {
      // Show the global loader when the component becomes visible
      showGlobalLoader();
      
      // Mark that we're in a navigation state
      window.__isNavigating = true;
    } else {
      // Only hide the loader if we're not in another navigation process
      if (!window.__isLoggingOut) {
        // Reset navigation state when hiding
        window.__isNavigating = false;
        
        // Hide the global loader with a small delay for smoothness
        hideGlobalLoader(100);
      }
    }

    // Clean up when component unmounts
    return () => {
      // Don't hide or change navigation state if we're in the middle of logging out
      if (!window.__isLoggingOut) {
        window.__isNavigating = false;
        
        if (isVisible) {
          // If it was visible when unmounting, hide it without delay
          hideGlobalLoader(0);
        }
      }
    };
  }, [isVisible]);

  // Return null since we're using the global loader
  return null;
} 