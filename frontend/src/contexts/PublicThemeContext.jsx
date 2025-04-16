import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the public theme context
export const PublicThemeContext = createContext();

// Theme provider component for public routes
export const PublicThemeProvider = ({ children }) => {
  const [colorMode, setColorMode] = useState('navy');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('publicTheme');
    if (savedTheme) {
      setColorMode(savedTheme);
    } else {
      localStorage.setItem('publicTheme', 'navy');
    }
    setIsThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (isThemeLoaded) {
      localStorage.setItem('publicTheme', colorMode);
    }
  }, [colorMode, isThemeLoaded]);

  const toggleColorMode = () => {
    setColorMode(prevMode => prevMode === 'navy' ? 'black' : 'navy');
  };

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

  const currentTheme = themes[colorMode];

  const value = {
    colorMode,
    setColorMode,
    toggleColorMode,
    currentTheme,
    themes,
    isThemeLoaded
  };

  return (
    <PublicThemeContext.Provider value={value}>
      {children}
    </PublicThemeContext.Provider>
  );
};

// Custom hook for using public theme
export const usePublicTheme = () => {
  const context = useContext(PublicThemeContext);
  if (context === undefined) {
    throw new Error('usePublicTheme must be used within a PublicThemeProvider');
  }
  return context;
}; 