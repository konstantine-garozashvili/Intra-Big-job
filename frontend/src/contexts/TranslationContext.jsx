import React, { createContext, useContext, useState, useEffect } from 'react';
import { translationService } from '../components/Translation/TranslationService';
import { toast } from 'sonner';

const TranslationContext = createContext();

const DEFAULT_LANGUAGE = 'fr';
const STORAGE_KEY = 'preferred_language';

export function TranslationProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
  });
  
  const [loading, setLoading] = useState(false);

  // Initialiser la langue au chargement de la page
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    if (savedLanguage && savedLanguage !== currentLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Fonction pour changer de langue
  const changeLanguage = async (newLanguage) => {
    try {
      setLoading(true);
      
      // Sauvegarder la nouvelle langue
      localStorage.setItem(STORAGE_KEY, newLanguage);
      
      // Afficher un message de chargement
      toast.loading('Changement de langue en cours...');
      
      // Recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error('Erreur lors du changement de langue');
    }
  };

  // Fonction pour traduire un texte (utilisée uniquement pour les traductions ponctuelles)
  const translate = async (text, targetLang = currentLanguage) => {
    if (!text) return '';
    
    try {
      return await translationService.translateText(text, targetLang);
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    translate,
    loading
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