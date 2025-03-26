import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.jsx'
import './index.css'
import { queryClient } from './lib/services/queryClient'

// Expose queryClient globally for debugging
window.queryClient = queryClient;

// Create a style element for ReactQueryDevtools
const queryDevToolsStyle = document.createElement('style')
queryDevToolsStyle.innerHTML = `
  .__react-query-devtools-panel__ {
    z-index: 99999 !important;
    background: rgba(255, 255, 255, 0.95) !important;
    border-radius: 8px !important;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2) !important;
  }
  .__react-query-devtools-button__ {
    z-index: 99999 !important;
    bottom: 12px !important;
    left: 12px !important;
  }
`
document.head.appendChild(queryDevToolsStyle)

// StrictMode est activé pour assurer une meilleure qualité du code
// Note: Si des problèmes d'interface surviennent pendant le développement (double montage/démontage),
// vous pouvez temporairement désactiver StrictMode en supprimant les balises <StrictMode>
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Les DevTools ne sont affichés qu'en développement */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={true} />} 
    </QueryClientProvider>
  </StrictMode>
)
