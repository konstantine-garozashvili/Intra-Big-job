import React, { createContext, useContext, useState, useEffect } from 'react';
import { translationService } from '../components/Translation/TranslationService';

const TranslationContext = createContext();

const DEFAULT_LANGUAGE = 'fr';
const STORAGE_KEY = 'preferred_language';

export function TranslationProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
  });
  
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);

  // Sauvegarder la langue préférée
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentLanguage);
  }, [currentLanguage]);

  // Fonction pour changer de langue
  const changeLanguage = async (newLanguage) => {
    try {
      setLoading(true);
      setCurrentLanguage(newLanguage);
      // Ici, vous pourriez précharger certaines traductions communes
      // ou effectuer d'autres initialisations nécessaires
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour traduire un texte
  const translate = async (text, targetLang = currentLanguage) => {
    if (!text) return '';
    
    // Vérifier si nous avons déjà la traduction en cache
    const cacheKey = `${text}_${targetLang}`;
    if (translations[cacheKey]) {
      return translations[cacheKey];
    }

    try {
      const translatedText = await translationService.translateText(text, targetLang);
      // Mettre en cache la traduction
      setTranslations(prev => ({
        ...prev,
        [cacheKey]: translatedText
      }));
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Retourner le texte original en cas d'erreur
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    translate,
    loading,
    translationService
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

export default TranslationContext; 