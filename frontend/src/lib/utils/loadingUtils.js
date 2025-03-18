/**
 * Utility functions for managing global loading state
 */

let activeLoadingCount = 0;

/**
 * Injects a style tag to hide scrollbars in all browsers
 */
const injectScrollbarHidingStyles = () => {
  if (document.getElementById('hide-scrollbars-style')) {
    return; // Style already injected
  }

  const style = document.createElement('style');
  style.id = 'hide-scrollbars-style';
  style.innerHTML = `
    /* Hide scrollbars in all browsers while keeping scrollability */
    
    /* Universal selector for all elements */
    * {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    
    /* WebKit browsers (Chrome, Safari, newer versions of Opera) */
    ::-webkit-scrollbar,
    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-thumb {
      width: 0 !important;
      height: 0 !important;
      background: transparent !important;
      display: none !important;
    }
    
    /* Specific elements that might have scrollbars */
    html, body, div, main, section, article, aside, nav, header, footer {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    
    html::-webkit-scrollbar,
    body::-webkit-scrollbar,
    div::-webkit-scrollbar,
    main::-webkit-scrollbar,
    section::-webkit-scrollbar,
    article::-webkit-scrollbar,
    aside::-webkit-scrollbar,
    nav::-webkit-scrollbar,
    header::-webkit-scrollbar,
    footer::-webkit-scrollbar {
      width: 0 !important;
      height: 0 !important;
      background: transparent !important;
      display: none !important;
    }
  `;

  document.head.appendChild(style);
};

// Run this immediately
injectScrollbarHidingStyles();

/**
 * Show the global loading state
 */
export const showGlobalLoader = () => {
  // Increment the active loading count
  activeLoadingCount++;
  
  // Add loading-active class to the html element
  document.documentElement.classList.add('loading-active');
  
  // Ensure scrollbars are hidden
  injectScrollbarHidingStyles();
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