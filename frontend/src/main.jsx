import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'
import { queryClient } from './lib/services/queryClient'
import { ReactQueryDevTools } from './components/devtools/ReactQueryDevTools.jsx'

// Create a style element for ReactQueryDevtools
const queryDevToolsStyle = document.createElement('style')
queryDevToolsStyle.innerHTML = `
  .__react-query-devtools-panel__ {
    z-index: 999999 !important; /* Increased z-index to ensure visibility */
    background: rgba(255, 255, 255, 0.95) !important;
    border-radius: 8px !important;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2) !important;
    max-height: 70vh !important;
    overflow: auto !important;
    width: 400px !important;
    position: fixed !important;
    top: 12px !important;
    right: 12px !important;
    pointer-events: all !important;
    display: block !important;
  }
  .__react-query-devtools-button__ {
    z-index: 999999 !important; /* Increased z-index to ensure visibility */
    position: fixed !important;
    top: 12px !important;
    right: 12px !important;
    pointer-events: all !important;
    background: #fff !important;
    border: 1px solid #ddd !important;
    border-radius: 4px !important;
    padding: 8px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    display: block !important;
  }
  .__react-query-devtools-button__ .__react-query-devtools-icon__ {
    width: 24px !important;
    height: 24px !important;
    fill: #666 !important;
  }
  .__react-query-devtools-panel__ .react-query-devtools__content {
    padding: 16px !important;
  }
  .__react-query-devtools-panel__ .react-query-devtools__header {
    cursor: move !important;
  }
`
document.head.appendChild(queryDevToolsStyle)

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
