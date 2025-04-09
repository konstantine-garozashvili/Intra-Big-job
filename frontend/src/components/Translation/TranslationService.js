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
    
    console.log('Service de traduction initialisé pour le projet:', this.projectId);
  }

  /**
   * Obtient l'origine de la page actuelle pour le referer
   * @returns {string} L'origine de la page actuelle
   */
  getOrigin() {
    return window.location.origin;
  }

  /**
   * Crée les en-têtes HTTP avec referer pour résoudre le problème de restriction
   * @returns {Object} Les en-têtes HTTP
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'referer': this.getOrigin() // Ajout d'un referer valide pour passer les restrictions
    };
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
      
      const url = `${this.baseApiUrl}?key=${this.apiKey}`;
      const body = {
        q: text,
        target: targetLang,
        format: 'text'
      };
      
      if (sourceLang) {
        body.source = sourceLang;
      }
      
      console.log(`Traduction: "${text}" vers ${targetLang}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Erreur de traduction détaillée:', error);
        throw new Error(error.error?.message || 'Erreur de traduction');
      }
      
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
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
      
      const url = `${this.baseApiUrl}/detect?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          q: text
        }),
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
}

export const translationService = new TranslationService(); 