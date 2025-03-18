import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.jsx'
import './index.css'
import './lib/animations.css'
import './lib/no-scrollbars.css'
import { setQueryClient } from './lib/services/queryClient'

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes (augmenté de 5 à 10 minutes)
      cacheTime: 30 * 60 * 1000, // 30 minutes (augmenté de 10 à 30 minutes)
      refetchOnWindowFocus: false, // Désactivé pour éviter les requêtes inutiles
      retry: 1, // Réessayer une fois en cas d'échec
      refetchOnMount: false, // Ne pas refetch automatiquement au montage
      refetchOnReconnect: false, // Ne pas refetch automatiquement à la reconnexion
      retryDelay: 1000, // Attendre 1 seconde avant de réessayer
      timeout: 3000, // Réduit de 10000ms à 5000ms pour accélérer les requêtes
      useErrorBoundary: false, // Ne pas utiliser les error boundaries
      suspense: false, // Ne pas utiliser Suspense pour les requêtes
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
      timeout: 3000, // Réduit de 10000ms à 5000ms pour accélérer les mutations
      useErrorBoundary: false, // Ne pas utiliser les error boundaries
    }
  },
})

// Définir l'instance du queryClient pour l'accès global
setQueryClient(queryClient)

// StrictMode est activé pour assurer une meilleure qualité du code
// Note: Si des problèmes d'interface surviennent pendant le développement (double montage/démontage),
// vous pouvez temporairement désactiver StrictMode en supprimant les balises <StrictMode>
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Les DevTools ne sont affichés qu'en développement */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
)
