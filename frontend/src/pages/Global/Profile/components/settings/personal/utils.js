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
  } catch (e) {
    console.error('Error formatting date:', e);
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