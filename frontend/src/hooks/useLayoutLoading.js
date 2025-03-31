import { useContext, useEffect } from 'react';
import { LayoutContext } from '../components/MainLayout';

/**
 * Custom hook to manage layout loading state
 * @param {boolean} isLoading - Whether the component is loading
 * @param {boolean} [immediate=false] - Whether to update the loading state immediately
 * @param {number} [delay=300] - Delay in ms before setting loading to false
 */
export const useLayoutLoading = (isLoading, immediate = false, delay = 300) => {
  const { setLayoutLoading } = useContext(LayoutContext);

  useEffect(() => {
    // If immediate is true, update loading state immediately
    if (immediate) {
      setLayoutLoading(isLoading);
      return;
    }

    // If component is loading, set layout loading immediately
    if (isLoading) {
      setLayoutLoading(true);
      return;
    }

    // If component is done loading, wait for delay before setting layout loading to false
    const timer = setTimeout(() => {
      setLayoutLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [isLoading, setLayoutLoading, immediate, delay]);

  return { setLayoutLoading };
};

export default useLayoutLoading; 