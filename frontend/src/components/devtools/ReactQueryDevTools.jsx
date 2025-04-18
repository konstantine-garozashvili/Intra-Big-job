import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '../../lib/services/queryClient'
import { useEffect } from 'react'

export function ReactQueryDevTools() {
  // Initialize test data for debugging only once on mount
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Check if data already exists to prevent duplicate initialization
      if (!queryClient.getQueryData(['persistent-test-query'])) {
        queryClient.setQueryData(['persistent-test-query'], {
          message: 'React Query is working!',
          timestamp: new Date().toISOString(),
          status: 'active'
        });
      }
      
      if (!queryClient.getQueryData(['persistent-mutation'])) {
        queryClient.setQueryData(['persistent-mutation'], {
          message: 'Mutation example',
          status: 'idle'
        });
      }
    }
  }, []);

  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <ReactQueryDevtools
      initialIsOpen={false}
      position="bottom"
      buttonPosition="bottom-right"
      toggleButtonProps={{
        style: {
          zIndex: 999999,
          position: 'fixed',
          bottom: '12px',
          right: '12px'
        }
      }}
    />
  )
}
