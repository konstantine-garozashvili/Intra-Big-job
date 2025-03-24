import { createContext, useContext, useState, useEffect } from 'react';

// Créer le contexte
const ThemeContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
};

// Provider du contexte
export const ThemeProvider = ({ children }) => {
  // État local pour le thème
  const [theme, setTheme] = useState('light');
  
  // Effet pour récupérer le thème stocké lors du chargement initial
  useEffect(() => {
    // Récupérer le thème depuis localStorage s'il existe
    const storedTheme = localStorage.getItem('theme');
    
    // Vérifier la préférence du système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Si un thème est stocké, l'utiliser
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // Sinon, utiliser la préférence du système
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Appliquer le thème au document
    document.documentElement.classList.toggle('dark', storedTheme === 'dark' || (!storedTheme && prefersDark));
  }, []);
  
  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Mettre à jour l'état
    setTheme(newTheme);
    
    // Stocker dans localStorage
    localStorage.setItem('theme', newTheme);
    
    // Appliquer au document
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  // Fonction pour définir un thème spécifique
  const setThemeMode = (mode) => {
    // Valider le mode
    if (mode !== 'light' && mode !== 'dark') {
      console.error('Mode de thème invalide. Utilisez "light" ou "dark".');
      return;
    }
    
    // Mettre à jour l'état
    setTheme(mode);
    
    // Stocker dans localStorage
    localStorage.setItem('theme', mode);
    
    // Appliquer au document
    document.documentElement.classList.toggle('dark', mode === 'dark');
  };
  
  // Valeur du contexte
  const value = {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isDark: theme === 'dark'
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 