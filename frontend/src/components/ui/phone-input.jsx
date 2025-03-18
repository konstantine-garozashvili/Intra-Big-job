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
      setDisplayValue(formatPhone(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);
  
  // Gère les changements de valeur
  const handleChange = (e) => {
    const inputVal = e.target.value;
    
    // Autorise uniquement les chiffres et les espaces
    const sanitizedInput = inputVal.replace(/[^\d\s]/g, "");
    
    // Formatage du numéro avec espaces
    const formattedValue = formatPhone(sanitizedInput);
    setDisplayValue(formattedValue);
    
    // Transmet la valeur sans les espaces au parent
    const rawValue = formattedValue.replace(/\s/g, "");
    onChange(rawValue);
  };
  
  // Indique si le numéro de téléphone est valide
  const isValid = !value || isValidPhone(value);
  
  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className={cn(
        "phone-input-fr",
        error || !isValid ? "error" : "",
        disabled && "opacity-50 pointer-events-none"
      )}>
        <div className="prefix">
          <span>+33</span>
        </div>
        <input
          id={id}
          ref={ref}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          className={cn("phone-number-field")}
          placeholder={placeholder}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="tel-national"
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";

export { PhoneInput }; 