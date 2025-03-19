import { useEffect } from 'react';
import { showGlobalLoader, hideGlobalLoader } from '@/lib/utils/loadingUtils';

/**
 * LoadingOverlay component that shows a consistent loading indicator
 * using the global loading utilities
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isVisible Whether the loading overlay should be visible
 * @returns {null} This component doesn't render any UI directly
 */
export default function LoadingOverlay({ isVisible }) {
  useEffect(() => {
    if (isVisible) {
      // Show the global loader when the component becomes visible
      showGlobalLoader();
    } else {
      // Hide the global loader with a small delay for smoothness
      hideGlobalLoader(50);
    }

    // Clean up when component unmounts
    return () => {
      if (isVisible) {
        // If it was visible when unmounting, hide it without delay
        hideGlobalLoader(0);
      }
    };
  }, [isVisible]);

  // Return null since we're using the global loader
  return null;
} 