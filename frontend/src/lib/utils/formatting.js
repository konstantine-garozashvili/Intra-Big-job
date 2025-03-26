/**
 * Format a phone number in French format (XX XX XX XX XX)
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - The formatted phone number
 */
export const formatFrenchPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Format with spaces between each pair of digits
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}; 