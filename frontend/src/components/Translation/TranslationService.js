/**
 * Service de traduction Google Cloud Translation API
 * Version compatible navigateur utilisant l'API REST HTTP
 * avec correction du problème de referer
 */
class TranslationService {
  constructor() {
    // Nous allons utiliser l'API Translation directement
    this.baseApiUrl = 'https://translation.googleapis.com/language/translate/v2';
    
    // La clé API doit être configurée dans votre .env
    this.apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
    
    // Informations du projet pour les logs
    this.projectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID;
    
    // Cache de traduction pour éviter les appels répétés
    this.translationCache = new Map();
  }

  /**
   * Obtient l'origine de la page actuelle pour le referer
   * @returns {string} L'origine de la page actuelle
   */
  getOrigin() {
    return window.location.origin;
  }

  /**
   * Obtient les en-têtes HTTP pour les requêtes à l'API
   * @returns {Object} Les en-têtes HTTP
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': this.getOrigin()
    };
  }

  /**
   * Génère une clé de cache pour une traduction
   * @param {string} text - Le texte à traduire
   * @param {string} targetLang - La langue cible
   * @param {string|null} sourceLang - La langue source (optionnelle)
   * @returns {string} La clé de cache
   */
  getCacheKey(text, targetLang, sourceLang = null) {
    return `${text}|${targetLang}${sourceLang ? `|${sourceLang}` : ''}`;
  }

  /**
   * Vérifie si un objet est un élément React
   * @param {any} obj - L'objet à vérifier
   * @returns {boolean} - True si c'est un élément React
   */
  isReactElement(obj) {
    return obj && (
      typeof obj === 'object' &&
      '$$typeof' in obj ||
      '_owner' in obj ||
      '_store' in obj ||
      'props' in obj
    );
  }

  /**
   * Nettoie un objet des références circulaires
   * @param {any} obj - L'objet à nettoyer
   * @returns {any} - L'objet nettoyé
   */
  cleanCircularReferences(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (this.isReactElement(obj)) {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanCircularReferences(item));
    }

    const cleaned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          if (this.isReactElement(value)) {
            cleaned[key] = String(value);
          } else {
            cleaned[key] = this.cleanCircularReferences(value);
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  /**
   * Traduire un texte
   * @param {string} text - Le texte à traduire
   * @param {string} targetLang - Code de la langue cible
   * @param {string|null} sourceLang - Code de la langue source (optionnel)
   * @returns {Promise<string>} - Le texte traduit
   */
  async translateText(text, targetLang, sourceLang = null) {
    try {
      if (!text) return '';
      
      // Si le texte est un objet React ou contient des références circulaires
      if (typeof text === 'object') {
        text = String(text);
      }
      
      // Vérifier le cache
      const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
      if (this.translationCache.has(cacheKey)) {
        return this.translationCache.get(cacheKey);
      }

      const url = `${this.baseApiUrl}?key=${this.apiKey}`;
      const body = {
        q: text,
        target: targetLang,
        format: 'text'
      };
      
      if (sourceLang) {
        body.source = sourceLang;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(this.cleanCircularReferences(body)),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Erreur de traduction détaillée:', error);
        throw new Error(error.error?.message || 'Erreur de traduction');
      }
      
      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;
      
      // Mettre en cache la traduction
      this.translationCache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // En cas d'erreur, retourner le texte original
    }
  }

  /**
   * Détecter la langue d'un texte
   * @param {string} text - Le texte dont on veut détecter la langue
   * @returns {Promise<string>} - Le code de la langue détectée
   */
  async detectLanguage(text) {
    try {
      if (!text) return '';
      
      // Si le texte est un objet React ou contient des références circulaires
      if (typeof text === 'object') {
        text = String(text);
      }
      
      const url = `${this.baseApiUrl}/detect?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(this.cleanCircularReferences({
          q: text
        })),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Erreur de détection détaillée:', error);
        throw new Error(error.error?.message || 'Erreur de détection de langue');
      }
      
      const data = await response.json();
      return data.data.detections[0][0].language;
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }

  /**
   * Obtenir les langues disponibles
   * @param {string} targetLanguage - Langue dans laquelle afficher les noms des langues
   * @returns {Promise<Array>} - Liste des langues disponibles
   */
  async getAvailableLanguages(targetLanguage = 'fr') {
    try {
      const url = `${this.baseApiUrl}/languages?key=${this.apiKey}&target=${targetLanguage}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Erreur de récupération des langues détaillée:', error);
        throw new Error(error.error?.message || 'Erreur lors de la récupération des langues');
      }
      
      const data = await response.json();
      return data.data.languages;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  }

  /**
   * Vide le cache de traduction
   */
  clearCache() {
    this.translationCache.clear();
  }
}

export const translationService = new TranslationService(); 