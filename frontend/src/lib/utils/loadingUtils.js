/**
 * Utility functions for managing global loading state
 */

let activeLoadingCount = 0;
let lastNavigationTime = 0;
let loaderHideTimeout = null;
let enforceMinimumTimeoutId = null;

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

// Create a full-screen overlay directly in the DOM on script load
const createPermanentLoader = () => {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') return;
  
  // Check if the loader already exists
  if (document.getElementById('global-page-transition-overlay')) return;
  
  // Create the overlay container
  const overlay = document.createElement('div');
  overlay.id = 'global-page-transition-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    z-index: 9999;
    display: none;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  `;
  
  // Create the spinner
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid rgba(0, 40, 79, 0.1);
    border-top-color: #02284f;
    animation: loader-spin 1s infinite linear;
  `;
  
  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes loader-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  // Append elements
  overlay.appendChild(spinner);
  document.head.appendChild(style);
  
  // Append to body when DOM is ready
  if (document.body) {
    document.body.appendChild(overlay);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(overlay);
    });
  }
};

// Create the loader element
createPermanentLoader();

/**
 * Actually shows the loader overlay
 */
const displayLoader = () => {
  const overlay = document.getElementById('global-page-transition-overlay');
  if (!overlay) return;
  
  // Show immediately
  overlay.style.display = 'flex';
  
  // Force a reflow to ensure the display change is applied before opacity transition
  overlay.offsetHeight;
  
  // Fade in - immediate show with minimal transition
  overlay.style.transition = 'opacity 0.15s ease-in-out';
  overlay.style.opacity = '1';
};

/**
 * Actually hides the loader overlay
 */
const hideLoader = () => {
  const overlay = document.getElementById('global-page-transition-overlay');
  if (!overlay) return;
  
  // Fade out quickly
  overlay.style.transition = 'opacity 0.15s ease-in-out';
  overlay.style.opacity = '0';
  
  // After transition, hide completely
  setTimeout(() => {
    if (activeLoadingCount === 0) {
      overlay.style.display = 'none';
    }
  }, 150); // Reduced from 200ms
};

/**
 * Show the global loading state
 */
export const showGlobalLoader = () => {
  // Clear any pending hide operation
  if (loaderHideTimeout) {
    clearTimeout(loaderHideTimeout);
    loaderHideTimeout = null;
  }
  
  // Clear any minimum time enforcement
  if (enforceMinimumTimeoutId) {
    clearTimeout(enforceMinimumTimeoutId);
  }
  
  // Record the time when navigation starts
  lastNavigationTime = Date.now();
  
  // Increment the active loading count
  activeLoadingCount++;
  
  // Show the loader overlay
  displayLoader();
  
  // Set a flag to prevent flickering during page loads
  window.__loaderVisible = true;
};

/**
 * Hide the global loading state, with optional delay
 * @param {number} delay - Delay in milliseconds before hiding the loader
 */
export const hideGlobalLoader = (delay = 0) => {
  if (activeLoadingCount > 0) {
    activeLoadingCount--;
  }
  
  // Only proceed with hiding if there are no active loading calls
  if (activeLoadingCount === 0) {
    // Clear any existing timeout
    if (loaderHideTimeout) {
      clearTimeout(loaderHideTimeout);
    }
    
    // Calculate minimum display time - reduced to improve perceived performance
    const currentTime = Date.now();
    const timeSinceNavigation = currentTime - lastNavigationTime;
    const minLoadingTime = 150; // Reduced from 300ms to 150ms for faster transitions
    
    // Calculate final delay
    let finalDelay = delay;
    if (timeSinceNavigation < minLoadingTime) {
      finalDelay = Math.max(delay, minLoadingTime - timeSinceNavigation);
    }
    
    // Set timeout to hide loader
    loaderHideTimeout = setTimeout(() => {
      // Only hide if we're not in another loading operation
      if (activeLoadingCount === 0) {
        window.__loaderVisible = false;
        hideLoader();
      }
      loaderHideTimeout = null;
    }, finalDelay);
  }
};

/**
 * Reset loading state (use with caution)
 */
export const resetLoadingState = () => {
  // Clear all timeouts
  if (loaderHideTimeout) {
    clearTimeout(loaderHideTimeout);
    loaderHideTimeout = null;
  }
  
  if (enforceMinimumTimeoutId) {
    clearTimeout(enforceMinimumTimeoutId);
    enforceMinimumTimeoutId = null;
  }
  
  // Reset counters and flags
  activeLoadingCount = 0;
  window.__loaderVisible = false;
  window.__isLoggingOut = false;
  window.__isNavigating = false;
  
  // Hide the loader
  hideLoader();
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
  
  enforceMinimumTimeoutId = setTimeout(() => {
    hideGlobalLoader();
    enforceMinimumTimeoutId = null;
  }, minimumTime);
};

export default {
  showGlobalLoader,
  hideGlobalLoader,
  withLoading,
  resetLoadingState,
  forceLoadingFor
}; 