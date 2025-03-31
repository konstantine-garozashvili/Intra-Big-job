import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Créer le contexte
const TranslationContext = createContext(null);

/**
 * Détermine la langue préférée de l'utilisateur
 * Ordre de priorité : préférence stockée → navigateur → français
 * @returns {string} - Code de langue
 */
function getPreferredLanguage() {
  // 1. Vérifier la préférence stockée
  const storedLang = localStorage.getItem('preferred_language');
  if (storedLang) {
    return storedLang;
  }
  
  // 2. Vérifier la langue du navigateur
  try {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    
    // Vérifier si la langue est supportée
    if (['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'ru', 'zh', 'ja'].includes(browserLang)) {
      return browserLang;
    }
  } catch (e) {
    console.warn('Erreur lors de la récupération de la langue du navigateur:', e);
  }
  
  // 3. Par défaut : français
  return 'fr';
}

/**
 * Options par défaut pour le fournisseur de traduction
 */
const defaultOptions = {
  defaultLanguage: 'fr',
  defaultSourceLanguage: 'fr',
  cacheInSession: true,
  availableLanguages: [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ar', name: 'العربية' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
  ]
};

/**
 * Fournisseur de traduction pour l'application
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Enfants du composant
 * @param {Object} props.options - Options du fournisseur de traduction
 */
export function TranslationProvider({ children, options = {} }) {
  // Obtenir la langue préférée
  const preferredLanguage = getPreferredLanguage();
  
  // Fusionner les options avec les valeurs par défaut
  const config = { 
    ...defaultOptions, 
    ...options,
    defaultLanguage: preferredLanguage
  };
  
  // Utiliser le hook de traduction
  const translation = useTranslation(config);
  
  const { 
    translateText,
    translateBatch,
    translateObject,
    isLoading,
    error,
    currentLanguage,
    changeLanguage,
    clearTranslationCache
  } = translation;
  
  // État pour les langues disponibles
  const [availableLanguages, setAvailableLanguages] = useState(config.availableLanguages);
  
  // Définir la langue du document HTML
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    
    // Ajuster la direction du texte en fonction de la langue
    if (currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [currentLanguage]);
  
  return (
    <TranslationContext.Provider
      value={{
        translateText,
        translateBatch,
        translateObject,
        isLoading,
        error,
        currentLanguage,
        changeLanguage,
        clearTranslationCache,
        availableLanguages,
        setAvailableLanguages
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte de traduction
 * @returns {Object} - Contexte de traduction
 */
export function useTranslationContext() {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useTranslationContext doit être utilisé à l\'intérieur d\'un TranslationProvider');
  }
  
  return context;
}

/**
 * Composant HOC pour traduire un texte
 * @param {Object} props - Propriétés du composant
 * @param {string} props.text - Texte à traduire
 * @param {Object} props.rest - Autres propriétés à passer au span
 */
export function T({ text, ...rest }) {
  const { translateText, currentLanguage } = useTranslationContext();
  const [translated, setTranslated] = useState(text);
  
  useEffect(() => {
    const translate = async () => {
      const result = await translateText(text);
      setTranslated(result);
    };
    
    translate();
  }, [text, translateText, currentLanguage]);
  
  return <span {...rest}>{translated}</span>;
} 