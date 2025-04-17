import { createContext, useContext, useState, useMemo } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [colorMode, setColorMode] = useState('navy');
  const [themeMode, setThemeMode] = useState('public');
  
  const currentTheme = useMemo(() => {
    const baseTheme = {
      bg: colorMode === 'light' ? 'bg-white' : 'bg-gray-900',
      textPrimary: colorMode === 'light' ? 'text-gray-900' : 'text-white',
      textSecondary: colorMode === 'light' ? 'text-gray-600' : 'text-gray-300',
      textHighlight: colorMode === 'light' ? 'text-blue-600' : 'text-blue-400',
      border: colorMode === 'light' ? 'border-gray-200' : 'border-gray-700',
      cardBg: colorMode === 'light' ? 'bg-white' : 'bg-gray-800',
      shadow: 'shadow-lg',
      buttonBg: colorMode === 'light' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600',
      buttonAlt: colorMode === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-700 text-white hover:bg-gray-600',
      cosmicBg: colorMode === 'navy' ? 'bg-[#002147]' : 'bg-[#2D0922]',
      cosmicGlow: colorMode === 'navy' ? 'from-blue-900/20 to-blue-900/10' : 'from-purple-900/20 to-purple-900/10',
      buttonGradient: colorMode === 'navy' ? 'from-blue-600 to-blue-700' : 'from-purple-600 to-purple-700'
    };

    const publicTheme = {
      ...baseTheme,
      navBg: 'bg-transparent',
      navText: 'text-white',
      navTextHover: colorMode === 'navy' ? 'hover:text-blue-400' : 'hover:text-purple-400',
      navBrand: {
        primary: 'text-white',
        secondary: colorMode === 'navy' ? 'text-[#528eb2]' : 'text-purple-400'
      }
    };

    const protectedTheme = {
      ...baseTheme,
      navBg: colorMode === 'light' ? 'bg-white' : 'bg-gray-900',
      navText: colorMode === 'light' ? 'text-gray-900' : 'text-white',
      navTextHover: colorMode === 'light' ? 'hover:text-blue-600' : 'hover:text-blue-400',
      navBrand: {
        primary: colorMode === 'light' ? 'text-gray-900' : 'text-white',
        secondary: colorMode === 'light' ? 'text-blue-600' : 'text-blue-400'
      }
    };

    return themeMode === 'public' ? publicTheme : protectedTheme;
  }, [colorMode, themeMode]);

  const value = {
    colorMode,
    themeMode,
    currentTheme,
    toggleColorMode: () => setColorMode(prev => prev === 'navy' ? 'purple' : 'navy'),
    setThemeMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}