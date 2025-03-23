import { useEffect } from 'react';

/**
 * Empty LoadingOverlay component that doesn't display any loading indicator
 * 
 * @param {Object} props Component props
 * @param {boolean} [props.isVisible=true] Whether the loading overlay should be visible (ignored)
 * @returns {null} This component doesn't render any UI
 */
export default function LoadingOverlay({ isVisible = true }) {
  // This component no longer manages any loading state
  return null;
} 