import axios from 'axios';
import { 
  preserveUntranslatableTerms, 
  containsUntranslatableTerm 
} from '../constants/untranslatableTerms';

/**
 * Service de gestion des traductions
 * Communique avec l'API de traduction du backend
 */
class TranslationService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Intercepteur pour ajouter le token JWT aux requêtes
    this.apiClient.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  
  /**
   * Traduit un texte dans la langue cible
   * 
   * @param {string} text - Le texte à traduire
   * @param {string} targetLang - La langue cible (code ISO)
   * @param {string} sourceLang - La langue source (code ISO, optionnel)
   * @returns {Promise<string>} - Le texte traduit
   */
  async translateText(text, targetLang, sourceLang = null) {
    // Si le texte est vide, retourner une chaîne vide
    if (!text || text.trim() === '') {
      return '';
    }
    
    // Si le texte contient uniquement des termes non-traduisibles, le retourner tel quel
    if (containsUntranslatableTerm(text) && text.length < 100) {
      return text;
    }
    
    try {
      // Préserver les termes non-traduisibles
      const { preparedText, restoreTerms } = preserveUntranslatableTerms(text);
      
      const response = await this.apiClient.post('/translation/translate', {
        text: preparedText,
        target_language: targetLang,
        source_language: sourceLang
      });
      
      // Restaurer les termes préservés
      return restoreTerms(response.data.translation);
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
      return text; // En cas d'erreur, retourner le texte original
    }
  }
  
  /**
   * Traduit un lot de textes dans la langue cible
   * 
   * @param {string[]} texts - Les textes à traduire
   * @param {string} targetLang - La langue cible (code ISO)
   * @param {string} sourceLang - La langue source (code ISO, optionnel)
   * @returns {Promise<string[]>} - Les textes traduits
   */
  async translateBatch(texts, targetLang, sourceLang = null) {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }
    
    // Filtrer les textes vides ou nuls
    const validTexts = texts.filter(text => text && text.trim() !== '');
    if (validTexts.length === 0) {
      return texts;
    }
    
    try {
      // Préserver les termes non-traduisibles pour chaque texte
      const preparedItems = validTexts.map(text => preserveUntranslatableTerms(text));
      const preparedTexts = preparedItems.map(item => item.preparedText);
      
      const response = await this.apiClient.post('/translation/batch', {
        texts: preparedTexts,
        target_language: targetLang,
        source_language: sourceLang
      });
      
      // Restaurer les termes préservés pour chaque texte traduit
      const translations = response.data.translations;
      const results = [];
      
      texts.forEach((text, index) => {
        if (!text || text.trim() === '') {
          results.push('');
        } else if (translations[index]) {
          const restoredText = preparedItems[index].restoreTerms(translations[index]);
          results.push(restoredText);
        } else {
          results.push(text);
        }
      });
      
      return results;
    } catch (error) {
      console.error('Erreur lors de la traduction par lot:', error);
      return texts; // En cas d'erreur, retourner les textes originaux
    }
  }
  
  /**
   * Détecte la langue d'un texte
   * 
   * @param {string} text - Le texte à analyser
   * @returns {Promise<string>} - Le code de langue détecté
   */
  async detectLanguage(text) {
    if (!text || text.trim() === '') {
      return null;
    }
    
    // Si le texte contient uniquement des termes non-traduisibles, considérer français par défaut
    if (containsUntranslatableTerm(text) && text.length < 100) {
      return 'fr';
    }
    
    try {
      const response = await this.apiClient.post('/translation/detect', {
        text
      });
      
      return response.data.language;
    } catch (error) {
      console.error('Erreur lors de la détection de langue:', error);
      return null;
    }
  }
  
  /**
   * Récupère la liste des langues disponibles
   * 
   * @returns {Promise<Array>} - Liste des langues disponibles
   */
  async getAvailableLanguages() {
    try {
      const response = await this.apiClient.get('/translation/languages');
      return response.data.languages;
    } catch (error) {
      console.error('Erreur lors de la récupération des langues:', error);
      return [
        { code: 'fr', name: 'Français' },
        { code: 'en', name: 'Anglais' },
        { code: 'es', name: 'Espagnol' },
        { code: 'de', name: 'Allemand' },
      ];
    }
  }
}

export default new TranslationService(); 