import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { CountrySelector } from "@/components/ui/country-selector";
import { PhoneInput } from "@/components/ui/phone-input";
import { useUserData, useValidation } from "../RegisterContext";
import { isValidPhone } from "@/lib/utils/validation";

const Step2Form = ({ goToNextStep, goToPrevStep }) => {
  const {
    birthDate, 
    nationality, setNationality,
    phone,
    handleDateChange,
    handlePhoneChange,
  } = useUserData();

  const {
    step2Tried
  } = useValidation();

  // État local pour les erreurs
  const [localErrors, setLocalErrors] = React.useState({});
  const [dateInput, setDateInput] = useState(
    birthDate 
      ? new Intl.DateTimeFormat('fr-FR').format(birthDate) 
      : ""
  );
  
  const inputRef = useRef(null);

  // Formater la date pour l'affichage
  const formattedBirthDate = birthDate ? new Intl.DateTimeFormat('fr-FR').format(birthDate) : "";

  // Formater automatiquement la saisie de date (JJ/MM/AAAA)
  const formatDateInput = (value) => {
    // Supprimer tous les caractères qui ne sont pas des chiffres ou des barres obliques
    let cleaned = value.replace(/[^\d/]/g, '');
    // Supprimer les barres obliques existantes pour les ajouter correctement
    cleaned = cleaned.replace(/\//g, '');
    
    let formatted = '';
    
    // Limiter à 8 chiffres max (JJ/MM/AAAA = 8 chiffres)
    cleaned = cleaned.slice(0, 8);
    
    // Formater avec les barres obliques
    for (let i = 0; i < cleaned.length; i++) {
      if (i === 2 || i === 4) {
        formatted += '/';
      }
      formatted += cleaned[i];
    }
    
    return formatted;
  };

  // Gérer le changement de date via saisie manuelle
  const handleDateInputChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatDateInput(value);
    setDateInput(formattedValue);
    
    // Positionner correctement le curseur après avoir ajouté une barre oblique
    if (value.length === 2 && formattedValue.length === 3) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = 3;
          inputRef.current.selectionEnd = 3;
        }
      }, 0);
    } else if (value.length === 5 && formattedValue.length === 6) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = 6;
          inputRef.current.selectionEnd = 6;
        }
      }, 0);
    }
  };

  // Appliquer la date saisie
  const applyDateInput = () => {
    if (!dateInput || dateInput.length < 10) { // JJ/MM/AAAA = 10 caractères
      if (dateInput.length > 0) {
        setLocalErrors(prev => ({...prev, birthDate: "Format de date invalide. Utilisez JJ/MM/AAAA"}));
      }
      return;
    }
    
    // Format attendu: JJ/MM/AAAA
    const dateParts = dateInput.split('/');
    if (dateParts.length !== 3) {
      setLocalErrors(prev => ({...prev, birthDate: "Format de date invalide. Utilisez JJ/MM/AAAA"}));
      return;
    }
    
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Les mois commencent à 0 en JavaScript
    const year = parseInt(dateParts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year) || 
        day < 1 || day > 31 || month < 0 || month > 11 || year < 1940 || year > new Date().getFullYear()) {
      setLocalErrors(prev => ({...prev, birthDate: "Date invalide"}));
      return;
    }
    
    // Vérification supplémentaire pour les jours par mois
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (day > daysInMonth) {
      setLocalErrors(prev => ({...prev, birthDate: `Le mois sélectionné n'a que ${daysInMonth} jours`}));
      return;
    }
    
    // Vérification de l'âge minimum (16 ans)
    const birthDateObj = new Date(year, month, day);
    const today = new Date();
    const minAgeDate = new Date(today);
    minAgeDate.setFullYear(today.getFullYear() - 16);
    
    if (birthDateObj > minAgeDate) {
      setLocalErrors(prev => ({...prev, birthDate: "Vous devez avoir au moins 16 ans pour vous inscrire"}));
      return;
    }
    
    handleDateChange(birthDateObj);
    setLocalErrors(prev => ({...prev, birthDate: null}));
  };

  // Fonction exécutée quand on quitte le champ de date
  const handleDateBlur = () => {
    applyDateInput();
  };

  // Fonction exécutée quand on appuie sur Entrée dans le champ de date
  const handleDateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyDateInput();
    }
  };

  // Fonction pour gérer la touche "Backspace"
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyDateInput();
      return;
    }
    
    // Ne rien faire de spécial pour les autres touches
    if (e.key !== 'Backspace') return;
    
    // Gérer la suppression des barres obliques
    const cursorPosition = e.target.selectionStart;
    if (dateInput[cursorPosition - 1] === '/' && cursorPosition > 0) {
      e.preventDefault();
      const newValue = dateInput.slice(0, cursorPosition - 2) + dateInput.slice(cursorPosition);
      setDateInput(newValue);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = cursorPosition - 2;
          inputRef.current.selectionEnd = cursorPosition - 2;
        }
      }, 0);
    }
  };

  // Validation de l'étape 2
  const validateStep2 = () => {
    const newErrors = {};
    let valid = true;
    
    // Valider date de naissance
    if (!birthDate) {
      newErrors.birthDate = "La date de naissance est requise";
      valid = false;
    }
    
    // Valider nationalité
    if (!nationality) {
      newErrors.nationality = "La nationalité est requise";
      valid = false;
    }
    
    // Valider téléphone
    if (!phone || phone.trim() === "") {
      newErrors.phone = "Le numéro de téléphone est requis";
      valid = false;
    } else if (!isValidPhone(phone)) {
      newErrors.phone = "Veuillez entrer un numéro de téléphone français valide";
      valid = false;
    }
    
    setLocalErrors(newErrors);
    
    return valid;
  };

  // Fonction pour passer à l'étape suivante après validation
  const handleNextStep = () => {
    const isValid = validateStep2();
    if (isValid) {
      goToNextStep();
    }
  };

  // Vérifier si une erreur doit être affichée
  const shouldShowError = (fieldName) => {
    return step2Tried && localErrors[fieldName];
  };

  // Récupérer le message d'erreur
  const getErrorMessage = (fieldName) => {
    return localErrors[fieldName] || null;
  };

  return (
    <div className="space-y-6">
      {/* Date de naissance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date de naissance
        </label>
        <div className="relative">
          <div className={`w-full px-4 py-3 rounded-md border flex items-center ${shouldShowError('birthDate') ? 'border-red-500' : 'border-gray-300'}`}>
            <input 
              ref={inputRef}
              type="text" 
              placeholder="JJ/MM/AAAA"
              className="w-full border-none focus:outline-none bg-transparent"
              value={dateInput}
              onChange={handleDateInputChange}
              onBlur={handleDateBlur}
              onKeyDown={handleKeyDown}
              inputMode="numeric"
              maxLength={10}
            />
            <CalendarIcon className="ml-auto h-5 w-5 text-gray-500" />
          </div>
          
          {shouldShowError('birthDate') && (
            <p className="text-red-500 text-xs mt-1">{getErrorMessage('birthDate')}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Format: JJ/MM/AAAA - Vous devez avoir au moins 16 ans pour vous inscrire.
          </p>
        </div>
      </div>

      {/* Nationalité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nationalité
        </label>
        <CountrySelector
          value={nationality}
          onChange={setNationality}
          error={shouldShowError('nationality') ? getErrorMessage('nationality') : null}
        />
        {shouldShowError('nationality') && (
          <p className="text-red-500 text-xs mt-1">{getErrorMessage('nationality')}</p>
        )}
      </div>

      {/* Téléphone */}
      <div className="mb-6">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Numéro de téléphone
        </label>
        <PhoneInput
          id="phone"
          value={phone}
          onChange={handlePhoneChange}
          error={shouldShowError('phone') ? getErrorMessage('phone') : null}
          placeholder="06 12 34 56 78"
        />
        <p className="text-xs text-gray-500 mt-1">
          Format français uniquement (+33). Exemple: 06 12 34 56 78
        </p>
      </div>
      
      {/* Boutons de navigation */}
      <div className="flex space-x-4 mt-8">
        <Button 
          type="button"
          variant="outline"
          className="flex-1 h-12 bg-white text-[#02284f] border-[#02284f] hover:bg-gray-50 transition-colors"
          onClick={goToPrevStep}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </Button>
        
        <Button 
          type="button"
          className="flex-1 h-12 bg-[#528eb2] hover:bg-[#528eb2]/90 text-white transition-colors"
          onClick={handleNextStep}
        >
          Continuer
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default Step2Form; 