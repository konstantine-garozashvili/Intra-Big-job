/**
 * Utilitaires de validation pour les formulaires
 */

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si l'email est valide
 */
export const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

/**
 * Valide un mot de passe selon des critères de complexité
 * @param {string} password - Mot de passe à valider
 * @returns {Object} - Résultat de validation avec détails
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const isValid = 
    password.length >= minLength && 
    hasUpperCase && 
    hasLowerCase && 
    hasDigit && 
    hasSpecialChar;
  
  return {
    isValid,
    errors: {
      length: password.length < minLength,
      upperCase: !hasUpperCase,
      lowerCase: !hasLowerCase,
      digit: !hasDigit,
      specialChar: !hasSpecialChar
    }
  };
};

/**
 * Valide un code postal français
 * @param {string} postalCode - Code postal à valider
 * @returns {boolean} - True si le code postal est valide
 */
export const isValidPostalCode = (postalCode) => {
  // Nettoyer le code postal (enlever les espaces)
  const cleanPostalCode = postalCode.replace(/\s/g, '');
  
  // Vérifier qu'il s'agit de 5 chiffres
  const regex = /^[0-9]{5}$/;
  return regex.test(cleanPostalCode);
};

/**
 * Valide un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean} - True si le numéro est valide
 */
export const isValidPhone = (phone) => {
  // Si vide ou non défini
  if (!phone) return false;
  
  // Nettoyer le numéro (enlever les espaces, +, etc.)
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Si le numéro commence par 33 (indicatif français), on l'enlève
  const frenchNumber = cleanPhone.startsWith('33') 
    ? cleanPhone.substring(2) 
    : cleanPhone;
  
  // Pour un numéro français valide:
  // - Doit commencer par 0 (si pas d'indicatif)
  // - Doit avoir 10 chiffres au total (incluant le 0)
  // - Le deuxième chiffre doit être 1-9
  if (frenchNumber.length !== 10) return false;
  
  // Vérifier que le numéro commence par 0 et le deuxième chiffre est entre 1-9
  return frenchNumber.startsWith('0') && /^0[1-9]/.test(frenchNumber);
};

/**
 * Formate un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone à formater
 * @returns {string} - Numéro formaté
 */
export const formatPhone = (phone) => {
  // Nettoyer le numéro (enlever les espaces, tirets, etc.)
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Si le numéro commence par 33 (indicatif français), on l'enlève
  if (cleanPhone.startsWith('33')) {
    cleanPhone = '0' + cleanPhone.substring(2);
  }
  
  // S'assurer que le numéro commence par 0
  if (!cleanPhone.startsWith('0') && cleanPhone.length === 9) {
    cleanPhone = '0' + cleanPhone;
  }
  
  // Limiter à 10 chiffres
  cleanPhone = cleanPhone.slice(0, 10);
  
  // Formater avec des espaces (XX XX XX XX XX)
  if (cleanPhone.length === 0) return '';
  
  let formatted = '';
  for (let i = 0; i < cleanPhone.length; i += 2) {
    formatted += cleanPhone.substring(i, Math.min(i+2, cleanPhone.length));
    if (i+2 < cleanPhone.length) {
      formatted += ' ';
    }
  }
  
  return formatted;
};

/**
 * Formate un code postal français
 * @param {string} postalCode - Code postal à formater
 * @returns {string} - Code postal formaté
 */
export const formatPostalCode = (postalCode) => {
  // Nettoyer le code postal (enlever les espaces)
  const cleanPostalCode = postalCode.replace(/\s/g, '');
  
  // Limiter à 5 chiffres
  return cleanPostalCode.slice(0, 5);
};

/**
 * Valide une date de naissance
 * @param {Date} date - Date à valider
 * @returns {boolean} - True si la date est valide
 */
export const isValidBirthDate = (date) => {
  if (!date) return false;
  
  const now = new Date();
  const minAge = 16;
  const maxAge = 120;
  
  // Calculer l'âge
  const birthDate = new Date(date);
  const age = now.getFullYear() - birthDate.getFullYear();
  
  // Vérifier si l'anniversaire est déjà passé cette année
  const hasBirthdayOccurred = 
    now.getMonth() > birthDate.getMonth() || 
    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
  
  const adjustedAge = hasBirthdayOccurred ? age : age - 1;
  
  return adjustedAge >= minAge && adjustedAge <= maxAge;
};

/**
 * Valide un URL LinkedIn
 * @param {string} url - URL LinkedIn à valider
 * @returns {boolean} - True si l'URL est valide
 */
export const isValidLinkedInUrl = (url) => {
  if (!url) return false;
  
  // URL doit commencer par https://www.linkedin.com/in/
  const regex = /^https:\/\/www\.linkedin\.com\/in\/.+/;
  return regex.test(url);
};

/**
 * Valide un URL général
 * @param {string} url - URL à valider
 * @returns {boolean} - True si l'URL est valide
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}; 