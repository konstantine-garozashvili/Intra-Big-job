import React, { forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatLinkedInUrl, isValidLinkedInUrl } from "@/lib/utils/validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LinkedInInput = forwardRef(({ 
  className, 
  value = "", 
  onChange,
  error,
  label,
  id,
  placeholder = "https://www.linkedin.com/in/username",
  disabled = false,
  ...props 
}, ref) => {
  // État local pour gérer la valeur affichée et les erreurs
  const [displayValue, setDisplayValue] = useState("");
  const [localError, setLocalError] = useState("");
  
  // Met à jour la valeur affichée lorsque la prop value change
  useEffect(() => {
    if (value) {
      const { isValid, formattedUrl } = formatLinkedInUrl(value);
      setDisplayValue(formattedUrl || value);
      setLocalError(isValid ? "" : "Format LinkedIn invalide");
    } else {
      setDisplayValue("");
      setLocalError("");
    }
  }, [value]);
  
  // Gère les changements de valeur
  const handleChange = (e) => {
    const inputVal = e.target.value;
    setDisplayValue(inputVal);
    
    if (inputVal) {
      const { isValid, formattedUrl } = formatLinkedInUrl(inputVal);
      
      // Si l'URL est valide, on transmet l'URL formatée au parent
      if (isValid) {
        onChange(formattedUrl);
        setLocalError("");
      } else {
        // Sinon, on transmet la valeur brute et on affiche une erreur
        onChange(inputVal);
        setLocalError("Format LinkedIn invalide");
      }
    } else {
      // Si le champ est vide, on transmet une chaîne vide
      onChange("");
      setLocalError("");
    }
  };
  
  // Gère la perte de focus pour formater l'URL
  const handleBlur = () => {
    if (displayValue) {
      const { isValid, formattedUrl } = formatLinkedInUrl(displayValue);
      
      if (isValid) {
        setDisplayValue(formattedUrl);
        onChange(formattedUrl);
        setLocalError("");
      }
    }
  };
  
  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        ref={ref}
        type="url"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          localError || error ? "border-red-500 focus-visible:ring-red-500" : ""
        )}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="url"
      />
      {(error || localError) && (
        <p className="text-red-500 text-xs mt-1">{error || localError}</p>
      )}
    </div>
  );
});

LinkedInInput.displayName = "LinkedInInput";

export { LinkedInInput };