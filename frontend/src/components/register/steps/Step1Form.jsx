import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useUserData, useValidation } from "../RegisterContext";
import { PasswordStrengthIndicator } from "../RegisterUtils";
import PropTypes from "prop-types";

const Step1Form = ({ goToNextStep }) => {
  const {
    firstName, setFirstName,
    lastName, setLastName, 
    email, setEmail,
    password, setPassword,
  } = useUserData();

  const {
    setStep1Tried,
    setErrors
  } = useValidation();

  // État local pour les erreurs et la visibilité du mot de passe
  const [localErrors, setLocalErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  // Validation de l'étape 1
  const validateStep1 = () => {
    setStep1Tried(true);
    
    // Effacer les erreurs du contexte
    setErrors({});
    
    const newErrors = {};
    let valid = true;
    
    // Valider prénom
    if (!firstName || firstName.trim() === "") {
      newErrors.firstName = "Le prénom est requis";
      valid = false;
    }
    
    // Valider nom
    if (!lastName || lastName.trim() === "") {
      newErrors.lastName = "Le nom est requis";
      valid = false;
    }
    
    // Valider email
    if (!email || email.trim() === "") {
      newErrors.email = "L&apos;email est requis";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Veuillez entrer un email valide";
      valid = false;
    }
    
    // Valider mot de passe
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
      valid = false;
    } else if (password.length > 50) {
      // Vérification explicite de la longueur maximale en priorité
      newErrors.password = "Le mot de passe ne doit pas dépasser 50 caractères";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
      valid = false;
    }
    
    setLocalErrors(newErrors);
    
    return valid;
  };

  // Fonction pour passer à l'étape suivante après validation
  const handleNextStep = () => {
    const isValid = validateStep1();
    if (isValid) {
      goToNextStep();
    }
  };

  // Vérifier si une erreur doit être affichée
  const shouldShowError = (fieldName) => {
    return localErrors[fieldName];
  };

  // Récupérer le message d'erreur
  const getErrorMessage = (fieldName) => {
    return localErrors[fieldName] || null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Prénom */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Prénom
          </label>
          <input
            id="firstName"
            type="text"
            className={`w-full px-4 py-3 rounded-md border ${shouldShowError('firstName') ? 'border-red-500' : 'border-gray-300'}`}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Votre prénom"
          />
          {shouldShowError('firstName') && (
            <p className="text-red-500 text-xs mt-1">{getErrorMessage('firstName')}</p>
          )}
        </div>
        
        {/* Nom */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            id="lastName"
            type="text"
            className={`w-full px-4 py-3 rounded-md border ${shouldShowError('lastName') ? 'border-red-500' : 'border-gray-300'}`}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Votre nom"
          />
          {shouldShowError('lastName') && (
            <p className="text-red-500 text-xs mt-1">{getErrorMessage('lastName')}</p>
          )}
        </div>
      </div>
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`w-full px-4 py-3 rounded-md border ${shouldShowError('email') ? 'border-red-500' : 'border-gray-300'}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemple.com"
        />
        {shouldShowError('email') && (
          <p className="text-red-500 text-xs mt-1">{getErrorMessage('email')}</p>
        )}
      </div>
      
      {/* Mot de passe */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className={`w-full px-4 py-3 pr-10 rounded-md border ${shouldShowError('password') ? 'border-red-500' : 'border-gray-300'}`}
            value={password}
            onChange={(e) => {
              // Limiter la longueur du mot de passe directement lors de la saisie
              const value = e.target.value;
              if (value.length <= 50) {
                setPassword(value);
              } else {
                // Si l'utilisateur tente de coller un mot de passe trop long,
                // tronquer à 50 caractères et afficher un message d'erreur
                setPassword(value.substring(0, 50));
                const newErrors = {...localErrors};
                newErrors.password = "Le mot de passe ne doit pas dépasser 50 caractères";
                setLocalErrors(newErrors);
              }
            }}
            onPaste={(e) => {
              // Intercepter l'événement de collage
              const clipboardData = e.clipboardData || window.clipboardData;
              const pastedText = clipboardData.getData('text');
              
              // Vérifier si le texte collé dépasse la limite
              if (pastedText.length > 50) {
                e.preventDefault(); // Empêcher le collage par défaut
                
                // Tronquer le texte et le définir manuellement
                setPassword(pastedText.substring(0, 50));
                
                // Afficher un message d'erreur
                const newErrors = {...localErrors};
                newErrors.password = "Le mot de passe collé a été tronqué à 50 caractères";
                setLocalErrors(newErrors);
              }
            }}
            placeholder="Entre 8 et 50 caractères"
            maxLength={50} // Attribut HTML natif pour limiter la longueur
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {shouldShowError('password') && (
          <p className="text-red-500 text-xs mt-1">{getErrorMessage('password')}</p>
        )}
        
        {/* Indicateur de force du mot de passe */}
        <PasswordStrengthIndicator password={password} />
      </div>
      
      {/* Bouton pour passer à l'étape suivante */}
      <div className="flex justify-end mt-6">
        <Button 
          type="button"
          className="h-12 bg-[#528eb2] hover:bg-[#528eb2]/90 text-white px-6"
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

// Définition des PropTypes
Step1Form.propTypes = {
  goToNextStep: PropTypes.func.isRequired
};

export default Step1Form; 