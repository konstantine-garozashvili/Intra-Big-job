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
  // Nettoyer le numéro (enlever les espaces, tirets, etc.)
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Vérifier qu'il s'agit de 9 chiffres (sans le +33)
  if (cleanPhone.length !== 9) {
    return false;
  }
  
  // Vérifier que le premier chiffre est correct (0, 6, 7, 9)
  const firstDigit = parseInt(cleanPhone[0]);
  return [0, 6, 7, 9].includes(firstDigit);
};

/**
 * Formate un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone à formater
 * @returns {string} - Numéro formaté
 */
export const formatPhone = (phone) => {
  // Nettoyer le numéro (enlever les espaces, tirets, etc.)
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Limiter à 9 chiffres
  const digits = cleanPhone.slice(0, 9);
  
  // Formater avec des espaces (0X XX XX XX XX)
  if (digits.length === 0) return '';
  
  let formatted = digits[0];
  
  for (let i = 1; i < digits.length; i += 2) {
    formatted += ' ';
    formatted += digits[i];
    if (i + 1 < digits.length) {
      formatted += digits[i + 1];
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
  const minAge = 18;
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