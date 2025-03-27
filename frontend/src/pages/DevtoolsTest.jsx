import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

/**
 * This component creates several test queries to verify
 * that React Query DevTools are working correctly
 */
export default function DevtoolsTest() {
  const [counter, setCounter] = useState(0)
  
  // Create a test query that will show up in DevTools
  const { data: testData, isLoading, refetch } = useQuery({
    queryKey: ['devtools-test', counter],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        message: 'DevTools Test Data',
        timestamp: new Date().toISOString(),
        counter
      }
    },
    staleTime: 5000,
    meta: {
      tracked: true,
      source: 'DevtoolsTest'
    }
  })
  
  // Create another query with different options
  useQuery({
    queryKey: ['devtools-test-stale'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        message: 'This query should be stale',
        timestamp: new Date().toISOString()
      }
    },
    staleTime: 0, // Immediately stale
    meta: {
      tracked: true
    }
  })
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">React Query DevTools Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-2">Instructions</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>You should see a React Query DevTools button in the bottom-right corner</li>
          <li>Click it to open the DevTools panel</li>
          <li>You should see the test queries in the panel</li>
          <li>Use the buttons below to test different query states</li>
        </ul>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Test Query Data</h2>
        <pre className="bg-gray-800 text-white p-3 rounded overflow-auto max-h-60">
          {isLoading ? 'Loading...' : JSON.stringify(testData, null, 2)}
        </pre>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            setCounter(c => c + 1)
            refetch()
          }}
        >
          Update Query
        </button>
        
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => {
            // Force a stale query to refetch
            const queryClient = window.queryClient
            queryClient.invalidateQueries({ queryKey: ['devtools-test-stale'] })
          }}
        >
          Invalidate Stale Query
        </button>
        
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={() => {
            // Add random query to test
            const queryClient = window.queryClient
            const randomId = Math.floor(Math.random() * 1000)
            queryClient.setQueryData(['random-test', randomId], {
              message: `Random test query ${randomId}`,
              timestamp: new Date().toISOString()
            })
          }}
        >
          Add Random Query
        </button>
      </div>
    </div>
  )
} 