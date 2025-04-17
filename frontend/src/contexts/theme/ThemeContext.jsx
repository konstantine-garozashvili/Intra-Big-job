import React, { createContext, useContext } from 'react';
import { PublicThemeProvider } from './PublicThemeContext';
import { ProtectedThemeProvider } from './ProtectedThemeContext';

// Create the global theme context
export const ThemeContext = createContext();

// Global theme provider component
export const ThemeProvider = ({ children }) => {
  return (
    <PublicThemeProvider>
      <ProtectedThemeProvider>
        {children}
      </ProtectedThemeProvider>
    </PublicThemeProvider>
  );
};

// Custom hook for accessing global theme context if needed
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 