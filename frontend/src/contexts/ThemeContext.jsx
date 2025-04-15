import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the theme context
export const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme immediately without waiting for localStorage
  const [colorMode, setColorMode] = useState('navy'); // Set navy as immediate default
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Sync with localStorage on mount and theme changes
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setColorMode(savedTheme);
    } else {
      localStorage.setItem('theme', 'navy');
    }
    setIsThemeLoaded(true);
  }, []);

  // Update localStorage when theme changes
  useEffect(() => {
    if (isThemeLoaded) { // Only update localStorage after initial load
      localStorage.setItem('theme', colorMode);
    }
  }, [colorMode, isThemeLoaded]);

  // Toggle theme function
  const toggleColorMode = () => {
    setColorMode(prevMode => prevMode === 'navy' ? 'black' : 'navy');
  };

  // Define theme settings
  const themes = {
    navy: {
      bg: 'bg-gradient-to-b from-[#001a38] to-[#0a3c6e]',
      navBg: 'bg-[#001a38]/80',
      cardBg: 'bg-[#0a3c6e]/30',
      buttonGradient: 'from-blue-600 to-blue-700',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      buttonAlt: 'bg-[#001a38]/60 border border-[#0a3c6e]/50 hover:border-blue-400',
      navButtonBg: 'bg-[#0a3c6e]',
      navButtonBorder: 'border-[#0a3c6e]',
      textPrimary: 'text-blue-100',
      textHighlight: 'text-blue-300',
      shadow: 'shadow-blue-900/20',
    },
    black: {
      bg: 'bg-gradient-to-b from-black to-gray-900',
      navBg: 'bg-black/80',
      cardBg: 'bg-gray-800/30',
      buttonGradient: 'from-gray-700 to-gray-800',
      buttonBg: 'bg-gray-700 hover:bg-gray-600',
      buttonAlt: 'bg-black/60 border border-gray-700/50 hover:border-gray-400',
      navButtonBg: 'bg-gray-800',
      navButtonBorder: 'border-gray-700',
      textPrimary: 'text-gray-100',
      textHighlight: 'text-purple-300',
      shadow: 'shadow-black/30',
    }
  };

  // Current theme object - always available even before localStorage sync
  const currentTheme = themes[colorMode];

  // Context value
  const value = {
    colorMode,
    setColorMode,
    toggleColorMode,
    currentTheme,
    themes,
    isThemeLoaded
  };

  // Render children immediately with default theme
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
