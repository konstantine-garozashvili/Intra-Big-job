import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'
import { queryClient } from './lib/services/queryClient'
import { ReactQueryDevTools } from './components/devtools/ReactQueryDevTools.jsx'

// Remove custom styles for devtools as they can conflict with the official ones
// Let the library handle its own styling

// Expose queryClient globally for debugging only in development
if (import.meta.env.DEV) {
  window.queryClient = queryClient;
  
  // Only initialize test data if it doesn't exist already
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

// StrictMode est activé pour assurer une meilleure qualité du code
// Note: Si des problèmes d'interface surviennent pendant le développement (double montage/démontage),
// vous pouvez temporairement désactiver StrictMode en supprimant les balises <StrictMode>
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Les DevTools sont centralisés ici pour éviter les doublons */}
      {import.meta.env.DEV && <ReactQueryDevTools />}
    </QueryClientProvider>
  </StrictMode>
)
