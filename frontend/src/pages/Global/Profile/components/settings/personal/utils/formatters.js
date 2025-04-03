/**
 * Formate une date au format français (DD/MM/YYYY)
 * @param {string} dateString - Date à formater (format ISO)
 * @returns {string} - Date formatée DD/MM/YYYY
 */
export const formatDate = (dateString) => {
  try {
    // Si la date est vide, retourner une chaîne vide
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Formate une adresse pour l'affichage
 * @param {object} address - Objet contenant les informations d'adresse
 * @returns {string} - Adresse formatée
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.complement) parts.push(address.complement);
  if (address.postalCode || address.city) {
    const cityParts = [];
    if (address.postalCode) cityParts.push(address.postalCode);
    if (address.city) cityParts.push(address.city);
    parts.push(cityParts.join(' '));
  }
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};

/**
 * Formate un numéro de téléphone français
 * @param {string} phoneNumber - Numéro de téléphone
 * @returns {string} - Numéro formaté (XX XX XX XX XX ou +33 X XX XX XX XX)
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Nettoyer le numéro (enlever tout ce qui n'est pas un chiffre ou +)
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Si le numéro commence par +33
  if (cleaned.startsWith('+33') && cleaned.length >= 12) {
    return `+33 ${cleaned.substring(3, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)} ${cleaned.substring(10, 12)}`;
  }
  
  // Pour les numéros commençant par 0
  if (cleaned.startsWith('0') && cleaned.length >= 10) {
    return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
  }
  
  // Si le format n'est pas reconnu, retourner tel quel
  return phoneNumber;
}; 