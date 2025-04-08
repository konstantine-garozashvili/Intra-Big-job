/**
 * Configuration et utilitaires pour Google reCAPTCHA
 */

// Définir directement la clé de test pour garantir qu'elle fonctionne
export const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

// Log pour le débogage
console.log('Utilisation de la clé reCAPTCHA:', RECAPTCHA_SITE_KEY);

/**
 * Vérifie la validité d'un token reCAPTCHA avec le backend
 * 
 * @param {string} token - Token reCAPTCHA à vérifier
 * @returns {Promise<boolean>} - Promesse qui se résout avec la validité du token
 */
export const verifyRecaptchaToken = async (token) => {
  try {
    if (!token) {
      console.warn('Tentative de vérification avec un token null');
      return false;
    }
    
    console.log('Vérification du token reCAPTCHA:', token.substring(0, 10) + '...');
    
    // En mode développement, simuler une validation réussie
    if (import.meta.env.DEV) {
      console.log('DEV MODE: Simulation de vérification reCAPTCHA réussie');
      return true;
    }
    
    // Vérifie l'existence de l'endpoint dans un try/catch
    try {
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Réponse de vérification reCAPTCHA:', data);
      return data.success === true;
    } catch (fetchError) {
      console.warn('Erreur lors de la vérification via API:', fetchError);
      // En mode développement, accepter quand même si l'API n'est pas disponible
      return import.meta.env.DEV;
    }
  } catch (error) {
    console.error('Erreur reCAPTCHA:', error);
    // En développement, on accepte même en cas d'erreur
    return import.meta.env.DEV;
  }
}; 