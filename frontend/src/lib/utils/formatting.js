/**
 * Format a phone number in French display format.
 * Handles both national (0X...) and international (+33...) formats.
 * @param {string} phoneNumber - The phone number to format (can be raw or pre-formatted).
 * @returns {string} - The formatted phone number for display (e.g., "+33 6 12 34 56 78" or "06 12 34 56 78").
 */
export const formatFrenchPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove any non-digit characters except the leading +
  let cleanPhone = phoneNumber.toString().replace(/[^\d+]/g, '');

  // Handle international format
  if (cleanPhone.startsWith('+33')) {
    // Extract digits after +33
    let numberPart = cleanPhone.substring(3);
    
    // Remove leading 0 if present after +33
    if (numberPart.startsWith('0')) {
      numberPart = numberPart.substring(1);
    }
    
    // Ensure we only have 9 digits after +33 (and potential leading 0 removed)
    numberPart = numberPart.substring(0, 9);
    
    if (numberPart.length > 0) {
      // Format as +33 X XX XX XX XX
      let formatted = `+33 ${numberPart.substring(0, 1)}`;
      if (numberPart.length > 1) formatted += ` ${numberPart.substring(1, 3)}`;
      if (numberPart.length > 3) formatted += ` ${numberPart.substring(3, 5)}`;
      if (numberPart.length > 5) formatted += ` ${numberPart.substring(5, 7)}`;
      if (numberPart.length > 7) formatted += ` ${numberPart.substring(7, 9)}`;
      return formatted;
    }
    return '+33'; // Return just +33 if nothing follows
  } 
  
  // Handle case where it starts with 33 but no + (likely less common for display formatting)
  if (cleanPhone.startsWith('33')) {
    // Extract digits after 33
    let numberPart = cleanPhone.substring(2);
    
    // Remove leading 0 if present after 33
    if (numberPart.startsWith('0')) {
      numberPart = numberPart.substring(1);
    }
    
    // Ensure we only have 9 digits after 33
    numberPart = numberPart.substring(0, 9);

    if (numberPart.length > 0) {
      // Format as +33 X XX XX XX XX (add the plus sign)
      let formatted = `+33 ${numberPart.substring(0, 1)}`;
      if (numberPart.length > 1) formatted += ` ${numberPart.substring(1, 3)}`;
      if (numberPart.length > 3) formatted += ` ${numberPart.substring(3, 5)}`;
      if (numberPart.length > 5) formatted += ` ${numberPart.substring(5, 7)}`;
      if (numberPart.length > 7) formatted += ` ${numberPart.substring(7, 9)}`;
      return formatted;
    }
     return '+33'; // Or maybe just '33' depending on desired display
  }

  // Handle national format (starting with 0)
  if (cleanPhone.startsWith('0')) {
     // Ensure we only have 10 digits
    cleanPhone = cleanPhone.substring(0, 10);
    
    if (cleanPhone.length >= 2) {
      // Format as 0X XX XX XX XX
      let formatted = cleanPhone.substring(0, 2);
      if (cleanPhone.length > 2) formatted += ` ${cleanPhone.substring(2, 4)}`;
      if (cleanPhone.length > 4) formatted += ` ${cleanPhone.substring(4, 6)}`;
      if (cleanPhone.length > 6) formatted += ` ${cleanPhone.substring(6, 8)}`;
      if (cleanPhone.length > 8) formatted += ` ${cleanPhone.substring(8, 10)}`;
      return formatted;
    }
    return cleanPhone; // Return just 0 if only 0 is typed
  }

  // Fallback for unknown formats - return the cleaned digits or original if cleaning failed
  return cleanPhone || phoneNumber;
}; 