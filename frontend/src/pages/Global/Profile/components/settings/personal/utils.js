import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatFrenchPhoneNumber } from '@/lib/utils/formatting';

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'Non renseigné';
  try {
    const date = new Date(dateString);
    // Ensure we're working with a valid date
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    // Add timezone offset to ensure correct date
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - timezoneOffset);
    return format(adjustedDate, 'dd MMMM yyyy', { locale: fr });
  } catch {
    // Erreur silencieuse
    return 'Date invalide';
  }
};

// Format address for display
export const formatAddress = (address) => {
  if (!address) return 'Non renseignée';
  
  let addressParts = [];
  
  if (address.name) addressParts.push(address.name);
  if (address.complement) addressParts.push(address.complement);
  if (address.postalCode?.code) addressParts.push(address.postalCode.code);
  if (address.city?.name) addressParts.push(address.city.name);
  
  return addressParts.join(', ') || 'Adresse incomplète';
};

// Format value based on field type
export const formatValue = (value, fieldType = 'text') => {
  if (fieldType === 'phone' && value) {
    return formatFrenchPhoneNumber(value);
  }
  return value;
};

/**
 * Formate un numéro de téléphone en format international français
 * @param {string} phoneNumber - Numéro de téléphone à formater
 * @returns {string} - Numéro de téléphone formaté
 */
export const formatPhoneNumber = (phoneNumber) => {
  // Si le numéro est vide, retourner une chaîne vide
  if (!phoneNumber) return '';
  
  try {
    // Nettoyer le numéro de téléphone (enlever espaces, tirets, etc.)
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Si le numéro commence par un zéro, le remplacer par le code pays français
    if (cleaned.startsWith('0')) {
      cleaned = '+33' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
      // Si le numéro ne commence pas par '+', ajouter le code international
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  } catch {
    // En cas d'erreur, retourner le numéro non modifié
    return phoneNumber;
  }
};

/**
 * Détermine si un utilisateur peut modifier son adresse
 * @returns {boolean} - Toujours vrai car tous les utilisateurs peuvent modifier leur adresse
 */
export const canEditAddress = () => {
  return true;
};

/**
 * Vérifie si un utilisateur a des permissions administratives
 * @param {string} role - Rôle de l'utilisateur
 * @returns {boolean} - True si l'utilisateur a des permissions admin
 */
export const hasAdminPermissions = (role) => {
  const adminRoles = [
    'ROLE_ADMIN',
    'ROLE_SUPER_ADMIN',
    'ROLE_HR',
    'ROLE_TEACHER'
  ];
  
  return adminRoles.includes(role);
}; 