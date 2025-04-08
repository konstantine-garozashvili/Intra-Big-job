import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'
import { queryClient } from './lib/services/queryClient'
import { ReactQueryDevTools } from './components/devtools/ReactQueryDevTools.jsx'

// Expose queryClient globally for debugging
window.queryClient = queryClient;

// Initialize queryClient with test data for debugging
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

// StrictMode est activé pour assurer une meilleure qualité du code
// Note: Si des problèmes d'interface surviennent pendant le développement (double montage/démontage),
// vous pouvez temporairement désactiver StrictMode en supprimant les balises <StrictMode>
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Les DevTools ne sont affichés qu'en développement */}
      {import.meta.env.DEV && (
        <ReactQueryDevTools />
      )}
    </QueryClientProvider>
  </StrictMode>
)
