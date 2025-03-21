/**
 * Utility functions for managing global loading state
 */

import axios from 'axios';

let activeLoadingCount = 0;
let lastNavigationTime = 0;
let loaderHideTimeout = null;
let enforceMinimumTimeoutId = null;
let isLowPerformanceMode = false;
let timeoutConfig = {
  default: 30000,  // Default timeout in ms
  profile: 20000,  // Profile requests timeout in ms
  large: 60000     // Large data timeout in ms
};

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

// Function to detect low performance mode
const detectLowPerformanceMode = () => {
  try {
    // Check if the device is likely to be low-performance
    // 1. Check for localStorage preference first
    if (localStorage && localStorage.getItem('preferLowPerformanceMode') === 'true') {
      return true;
    }
    
    // 2. Check for CPU cores
    const cpuCores = navigator.hardwareConcurrency || 0;
    if (cpuCores > 0 && cpuCores <= 2) {
      return true;
    }
    
    // 3. Check for mobile devices with lower performance
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isOlderDevice = /Windows NT (5\.1|6\.0|6\.1)|Mac OS X 10[._]([0-9]|10|11)/i.test(navigator.userAgent);
    
    return isMobile || isOlderDevice;
  } catch (e) {
    console.error('Error detecting performance mode:', e);
    return false;
  }
};

// Function to sync performance mode with server
export const syncWithServerPerformanceMode = async () => {
  try {
    // Only sync if API URL is available
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    
    const response = await axios.get(`${apiUrl}/timeout-config`, {
      timeout: 5000, // Short timeout for this request
    });
    
    if (response.data && typeof response.data.isLowPerformance === 'boolean') {
      // Sync with server's performance detection
      setLowPerformanceMode(response.data.isLowPerformance);
      
      // Update timeout config with server values
      if (response.data.timeouts) {
        timeoutConfig = {
          default: response.data.timeouts.default || timeoutConfig.default,
          profile: response.data.timeouts.profile || timeoutConfig.profile,
          large: response.data.timeouts.large || timeoutConfig.large
        };
        
        console.info('Updated timeout configuration from server:', timeoutConfig);
      }
      
      return response.data.isLowPerformance;
    }
  } catch (error) {
    console.warn('Failed to sync with server performance mode:', error.message);
    // Fall back to client-side detection
  }
  
  // Default to client-side detection if server sync fails
  return detectLowPerformanceMode();
};

// Set performance mode on load
isLowPerformanceMode = detectLowPerformanceMode();

// Export function to toggle performance mode
export const setLowPerformanceMode = (enabled) => {
  isLowPerformanceMode = enabled;
  if (localStorage) {
    localStorage.setItem('preferLowPerformanceMode', enabled.toString());
  }
};

// Export function to get current performance mode
export const isLowPerformanceModeEnabled = () => isLowPerformanceMode;

// Export timeout config getter for services to use
export const getTimeoutConfig = (type = 'default') => {
  return timeoutConfig[type] || timeoutConfig.default;
};

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
    transition: opacity ${isLowPerformanceMode ? '0.1s' : '0.2s'} ease-in-out;
  `;
  
  // Create the spinner - simplified for low performance mode
  const spinner = document.createElement('div');
  spinner.style.cssText = isLowPerformanceMode 
    ? `
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid rgba(0, 40, 79, 0.3);
      border-top-color: #02284f;
      animation: loader-spin 1.2s infinite linear;
    `
    : `
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
  
  // Fade in
  overlay.style.opacity = '1';
};

/**
 * Actually hides the loader overlay
 */
const hideLoader = () => {
  const overlay = document.getElementById('global-page-transition-overlay');
  if (!overlay) return;
  
  // Fade out
  overlay.style.opacity = '0';
  
  // After transition, hide completely
  setTimeout(() => {
    if (activeLoadingCount === 0) {
      overlay.style.display = 'none';
    }
  }, 200);
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
    
    // Calculate minimum display time - shorter for low performance mode
    const currentTime = Date.now();
    const timeSinceNavigation = currentTime - lastNavigationTime;
    const minLoadingTime = isLowPerformanceMode ? 150 : 300; // Even shorter for low performance mode
    
    // Calculate final delay - cap maximum delay for low performance devices
    let finalDelay = isLowPerformanceMode ? Math.min(delay, 100) : delay;
    if (timeSinceNavigation < minLoadingTime) {
      finalDelay = Math.max(finalDelay, minLoadingTime - timeSinceNavigation);
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