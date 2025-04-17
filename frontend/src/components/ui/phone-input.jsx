import React, { forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatPhone, isValidPhone } from "@/lib/utils/validation";
import { Label } from "@/components/ui/label";

const PhoneInput = forwardRef(({ 
  className, 
  value = "", 
  onChange,
  error,
  label,
  id,
  placeholder = "06 12 34 56 78",
  disabled = false,
  ...props 
}, ref) => {
  // État local pour gérer la valeur affichée
  const [displayValue, setDisplayValue] = useState("");
  
  // Met à jour la valeur affichée lorsque la prop value change
  useEffect(() => {
    if (value) {
      // Si le numéro ne commence pas par +33, on l'ajoute
      if (!value.startsWith('+33')) {
        // Si c'est un numéro français (commence par 0), convertir en format international
        if (value.startsWith('0')) {
          const international = `+33${value.substring(1)}`;
          setDisplayValue(formatPhone(international));
          onChange(international.replace(/\s/g, ""));
        } else {
          // Sinon, ajouter +33 au début
          const withPrefix = `+33${value}`;
          setDisplayValue(formatPhone(withPrefix));
          onChange(withPrefix.replace(/\s/g, ""));
        }
      } else {
        setDisplayValue(formatPhone(value));
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);
  
  // Gère les changements de valeur
  const handleChange = (e) => {
    const inputVal = e.target.value;
    
    // Autorise uniquement les chiffres, +, et espaces initiaux pour le formatage
    // Keep the + if it's the first character
    const initialPlus = inputVal.startsWith('+') ? '+' : '';
    let sanitizedInput = initialPlus + inputVal.replace(/[^\d]/g, ""); // Keep only digits after potential +

    // *** ADDED: Prevent typing '0' immediately after '+33' ***
    if (sanitizedInput === '+330') {
      // Reset display to just "+33 " to block the zero
      setDisplayValue('+33 '); 
      // Do not call onChange, effectively ignoring the '0'
      return; 
    }
    
    // Si le numéro ne commence pas par +33, essayer de le préfixer
    if (!sanitizedInput.startsWith('+33')) {
      // Handle case where user types '0' first
      if (sanitizedInput.startsWith('0')) {
        const international = `+33${sanitizedInput.substring(1)}`;
        const formatted = formatPhone(international); // Use formatPhone from validation utils
        const rawValue = international.replace(/\s/g, ""); // Get raw value for parent
        // Only update if the raw value is potentially valid (up to +33 + 9 digits)
        if (rawValue.length <= 12) { 
          setDisplayValue(formatted);
          onChange(rawValue);
        }
        return;
      }
      // Handle case where user types digits directly (assume French number)
      else if (/^\d+$/.test(sanitizedInput)) { 
         const withPrefix = `+33${sanitizedInput}`;
         const formatted = formatPhone(withPrefix);
         const rawValue = withPrefix.replace(/\s/g, "");
         if (rawValue.length <= 12) {
            setDisplayValue(formatted);
            onChange(rawValue);
         }
         return;
      }
      // Handle case where user just typed '+' or '+3' or '+33'
      else if (sanitizedInput === '+' || sanitizedInput === '+3' || sanitizedInput === '+33') {
         setDisplayValue(sanitizedInput);
         // Don't call onChange yet, wait for more digits
         return;
      }
    }
    
    // Si le numéro commence déjà par +33 (ou a été formaté ci-dessus)
    // Ensure formatPhone is called on the potentially prefixed number
    const formattedValue = formatPhone(sanitizedInput); // formatPhone handles stripping extra digits
    const rawValue = formattedValue.replace(/[^\d+]/g, "").substring(0, 12); // Get raw value, limit length

    // Only update if the raw value length is acceptable
    if (rawValue.length <= 12) {
        setDisplayValue(formattedValue);
        onChange(rawValue);
    }
  };
  
  // Indique si le numéro de téléphone est valide
  // Use the raw value passed from parent for validation check
  const isValid = !value || isValidPhone(value);
  
  return (
    <div className="w-full">
      {label && <Label htmlFor={id} className="block text-sm font-medium text-blue-300 mb-1">{label}</Label>}
      <input
        id={id}
        ref={ref}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        className={cn(
          "w-full px-4 py-3 rounded-md border bg-gray-800/50 text-white placeholder-gray-400",
          "focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none",
          error || !isValid ? "border-red-500" : "border-gray-700",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        placeholder={placeholder}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="tel-national"
        name="phoneNumber"
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
