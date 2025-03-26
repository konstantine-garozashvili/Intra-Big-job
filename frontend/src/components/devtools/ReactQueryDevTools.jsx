import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '../../lib/services/queryClient'
import { useEffect } from 'react'

export function ReactQueryDevTools() {
  // Initialize test data for debugging
  useEffect(() => {
    if (import.meta.env.DEV) {
      queryClient.setQueryData(['persistent-test-query'], {
        message: 'React Query is working!',
        timestamp: new Date().toISOString(),
        status: 'active'
      });
      queryClient.setQueryData(['persistent-mutation'], {
        message: 'Mutation example',
        status: 'idle'
      });
    }
  }, []);

  return (
    <ReactQueryDevtools
      initialIsOpen={true}
      position="bottom-left"
      buttonPosition="bottom-left"
      layout="horizontal"
    />
  )
}
