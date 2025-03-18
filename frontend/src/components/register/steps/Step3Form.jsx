import React from "react";
import { Button } from "@/components/ui/button";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddress, useValidation } from "../RegisterContext";

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
  } = useValidation();

  // État local pour les erreurs et validation
  const [localErrors, setLocalErrors] = React.useState({});
  const [step3Tried, setStep3Tried] = React.useState(false);

  // Validation de l'étape 3
  const validateStep3 = () => {
    
    const newErrors = {};
    let valid = true;
    
    // Valider adresse
    if (!addressName || addressName.trim() === "") {
      newErrors.addressName = "L'adresse est requise";
      valid = false;
    }
    
    // Valider ville
    if (!city || city.trim() === "") {
      newErrors.city = "La ville est requise";
      valid = false;
    }
    
    // Valider code postal
    if (!postalCode || postalCode.trim() === "") {
      newErrors.postalCode = "Le code postal est requis";
      valid = false;
    } else if (!/^[0-9]{5}$/.test(postalCode.replace(/\s/g, ''))) {
      newErrors.postalCode = "Veuillez entrer un code postal valide (5 chiffres)";
      valid = false;
    }
    
    // Valider conditions d'utilisation
    if (!acceptTerms) {
      newErrors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
      valid = false;
    }
    
    setLocalErrors(newErrors);
    
    return valid;
  };

  // Fonction de soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    setStep3Tried(true);
    
    // const isValid = validateStep3();
    // if (isValid) {
    //   onSubmit(e);
    // } else {
    // }
  };

  // Vérifier si une erreur doit être affichée
  const shouldShowError = (fieldName) => {
    return step3Tried && localErrors[fieldName];
  };

  // Récupérer le message d'erreur
  const getErrorMessage = (fieldName) => {
    return localErrors[fieldName] || null;
  };

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
            error={null} // Important: ne pas passer d'erreur ici pour éviter les doublons
            inputClassName={`w-full px-4 py-3 rounded-md border ${shouldShowError('addressName') ? 'border-red-500' : 'border-gray-300'}`}
          />
          {shouldShowError('addressName') && (
            <p className="text-red-500 text-xs mt-1">{getErrorMessage('addressName')}</p>
          )}
        </div>
        
        {/* Complément d'adresse */}
        <div>
          <label htmlFor="addressComplement" className="block text-sm font-medium text-gray-700 mb-1">
            Complément d'adresse (optionnel)
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
            J'accepte les <a href="/terms" className="text-[#528eb2] hover:underline">conditions d'utilisation</a>
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

export default Step3Form; 