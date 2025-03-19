import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { isValidName } from '@/lib/utils/validation';

export const NameInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className = '',
  showValidation = true,
  ...props 
}) => {
  const [isValid, setIsValid] = useState(true);
  const [isTouched, setIsTouched] = useState(false);
  
  // Valider le nom lorsque la valeur change
  useEffect(() => {
    if (value && isTouched) {
      setIsValid(isValidName(value));
    } else {
      setIsValid(true);
    }
  }, [value, isTouched]);
  
  // Gérer le changement de valeur
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Autoriser uniquement les caractères valides pour les noms
    // Lettres, espaces, tirets, apostrophes et caractères accentués
    if (newValue === '' || /^[a-zA-ZÀ-ÿ\u00C0-\u017F\s\-']*$/.test(newValue)) {
      onChange(newValue);
    }
  };
  
  // Marquer le champ comme touché lors de la perte de focus
  const handleBlur = () => {
    setIsTouched(true);
  };
  
  return (
    <div className="w-full">
      <Input
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className} ${!isValid && isTouched ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        {...props}
      />
      {showValidation && !isValid && isTouched && (
        <p className="text-red-500 text-xs mt-1">
          Utilisez uniquement des lettres, espaces, tirets et apostrophes
        </p>
      )}
    </div>
  );
}; 