import { useState, useEffect, useCallback, useMemo } from 'react';
import translationService from '../lib/services/translationService';

/**
 * Hook pour la gestion des traductions
 * @param {Object} options - Options de configuration
 * @param {string} options.defaultLanguage - Langue par défaut
 * @param {boolean} options.cacheInSession - Activer le cache en session
 * @returns {Object} - Fonctions et états pour la gestion des traductions
 */
export function useTranslation(options = {}) {
  const { 
    defaultLanguage = 'fr',
    cacheInSession = true
  } = options;
  
  // État pour la langue actuelle
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
  
  // États pour la gestion des erreurs et du chargement
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache de traduction en mémoire pour la session
  const translationCache = useMemo(() => {
    const cacheKey = 'translation_cache';
    
    // Fonction pour obtenir le cache
    const getCache = () => {
      if (!cacheInSession) return {};
      
      try {
        const cachedData = sessionStorage.getItem(cacheKey);
        return cachedData ? JSON.parse(cachedData) : {};
      } catch (e) {
        console.warn('Erreur lors de la récupération du cache de traduction:', e);
        return {};
      }
    };
    
    // Fonction pour définir le cache
    const setCache = (cache) => {
      if (!cacheInSession) return;
      
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(cache));
      } catch (e) {
        console.warn('Erreur lors de la sauvegarde du cache de traduction:', e);
      }
    };
    
    // Fonction pour ajouter une traduction au cache
    const addToCache = (text, targetLang, translation) => {
      if (!cacheInSession) return;
      
      try {
        const cache = getCache();
        if (!cache[targetLang]) {
          cache[targetLang] = {};
        }
        
        cache[targetLang][text] = translation;
        setCache(cache);
      } catch (e) {
        console.warn('Erreur lors de l\'ajout au cache de traduction:', e);
      }
    };
    
    // Fonction pour récupérer une traduction du cache
    const getFromCache = (text, targetLang) => {
      if (!cacheInSession) return null;
      
      try {
        const cache = getCache();
        return cache[targetLang]?.[text] || null;
      } catch (e) {
        console.warn('Erreur lors de la récupération du cache de traduction:', e);
        return null;
      }
    };
    
    // Fonction pour vider le cache
    const clearCache = () => {
      if (!cacheInSession) return;
      
      try {
        sessionStorage.removeItem(cacheKey);
      } catch (e) {
        console.warn('Erreur lors de la suppression du cache de traduction:', e);
      }
    };
    
    return { getFromCache, addToCache, clearCache };
  }, [cacheInSession]);
  
  // Initialisation de la langue préférée au chargement
  useEffect(() => {
    // Récupérer la langue préférée du localStorage ou utiliser la langue par défaut
    const storedLang = localStorage.getItem('preferred_language');
    
    // Si aucune langue n'est stockée, définir la langue par défaut
    if (!storedLang) {
      localStorage.setItem('preferred_language', defaultLanguage);
      setCurrentLanguage(defaultLanguage);
    } else {
      setCurrentLanguage(storedLang);
    }
    
    // Définir la langue du document HTML
    document.documentElement.lang = storedLang || defaultLanguage;
  }, [defaultLanguage]);
  
  /**
   * Fonction pour changer la langue actuelle
   * @param {string} language - Nouvelle langue
   */
  const changeLanguage = useCallback((language) => {
    // Sauvegarder la préférence de langue
    localStorage.setItem('preferred_language', language);
    setCurrentLanguage(language);
    
    // Mettre à jour l'attribut lang sur l'élément HTML
    document.documentElement.lang = language;
  }, []);
  
  /**
   * Fonction pour vider le cache de traduction
   */
  const clearTranslationCache = useCallback(() => {
    translationCache.clearCache();
  }, [translationCache]);
  
  /**
   * Fonction pour traduire un texte
   * @param {string} text - Texte à traduire
   * @param {string} targetLang - Langue cible (utilise currentLanguage par défaut)
   * @param {string} sourceLang - Langue source (détection automatique par défaut)
   * @returns {Promise<string>} - Texte traduit
   */
  const translateText = useCallback(async (text, targetLang = null, sourceLang = null) => {
    if (!text) return '';
    
    // Si le texte est déjà dans la langue cible, le retourner tel quel
    const actualTargetLang = targetLang || currentLanguage;
    // Définir explicitement le français comme langue source par défaut
    const actualSourceLang = sourceLang || 'fr';
    
    // Vérifier le cache avant de faire une requête API
    const cachedTranslation = translationCache.getFromCache(text, actualTargetLang);
    if (cachedTranslation) {
      return cachedTranslation;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const translatedText = await translationService.translateText(
        text,
        actualTargetLang,
        actualSourceLang  // Toujours passer une langue source
      );
      
      // Ajouter la traduction au cache
      translationCache.addToCache(text, actualTargetLang, translatedText);
      
      return translatedText;
    } catch (err) {
      setError(err);
      console.error('Erreur de traduction:', err);
      return text; // En cas d'erreur, retourner le texte original
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, translationCache]);
  
  /**
   * Fonction pour traduire un lot de textes
   * @param {string[]} texts - Tableau de textes à traduire
   * @param {string} targetLang - Langue cible (utilise currentLanguage par défaut)
   * @param {string} sourceLang - Langue source (détection automatique par défaut)
   * @returns {Promise<string[]>} - Tableau de textes traduits
   */
  const translateBatch = useCallback(async (texts, targetLang = null, sourceLang = null) => {
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return [];
    }
    
    const actualTargetLang = targetLang || currentLanguage;
    
    // Vérifier quels textes sont déjà dans le cache
    const results = new Array(texts.length);
    const textsToTranslate = [];
    const indicesMap = [];
    
    texts.forEach((text, index) => {
      if (!text) {
        results[index] = '';
        return;
      }
      
      const cached = translationCache.getFromCache(text, actualTargetLang);
      if (cached) {
        results[index] = cached;
      } else {
        textsToTranslate.push(text);
        indicesMap.push(index);
      }
    });
    
    // Si tous les textes sont dans le cache, retourner les résultats
    if (textsToTranslate.length === 0) {
      return results;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const translatedTexts = await translationService.translateBatch(
        textsToTranslate,
        actualTargetLang,
        sourceLang
      );
      
      // Ajouter les traductions au cache et aux résultats
      translatedTexts.forEach((translatedText, index) => {
        const originalIndex = indicesMap[index];
        const originalText = textsToTranslate[index];
        
        results[originalIndex] = translatedText;
        translationCache.addToCache(originalText, actualTargetLang, translatedText);
      });
      
      return results;
    } catch (err) {
      setError(err);
      console.error('Erreur de traduction par lot:', err);
      
      // En cas d'erreur, remplir les résultats manquants avec les textes originaux
      indicesMap.forEach((originalIndex, index) => {
        if (!results[originalIndex]) {
          results[originalIndex] = textsToTranslate[index];
        }
      });
      
      return results;
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, translationCache]);
  
  /**
   * Fonction pour traduire un objet (récursivement)
   * @param {Object} obj - Objet à traduire
   * @param {string} targetLang - Langue cible
   * @param {string} sourceLang - Langue source
   * @returns {Promise<Object>} - Objet traduit
   */
  const translateObject = useCallback(async (obj, targetLang = null, sourceLang = null) => {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    // Si c'est un tableau, traduire chaque élément
    if (Array.isArray(obj)) {
      const promises = obj.map(item => 
        typeof item === 'string' 
          ? translateText(item, targetLang, sourceLang)
          : translateObject(item, targetLang, sourceLang)
      );
      
      return Promise.all(promises);
    }
    
    // Si c'est un objet, traduire récursivement chaque propriété
    const result = {};
    const promises = [];
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        
        if (typeof value === 'string') {
          promises.push(
            translateText(value, targetLang, sourceLang).then(translated => {
              result[key] = translated;
            })
          );
        } else if (typeof value === 'object' && value !== null) {
          promises.push(
            translateObject(value, targetLang, sourceLang).then(translated => {
              result[key] = translated;
            })
          );
        } else {
          result[key] = value;
        }
      }
    }
    
    await Promise.all(promises);
    return result;
  }, [translateText]);
  
  return {
    translateText,
    translateBatch,
    translateObject,
    changeLanguage,
    currentLanguage,
    isLoading,
    error,
    clearTranslationCache
  };
}

export default useTranslation; 