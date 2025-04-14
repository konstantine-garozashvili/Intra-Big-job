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
    
    // Autorise uniquement les chiffres et les espaces
    const sanitizedInput = inputVal.replace(/[^\d\s+]/g, "");
    
    // Si le numéro ne commence pas par +33, on l'ajoute
    if (!sanitizedInput.startsWith('+33')) {
      // Si c'est un numéro français (commence par 0), convertir en format international
      if (sanitizedInput.startsWith('0')) {
        const international = `+33${sanitizedInput.substring(1)}`;
        const formatted = formatPhone(international);
        setDisplayValue(formatted);
        onChange(international.replace(/\s/g, ""));
        return;
      }
      // Sinon, ajouter +33 au début
      const withPrefix = `+33${sanitizedInput}`;
      const formatted = formatPhone(withPrefix);
      setDisplayValue(formatted);
      onChange(withPrefix.replace(/\s/g, ""));
      return;
    }
    
    // Si le numéro commence déjà par +33
    const formattedValue = formatPhone(sanitizedInput);
    setDisplayValue(formattedValue);
    
    // Transmet la valeur sans les espaces au parent
    const rawValue = formattedValue.replace(/\s/g, "");
    onChange(rawValue);
  };
  
  // Indique si le numéro de téléphone est valide
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
