/**
 * Utility functions for managing global loading state
 */

let activeLoadingCount = 0;

/**
 * Add a permanent scrollbar style to prevent layout shifts
 */
const addPermanentScrollbarStyle = () => {
  // If the style is already added, don't add it again
  if (document.getElementById('permanent-scrollbar-style')) {
    return;
  }
  
  // Create a style element
  const style = document.createElement('style');
  style.id = 'permanent-scrollbar-style';
  
  // This approach forces a scrollbar to always be visible
  // and ensures fixed elements maintain their position
  style.textContent = `
    html {
      overflow-y: scroll;
    }
    
    html.loading-active {
      overflow: hidden;
    }
  `;
  
  // Add the style to the document
  document.head.appendChild(style);
};

/**
 * Show the global loading state
 */
export const showGlobalLoader = () => {
  // Add permanent scrollbar on first use
  if (activeLoadingCount === 0) {
    addPermanentScrollbarStyle();
  }

  // Increment the active loading count
  activeLoadingCount++;
  
  // Add loading-active class to the html element (not body)
  document.documentElement.classList.add('loading-active');
};

/**
 * Hide the global loading state, with optional delay
 * @param {number} delay - Delay in milliseconds before hiding the loader
 */
export const hideGlobalLoader = (delay = 0) => {
  if (activeLoadingCount > 0) {
    activeLoadingCount--;
  }
  
  // Only remove the class if there are no active loading calls
  if (activeLoadingCount === 0) {
    const hideAction = () => {
      document.documentElement.classList.remove('loading-active');
    };
    
    if (delay > 0) {
      setTimeout(() => {
        if (activeLoadingCount === 0) {
          hideAction();
        }
      }, delay);
    } else {
      hideAction();
    }
  }
};

/**
 * Reset loading state (use with caution)
 */
export const resetLoadingState = () => {
  activeLoadingCount = 0;
  document.documentElement.classList.remove('loading-active');
};

/**
 * Execute a function with loading state
 * @param {Function} fn - The async function to execute
 * @param {Object} options - Options for the loading state
 * @param {number} options.hideDelay - Delay in milliseconds before hiding the loader after completion
 * @returns {Promise<any>} - The result of the function
 */
export const withLoading = async (fn, options = {}) => {
  const { hideDelay = 100 } = options;
  
  try {
    showGlobalLoader();
    const result = await fn();
    hideGlobalLoader(hideDelay);
    return result;
  } catch (error) {
    hideGlobalLoader(0); // Hide immediately on error
    throw error;
  }
};

// Force loading screen to show for minimum time
export const forceLoadingFor = (minimumTime) => {
  showGlobalLoader();
  setTimeout(() => {
    hideGlobalLoader();
  }, minimumTime);
};

export default {
  showGlobalLoader,
  hideGlobalLoader,
  withLoading,
  resetLoadingState,
  forceLoadingFor
}; 