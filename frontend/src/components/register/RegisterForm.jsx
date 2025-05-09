import * as React from "react";
import { lazy, Suspense, memo, useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { FloatingInput } from "@/components/ui/floating-input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import 'react-calendar/dist/Calendar.css';
import { CountrySelector } from "@/components/ui/country-selector";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useUserData, useAddress, useValidation } from "./RegisterContext";
import Step1Form from "./steps/Step1Form";
import Step2Form from "./steps/Step2Form";
import Step3Form from "./steps/Step3Form";
import FormTransition from "./FormTransition";

// Chargement dynamique du calendrier pour améliorer les performances
const Calendar = lazy(() => import('react-calendar'));

// Composant de chargement pour le calendrier - Mémorisé
const CalendarFallback = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
  </div>
));

CalendarFallback.displayName = 'CalendarFallback';

// Fonction pour évaluer la force du mot de passe
const evaluatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Longueur du mot de passe
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Présence de chiffres
  if (/\d/.test(password)) score += 1;
  
  // Présence de lettres minuscules et majuscules
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  
  // Présence de caractères spéciaux
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  return Math.min(score, 4); // Score de 0 à 4
};

// Composant pour afficher la force du mot de passe
const PasswordStrengthIndicator = ({ password }) => {
  const strength = evaluatePasswordStrength(password);
  
  // Déterminer la couleur et le texte en fonction de la force
  const getColorClass = () => {
    switch (strength) {
      case 0: return "bg-gray-200";
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-green-500";
      default: return "bg-gray-200";
    }
  };
  
  const getText = () => {
    switch (strength) {
      case 0: return "Veuillez entrer un mot de passe";
      case 1: return "Très faible";
      case 2: return "Faible";
      case 3: return "Moyen";
      case 4: return "Fort";
      default: return "";
    }
  };
  
  // Calculer le pourcentage de progression
  const strengthPercentage = (strength / 4) * 100;
  
  return (
    <div className="mt-1 space-y-1">
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColorClass()} transition-all duration-300`} 
          style={{ width: `${strengthPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{getText()}</span>
        <span className="text-xs text-gray-500">{strength > 0 ? `${strength}/4` : ""}</span>
      </div>
    </div>
  );
};

// Composant principal du formulaire d'inscription
const RegisterForm = () => {
  // Récupérer les valeurs et fonctions des contextes séparés
  const { setErrors, setStep1Attempted, setStep2Attempted } = useValidation();
  const { handleSubmit: contextHandleSubmit, isSubmitting } = useValidation();
  
  // Référence pour suivre les changements d'étape
  const prevStepRef = useRef(1);
  
  // État pour gérer l'étape actuelle
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Calculer le pourcentage de progression
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  // Définir les titres des étapes
  const stepTitles = [
    "Informations personnelles",
    "Coordonnées",
    "Adresse"
  ];
  
  // Fonction pour passer à l'étape suivante
  const goToNextStep = useCallback(() => {
    if (currentStep === 1) {
      setStep1Attempted(true);
    } else if (currentStep === 2) {
      setStep2Attempted(true);
    }
    setCurrentStep(prev => prev + 1);
  }, [currentStep, setStep1Attempted, setStep2Attempted]);
  
  // Fonction pour revenir à l'étape précédente
  const goToPrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  // Nettoyer les erreurs du contexte au montage
  useEffect(() => {
    setErrors({});
  }, [setErrors]);
  
  // Effet pour nettoyer l'état lors du changement d'étape
  useEffect(() => {
    // Ne rien faire si l'étape n'a pas changé
    if (prevStepRef.current === currentStep) {
      return;
    }
    
    // Nettoyer les erreurs du contexte à chaque changement d'étape
    setErrors({});
    
    // Mettre à jour la référence de l'étape actuelle
    prevStepRef.current = currentStep;
  }, [currentStep, setErrors]);
  
  // Version personnalisée de handleSubmit qui utilise notre validation
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Créer une version modifiée de l'événement pour contourner la validation du contexte
    const customEvent = {
      ...e,
      preventDefault: () => {
        e.preventDefault();
      },
      // Ajouter une propriété pour indiquer que la validation a déjà été effectuée
      validationComplete: true,
      target: e.target
    };
    
    // Utiliser le handleSubmit du contexte
    contextHandleSubmit(customEvent);
  }, [contextHandleSubmit]);
  
  return (
    <div className="w-full bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-2xl mx-auto overflow-hidden border border-blue-500/30">
      {/* Bandeau supérieur bleu avec titre et progression - AVEC animation */}
      <div className="bg-[#02284f]/90 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-indigo-500 rounded-full filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="flex justify-between items-center relative z-10">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-400">
            Créez votre compte
          </h2>
          <span className="text-sm font-medium text-blue-200">
            Étape {currentStep}/{totalSteps}
          </span>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-6 relative z-10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-blue-200">
              {stepTitles[currentStep - 1]}
            </span>
            <span className="text-sm font-medium text-blue-200">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-[#1a3c61] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Corps du formulaire sur fond sombre - AVEC animation */}
      <FormTransition>
        <div className="p-6 relative">
          <div className="absolute inset-0 pointer-events-none">
            {/* Subtle background stars */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 1.5 + 0.5}px`,
                  height: `${Math.random() * 1.5 + 0.5}px`,
                  opacity: Math.random() * 0.3 + 0.1,
                }}
              />
            ))}
          </div>
          
          {/* Afficher le composant approprié selon l'étape actuelle */}
          <div className="relative z-10">
            {currentStep === 1 && (
              <Step1Form goToNextStep={goToNextStep} />
            )}
            
            {currentStep === 2 && (
              <Step2Form 
                goToNextStep={goToNextStep} 
                goToPrevStep={goToPrevStep} 
              />
            )}
            
            {currentStep === 3 && (
              <Step3Form 
                goToPrevStep={goToPrevStep} 
                onSubmit={handleFormSubmit}
              />
            )}
            
            <div className="mt-6 text-center">
              <p className="text-sm text-blue-200">
                Déjà inscrit ? <Link to="/login" className="text-blue-400 font-medium hover:underline">Se connecter</Link>
              </p>
            </div>
          </div>
        </div>
      </FormTransition>
    </div>
  );
};

export default RegisterForm; 