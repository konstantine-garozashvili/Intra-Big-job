import React from "react";
import { Button } from "@/components/ui/button";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddress, useValidation } from "../RegisterContext";
import ReCaptcha from "@/components/ui/recaptcha";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";

// Script global pour le callback reCAPTCHA en secours
if (typeof window !== 'undefined') {
  window.onRecaptchaSuccess = (token) => {
    console.log("Callback global reCAPTCHA appelé avec un token");
    // On recherche le composant Step3Form dans la hiérarchie React
    // et on appelle son handler
    const recaptchaCallbacks = window.__recaptchaCallbacks || [];
    recaptchaCallbacks.forEach(callback => {
      if (typeof callback === 'function') {
        try {
          callback(token);
        } catch (e) {
          console.error("Erreur lors de l'appel du callback:", e);
        }
      }
    });
  };
  // Initialiser le tableau de callbacks s'il n'existe pas
  window.__recaptchaCallbacks = window.__recaptchaCallbacks || [];
}

import PropTypes from "prop-types";


const Step3Form = ({ goToPrevStep, onSubmit }) => {
  const {
    addressName, setAddressName,
    addressComplement, setAddressComplement,
    city, setCity,
    postalCode, setPostalCode,
    acceptTerms,
    handleTermsChange,
    handleAddressSelect,
  } = useAddress();

  const {
    isSubmitting,
    registerSuccess,
    errors,
    handleRecaptchaChange,
  } = useValidation();

  // État local pour les erreurs et validation
  const [localErrors, setLocalErrors] = React.useState({});
  const [step3Tried, setStep3Tried] = React.useState(false);

  // Validation de l'étape 3
  const validateStep3 = () => {
    const newErrors = {};
    
    // Valider l'adresse
    if (!addressName || addressName.trim() === '') {
      newErrors.addressName = "L&apos;adresse est requise";
    }
    
    // Valider la ville
    if (!city || city.trim() === '') {
      newErrors.city = "La ville est requise";
    }
    
    // Valider le code postal
    if (!postalCode || postalCode.trim() === '') {
      newErrors.postalCode = "Le code postal est requis";
    } else if (!/^[0-9]{5}$/.test(postalCode.replace(/\s/g, ''))) {
      newErrors.postalCode = "Le code postal doit contenir 5 chiffres";
    }
    
    // Valider conditions d'utilisation
    if (!acceptTerms) {
      newErrors.acceptTerms = "Vous devez accepter les conditions d&apos;utilisation";
    }
    
    return newErrors;
  };

  // Fonction de soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    setStep3Tried(true);
    
    const validationErrors = validateStep3();
    const isValid = Object.keys(validationErrors).length === 0;
    
    if (!isValid) {
      setLocalErrors(validationErrors);
      return;
    }
    
    try {
      onSubmit(e);
    } catch {
      setLocalErrors({
        ...localErrors,
        addressName: "Erreur lors de la validation de l&apos;adresse. Veuillez réessayer."
      });
    }
  };

  // Vérifier si une erreur doit être affichée
  const shouldShowError = (fieldName) => {
    return step3Tried && localErrors[fieldName];
  };

  // Récupérer le message d'erreur
  const getErrorMessage = (fieldName) => {
    return localErrors[fieldName] || null;
  };

  // Effet pour initialiser le reCAPTCHA directement lorsque le composant est monté
  React.useEffect(() => {
    // Petite astuce pour s'assurer que le script Google reCAPTCHA est bien chargé
    // Cette méthode est un secours supplémentaire au cas où le composant ReCaptcha ne fonctionne pas
    const loadDirectRecaptcha = () => {
      if (window.grecaptcha) {
        // Si déjà chargé, on ne fait rien de plus
        console.log("Script reCAPTCHA déjà disponible");
        return;
      }
      
      // Ajouter le script manuellement
      const script = document.createElement('script');
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      console.log("Script reCAPTCHA ajouté manuellement au secours");
    };
    
    // Donner un délai pour que le composant ReCaptcha ait une chance de se charger d'abord
    const timer = setTimeout(loadDirectRecaptcha, 2000);
    
    // Enregistrer notre callback dans la liste globale
    if (window.__recaptchaCallbacks) {
      window.__recaptchaCallbacks.push(handleRecaptchaChange);
    }
    
    // Nettoyage
    return () => {
      clearTimeout(timer);
      // Retirer notre callback de la liste globale
      if (window.__recaptchaCallbacks) {
        const index = window.__recaptchaCallbacks.indexOf(handleRecaptchaChange);
        if (index !== -1) {
          window.__recaptchaCallbacks.splice(index, 1);
        }
      }
    };
  }, [handleRecaptchaChange]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        {/* Afficher un message si l'inscription est en cours ou réussie */}
        {isSubmitting && !registerSuccess && (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-3"></div>
              <p className="text-blue-700 font-medium">Inscription en cours, veuillez patienter...</p>
            </div>
          </div>
        )}
        
        {registerSuccess && (
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-green-700 font-medium">Inscription réussie ! Redirection vers la page de connexion...</p>
            </div>
          </div>
        )}
        
        {/* Adresse complète */}
        <div>
          <label htmlFor="addressName" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse postale
          </label>
          <AddressAutocomplete
            id="addressName"
            value={addressName}
            onChange={(e) => setAddressName(e.target.value)}
            onAddressSelect={handleAddressSelect}
            error={shouldShowError('addressName') ? getErrorMessage('addressName') : null}
            className=""
            inputClassName={`w-full px-4 py-3 rounded-md border ${shouldShowError('addressName') ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
        
        {/* Complément d'adresse */}
        <div className="mb-4">
          <label htmlFor="addressComplement" className="block text-sm font-medium text-gray-700 mb-1">
            Complément d&apos;adresse (optionnel)
          </label>
          <input
            id="addressComplement"
            type="text"
            className="w-full px-4 py-3 rounded-md border border-gray-300"
            value={addressComplement}
            onChange={(e) => setAddressComplement(e.target.value)}
            placeholder="Appartement, étage, bâtiment..."
          />
        </div>
        
        {/* Ville et code postal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Ville */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Ville
            </label>
            <input
              id="city"
              type="text"
              className={`w-full px-4 py-3 rounded-md border ${shouldShowError('city') ? 'border-red-500' : 'border-gray-300'}`}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            {shouldShowError('city') && (
              <p className="text-red-500 text-xs mt-1">{getErrorMessage('city')}</p>
            )}
          </div>
          
          {/* Code postal */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Code postal
            </label>
            <input
              id="postalCode"
              type="text"
              className={`w-full px-4 py-3 rounded-md border ${shouldShowError('postalCode') ? 'border-red-500' : 'border-gray-300'}`}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
            {shouldShowError('postalCode') && (
              <p className="text-red-500 text-xs mt-1">{getErrorMessage('postalCode')}</p>
            )}
          </div>
        </div>

        {/* Google reCAPTCHA */}
        <div className="mt-6 border p-4 rounded-md bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Vérification de sécurité</h3>
          
          {/* Message d'info en mode développement */}
          {import.meta.env.DEV && (
            <div className="mb-2 p-2 bg-blue-50 text-blue-700 text-sm rounded">
              <p>Mode développement: La vérification reCAPTCHA est simulée.</p>
              <p className="text-xs">
                <button 
                  type="button"
                  className="text-blue-600 underline cursor-pointer"
                  onClick={() => {
                    handleRecaptchaChange("dev-test-token");
                  }}
                >
                  Cliquez ici pour simuler une validation reCAPTCHA
                </button>
              </p>
            </div>
          )}
          
          <div id="recaptcha-container" className="flex justify-center items-center">
            <ReCaptcha 
              siteKey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              error={errors?.recaptcha ? true : false}
              errorMessage={errors?.recaptcha}
            />
          </div>
          
          {/* Élément de secours direct en HTML */}
          <div id="recaptcha-fallback" className="flex justify-center items-center mt-4">
            <div className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY} data-callback="onRecaptchaSuccess"></div>
          </div>
          
          <div className="text-center">
            <button 
              type="button" 
              className="mt-2 text-xs text-blue-500 hover:text-blue-700"
              onClick={() => {
                // Force rerender du reCAPTCHA
                const container = document.getElementById('recaptcha-container');
                if (container) {
                  container.innerHTML = '';
                  setTimeout(() => {
                    // Recréer le composant
                    const captcha = document.createElement('div');
                    container.appendChild(captcha);
                    if (window.grecaptcha) {
                      try {
                        window.grecaptcha.render(captcha, {
                          sitekey: RECAPTCHA_SITE_KEY,
                          callback: handleRecaptchaChange,
                          'expired-callback': () => handleRecaptchaChange(null),
                          theme: 'light'
                        });
                      } catch (e) {
                        console.error("Erreur lors du rendu manuel:", e);
                      }
                    }
                  }, 100);
                }
              }}
            >
              Problème d'affichage? Cliquez ici pour recharger
            </button>
          </div>
        </div>

        {/* Conditions d'utilisation */}
        <div className="flex items-start space-x-2 py-2">
          <Checkbox 
            id="terms" 
            checked={acceptTerms}
            onCheckedChange={handleTermsChange}
            className={shouldShowError('acceptTerms') ? "border-red-500" : ""}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            J&apos;accepte les <a href="/terms" className="text-[#528eb2] hover:underline">conditions d&apos;utilisation</a>
          </label>
        </div>
        {shouldShowError('acceptTerms') && (
          <p className="text-red-500 text-xs mt-1">{getErrorMessage('acceptTerms')}</p>
        )}
        
        {/* Boutons de navigation */}
        <div className="flex space-x-4 mt-8">
          <Button 
            type="button"
            variant="outline"
            className="flex-1 h-12 bg-white text-[#02284f] border-[#02284f] hover:bg-gray-50"
            onClick={goToPrevStep}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </Button>
          
          <Button 
            type="submit"
            className="flex-1 h-12 bg-[#528eb2] hover:bg-[#528eb2]/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Inscription en cours...
              </div>
            ) : (
              "Créer mon compte"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Définition des PropTypes
Step3Form.propTypes = {
  goToPrevStep: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default Step3Form; 