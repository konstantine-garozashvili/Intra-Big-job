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
  if ((cleanPhone.startsWith('33') && cleanPhone.length === 11) || 
      (cleanPhone.startsWith('330') && cleanPhone.length === 12)) {
    // Extraire le numéro sans l'indicatif
    const withoutPrefix = cleanPhone.startsWith('330') 
      ? cleanPhone.substring(3) 
      : '0' + cleanPhone.substring(2);
    
    // Vérifier que le deuxième chiffre est entre 1-9
    return /^0[1-9]/.test(withoutPrefix);
  }
  
  // Cas 3: Autres formats internationaux (entre 8 et 15 chiffres)
  if (cleanPhone.length >= 8 && cleanPhone.length <= 15) {
    return true;
  }
  
  return false;
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
 * Valide ou formate un URL LinkedIn
 * @param {string} input - URL LinkedIn ou nom d'utilisateur à valider/formater
 * @returns {object} - { isValid: boolean, formattedUrl: string }
 */
export const formatLinkedInUrl = (input) => {
  console.log('formatLinkedInUrl - Input:', input);
  
  if (!input || typeof input !== 'string') {
    console.log('formatLinkedInUrl - Input invalide (vide ou non-string)');
    return { isValid: false, formattedUrl: null };
  }
  
  // Nettoyer l'entrée
  const trimmedInput = input.trim();
  console.log('formatLinkedInUrl - Input nettoyé:', trimmedInput);
  
  // Cas 1: C'est déjà une URL complète
  if (trimmedInput.startsWith('https://www.linkedin.com/in/')) {
    console.log('formatLinkedInUrl - Cas 1: URL complète détectée');
    try {
      const urlObj = new URL(trimmedInput);
      console.log('formatLinkedInUrl - URL object créé:', urlObj.toString());
      console.log('formatLinkedInUrl - Protocole:', urlObj.protocol);
      console.log('formatLinkedInUrl - Hostname:', urlObj.hostname);
      console.log('formatLinkedInUrl - Pathname:', urlObj.pathname);
      
      if (urlObj.protocol === 'https:' && urlObj.hostname === 'www.linkedin.com' && urlObj.pathname.startsWith('/in/')) {
        // Vérifier que le chemin après /in/ est valide
        const username = urlObj.pathname.slice(4).replace(/\/$/, ''); // Enlever le /in/ et le slash final s'il existe
        console.log('formatLinkedInUrl - Username extrait:', username);
        
        // Vérifier si le nom d'utilisateur contient des tirets
        if (username.includes('-')) {
          console.log('formatLinkedInUrl - Username contient des tirets, format valide pour LinkedIn');
        }
        
        if (username.length > 0) {
          // Accepter tous les formats d'URL LinkedIn valides, y compris ceux avec des tirets
          console.log('formatLinkedInUrl - Cas 1: URL valide');
          return { isValid: true, formattedUrl: trimmedInput };
        }
      }
    } catch (e) {
      console.log('formatLinkedInUrl - Erreur lors de la création de l\'URL (Cas 1):', e.message);
      // URL mal formée, on continue avec les autres cas
    }
  }
  
  // Cas 2: C'est une URL LinkedIn sans le https://
  if (trimmedInput.startsWith('www.linkedin.com/in/')) {
    console.log('formatLinkedInUrl - Cas 2: URL sans https:// détectée');
    const formattedUrl = `https://${trimmedInput}`;
    try {
      new URL(formattedUrl); // Vérifier que c'est une URL valide
      console.log('formatLinkedInUrl - Cas 2: URL valide après ajout de https://');
      return { isValid: true, formattedUrl };
    } catch (e) {
      console.log('formatLinkedInUrl - Erreur lors de la création de l\'URL (Cas 2):', e.message);
      // URL mal formée, on continue avec les autres cas
    }
  }
  
  // Cas 3: C'est juste un nom d'utilisateur
  // Vérifier que le nom d'utilisateur ne contient pas d'espaces ou de caractères spéciaux interdits dans une URL
  // Accepter les lettres, chiffres, tirets, underscores et points dans le nom d'utilisateur
  console.log('formatLinkedInUrl - Vérification si c\'est un nom d\'utilisateur simple');
  
  // Mise à jour du regex pour accepter plus de formats de noms d'utilisateur LinkedIn
  // LinkedIn permet les tirets, points et underscores dans les noms d'utilisateur
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
  
  if (usernameRegex.test(trimmedInput)) {
    console.log('formatLinkedInUrl - Cas 3: Nom d\'utilisateur valide détecté');
    const formattedUrl = `https://www.linkedin.com/in/${trimmedInput}`;
    console.log('formatLinkedInUrl - URL formatée:', formattedUrl);
    
    // Vérifier que l'URL formatée est valide
    try {
      new URL(formattedUrl);
      return { isValid: true, formattedUrl };
    } catch (e) {
      console.log('formatLinkedInUrl - Erreur lors de la création de l\'URL formatée:', e.message);
      // Si l'URL formatée n'est pas valide, on continue avec les autres cas
    }
  } else {
    console.log('formatLinkedInUrl - Le nom d\'utilisateur ne correspond pas au regex:', trimmedInput);
  }
  
  // Cas 4: C'est une URL LinkedIn complète avec des caractères spéciaux dans le nom d'utilisateur
  // ou une URL partielle (comme linkedin.com/in/username)
  console.log('formatLinkedInUrl - Tentative Cas 4: Vérification URL avec caractères spéciaux ou format alternatif');
  
  // Essayer différentes variantes d'URL LinkedIn
  const possibleUrls = [
    // Si l'entrée commence déjà par https:// ou http://, on la garde telle quelle
    trimmedInput.startsWith('http') ? trimmedInput : null,
    // Sinon, on essaie d'ajouter https://
    !trimmedInput.startsWith('http') ? `https://${trimmedInput}` : null,
    // Si l'entrée contient linkedin.com mais pas le préfixe www, on l'ajoute
    trimmedInput.includes('linkedin.com') && !trimmedInput.includes('www.linkedin.com') ? 
      `https://www.${trimmedInput.replace('linkedin.com', 'linkedin.com')}` : null,
    // Si l'entrée est juste un nom d'utilisateur avec des caractères spéciaux
    !trimmedInput.includes('linkedin.com') ? `https://www.linkedin.com/in/${trimmedInput}` : null
  ].filter(Boolean); // Filtrer les valeurs null
  
  // Ajouter l'URL originale si elle contient des tirets et ressemble à une URL LinkedIn
  if (trimmedInput.includes('-') && trimmedInput.includes('linkedin.com/in/')) {
    console.log('formatLinkedInUrl - URL avec tirets détectée, ajout à la liste des URLs à tester');
    possibleUrls.unshift(trimmedInput.startsWith('http') ? trimmedInput : `https://${trimmedInput}`);
  }
  
  console.log('formatLinkedInUrl - URLs à tester:', possibleUrls);
  
  // Tester chaque URL possible
  for (const testUrl of possibleUrls) {
    console.log('formatLinkedInUrl - Test de l\'URL:', testUrl);
    try {
      const urlObj = new URL(testUrl);
      console.log('formatLinkedInUrl - URL object créé:', urlObj.toString());
      
      // Vérifier si c'est une URL LinkedIn valide
      if (urlObj.hostname.includes('linkedin.com') && urlObj.pathname.includes('/in/')) {
        const username = urlObj.pathname.split('/in/')[1]?.replace(/\/$/, '') || '';
        console.log('formatLinkedInUrl - Username extrait:', username);
        
        // Vérifier si le nom d'utilisateur contient des tirets
        if (username.includes('-')) {
          console.log('formatLinkedInUrl - Username contient des tirets dans le cas 4, format valide pour LinkedIn');
        }
        
        if (username.length > 0) {
          // Pour les URLs avec des tirets, conserver le format original si possible
          if (username.includes('-') && testUrl.startsWith('https://www.linkedin.com/in/')) {
            console.log('formatLinkedInUrl - Conservation du format original pour URL avec tirets:', testUrl);
            return { isValid: true, formattedUrl: testUrl };
          }
          
          // Normaliser l'URL pour s'assurer qu'elle a le format standard
          const normalizedUrl = `https://www.linkedin.com/in/${username}`;
          console.log('formatLinkedInUrl - URL normalisée:', normalizedUrl);
          return { isValid: true, formattedUrl: normalizedUrl };
        }
      }
    } catch (e) {
      console.log(`formatLinkedInUrl - Erreur avec l'URL ${testUrl}:`, e.message);
      // Continuer avec la prochaine URL
    }
  }
  
  // Dernier recours: si l'entrée ressemble à un nom d'utilisateur mais contient des caractères spéciaux
  // qui ne sont pas autorisés par le regex standard, on essaie quand même de créer une URL LinkedIn
  if (!trimmedInput.includes('/') && !trimmedInput.includes(':')) {
    console.log('formatLinkedInUrl - Dernier recours: traitement comme nom d\'utilisateur spécial');
    // Encoder les caractères spéciaux pour l'URL
    const encodedUsername = encodeURIComponent(trimmedInput);
    const lastResortUrl = `https://www.linkedin.com/in/${encodedUsername}`;
    
    try {
      new URL(lastResortUrl);
      console.log('formatLinkedInUrl - URL de dernier recours valide:', lastResortUrl);
      return { isValid: true, formattedUrl: lastResortUrl };
    } catch (e) {
      console.log('formatLinkedInUrl - Échec de l\'URL de dernier recours:', e.message);
    }
  }
  
  // Aucun cas valide
  console.log('formatLinkedInUrl - Aucun cas valide, URL invalide');
  return { isValid: false, formattedUrl: null };
};

/**
 * Valide un URL LinkedIn
 * @param {string} url - URL LinkedIn à valider
 * @returns {boolean} - True si l'URL est valide et commence par https://www.linkedin.com/in/
 */
export const isValidLinkedInUrl = (url) => {
  const { isValid } = formatLinkedInUrl(url);
  return isValid;
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