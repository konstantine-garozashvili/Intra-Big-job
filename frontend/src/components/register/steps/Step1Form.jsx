import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useUserData, useValidation } from "../RegisterContext";
import { PasswordStrengthIndicator } from "../RegisterUtils";
import { motion } from "framer-motion";

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
      newErrors.email = "L'email est requis";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Veuillez entrer un email valide";
      valid = false;
    }
    
    // Valider mot de passe
    if (!password || password.trim() === "") {
      newErrors.password = "Le mot de passe est requis";
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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Prénom */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-blue-300 mb-1">
            Prénom
          </label>
          <input
            id="firstName"
            type="text"
            className={`w-full px-4 py-3 rounded-md border bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${shouldShowError('firstName') ? 'border-red-500' : 'border-gray-700'}`}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Votre prénom"
          />
          {shouldShowError('firstName') && (
            <p className="text-red-400 text-xs mt-1">{getErrorMessage('firstName')}</p>
          )}
        </div>
        
        {/* Nom */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-blue-300 mb-1">
            Nom
          </label>
          <input
            id="lastName"
            type="text"
            className={`w-full px-4 py-3 rounded-md border bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${shouldShowError('lastName') ? 'border-red-500' : 'border-gray-700'}`}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Votre nom"
          />
          {shouldShowError('lastName') && (
            <p className="text-red-400 text-xs mt-1">{getErrorMessage('lastName')}</p>
          )}
        </div>
      </div>
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-blue-300 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`w-full px-4 py-3 rounded-md border bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${shouldShowError('email') ? 'border-red-500' : 'border-gray-700'}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemple.com"
        />
        {shouldShowError('email') && (
          <p className="text-red-400 text-xs mt-1">{getErrorMessage('email')}</p>
        )}
      </div>
      
      {/* Mot de passe */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-blue-300 mb-1">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className={`w-full px-4 py-3 pr-10 rounded-md border bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${shouldShowError('password') ? 'border-red-500' : 'border-gray-700'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 caractères"
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
          <p className="text-red-400 text-xs mt-1">{getErrorMessage('password')}</p>
        )}
        
        {/* Indicateur de force du mot de passe */}
        <PasswordStrengthIndicator password={password} />
      </div>
      
      {/* Bouton pour passer à l'étape suivante */}
      <div className="flex justify-end mt-6">
        <motion.button 
          type="button"
          className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 rounded-md flex items-center justify-center shadow-lg shadow-blue-900/20"
          onClick={handleNextStep}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Continuer
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Step1Form;