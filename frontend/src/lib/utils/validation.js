/**
 * Utilitaires de validation pour les formulaires
 */

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si l'email est valide
 */
export const isValidEmail = (email) => {
  // Regex plus robuste qui accepte :
  // - Les caractères spéciaux dans la partie locale (avant @)
  // - Les domaines internationaux (IDN)
  // - Les sous-domaines multiples
  // - Les TLD de 2 à 63 caractères
  const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,63}))$/;
  return regex.test(String(email).toLowerCase());
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
  
  // Accepter les formats internationaux
  // Format français: 10 chiffres commençant par 0, ou +33 suivi de 9 chiffres
  // Format international: accepter les numéros de 8 à 15 chiffres
  
  // Cas 1: Format français standard (0X XX XX XX XX)
  if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
    // Vérifier que le deuxième chiffre est entre 1-9
    return /^0[1-9]/.test(cleanPhone);
  }
  
  // Cas 2: Format international français (+33 X XX XX XX XX)
  if (cleanPhone.startsWith('33') && cleanPhone.length === 11) {
    // Extraire le numéro sans l'indicatif
    const withoutPrefix = '0' + cleanPhone.substring(2);
    // Vérifier que le deuxième chiffre est entre 1-9
    return /^0[1-9]/.test(withoutPrefix);
  }
  
  // Limiter à 9 chiffres après le 33
  if (cleanPhone.startsWith('33') && cleanPhone.length > 11) {
    return false;
  }
  
  return true;
};

/**
 * Formate un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone à formater
 * @returns {string} - Numéro formaté
 */
export const formatPhone = (phone) => {
  // Nettoyer le numéro (enlever les espaces, tirets, etc.)
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Si le numéro commence par +33, on le garde
  if (cleanPhone.startsWith('33')) {
    // Limiter à 11 chiffres (33 + 9 chiffres)
    cleanPhone = cleanPhone.substring(0, 11);
    // Si le numéro est complet (11 chiffres), formater
    if (cleanPhone.length === 11) {
      return `+33 ${cleanPhone.substring(2,4)} ${cleanPhone.substring(4,6)} ${cleanPhone.substring(6,8)} ${cleanPhone.substring(8,10)} ${cleanPhone.substring(10)}`;
    }
    // Sinon, juste afficher le numéro tel quel
    return `+33 ${cleanPhone.substring(2)}`;
  }
  
  // Si le numéro commence par 0
  if (cleanPhone.startsWith('0') && cleanPhone.length <= 10) {
    return `${cleanPhone.substring(0,2)} ${cleanPhone.substring(2,4)} ${cleanPhone.substring(4,6)} ${cleanPhone.substring(6,8)} ${cleanPhone.substring(8)}`;
  }
  
  // Pour les autres formats, ne rien faire
  return phone;
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
 * @returns {boolean} - True si l'URL est valide et commence par https://www.linkedin.com/in/
 */
export const isValidLinkedInUrl = (url) => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);

    // Vérifier que l'URL commence par https://www.linkedin.com/in/
    if (urlObj.protocol === 'https:' && urlObj.hostname === 'www.linkedin.com' && urlObj.pathname.startsWith('/in/')) {
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
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
    return urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

/**
 * Valide un nom ou prénom
 * @param {string} name - Nom ou prénom à valider
 * @returns {boolean} - True si le nom est valide
 */
export const isValidName = (name) => {
  if (!name) return false;
  
  // Nettoyer le nom (enlever les espaces en début et fin)
  const cleanName = name.trim();
  
  // Vérifier la longueur minimale
  if (cleanName.length < 2) return false;
  
  // Vérifier que le nom contient uniquement des lettres, espaces, tirets et apostrophes
  // Accepte les caractères accentués et les caractères internationaux
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00C0-\u017F\s\-']+$/;
  
  return nameRegex.test(cleanName);
}; 