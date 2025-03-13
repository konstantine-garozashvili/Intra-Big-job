import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateString) => {
  if (!dateString) return 'Non renseigné';
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  } catch (e) {
    return 'Date invalide';
  }
};

export const formatAddress = (address) => {
  if (!address) return 'Non renseignée';
  
  let addressParts = [];
  
  if (address.name) addressParts.push(address.name);
  if (address.complement) addressParts.push(address.complement);
  if (address.postalCode?.code) addressParts.push(address.postalCode.code);
  if (address.city?.name) addressParts.push(address.city.name);
  
  return addressParts.join(', ') || 'Adresse incomplète';
}; 