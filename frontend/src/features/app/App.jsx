import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { queryClient } from '../../lib/services/queryClient';

// Composants modulaires
import AppInitializer from './AppInitializer';
import IntelligentPreload from './IntelligentPreload';
import AppRoutes from './AppRoutes';
import { lazyComponents } from './lazyComponents';

/**
 * Composant App - Point d'entrée principal de l'application
 * Refactorisé pour une meilleure séparation des responsabilités
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            {/* Initialisation des services et configurations */}
            <AppInitializer />
            
            {/* Préchargement intelligent des pages */}
            <IntelligentPreload />
            
            {/* Configuration des routes */}
            <AppRoutes lazyComponents={lazyComponents} />
            
            {/* Notifications toast */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#ffffff',
                  color: '#333333',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px',
                  padding: '16px',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      
      {/* Outils de développement React Query (uniquement en développement) */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
};

export default App;
