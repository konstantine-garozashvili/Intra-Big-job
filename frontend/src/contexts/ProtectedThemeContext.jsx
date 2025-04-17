import { createContext, useContext, useState, useEffect } from 'react';

// Create the protected theme context
export const ProtectedThemeContext = createContext();

// Theme provider component for protected routes
export const ProtectedThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const storedTheme = localStorage.getItem('protectedTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    document.documentElement.classList.toggle('dark', storedTheme === 'dark' || (!storedTheme && prefersDark));
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('protectedTheme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  const setThemeMode = (mode) => {
    if (mode !== 'light' && mode !== 'dark') {
      console.error('Invalid theme mode. Use "light" or "dark".');
      return;
    }
    
    setTheme(mode);
    localStorage.setItem('protectedTheme', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  };
  
  const value = {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isDark: theme === 'dark'
  };
  
  return (
    <ProtectedThemeContext.Provider value={value}>
      {children}
    </ProtectedThemeContext.Provider>
  );
};

// Custom hook for using protected theme
export const useProtectedTheme = () => {
  const context = useContext(ProtectedThemeContext);
  if (!context) {
    throw new Error('useProtectedTheme must be used within a ProtectedThemeProvider');
  }
  return context;
}; 