import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddress, useValidation } from "../RegisterContext";
import { motion } from "framer-motion";

const Step3Form = ({ goToPrevStep, onSubmit }) => {
  const {
    addressName, setAddressName,
    addressComplement, setAddressComplement,
    city, setCity,
    postalCode, setPostalCode,
    handleAddressSelect
  } = useAddress();

  const {
    setStep3Tried,
    setErrors
  } = useValidation();

  // État local pour les erreurs et le chargement
  const [localErrors, setLocalErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } else if (!/^\d{5}$/.test(postalCode)) {
      newErrors.postalCode = "Le code postal doit contenir 5 chiffres";
      valid = false;
    }
    
    setLocalErrors(newErrors);
    
    return valid;
  };

  // Fonction pour soumettre le formulaire après validation
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    console.log('Step3Form - Starting form submission');
    console.log('Current form data:', {
      addressName,
      addressComplement,
      city,
      postalCode
    });

    const isValid = validateStep3();
    console.log('Form validation result:', isValid);
    console.log('Validation errors:', localErrors);

    if (isValid) {
      try {
        console.log('Attempting to submit form...');
        onSubmit(e);
      } catch (error) {
        console.error('Error during form submission:', error);
        setLocalErrors({
          ...localErrors,
          addressName: "Erreur lors de la validation de l'adresse. Veuillez réessayer."
        });
      }
    } else {
      console.log('Form validation failed');
    }
  };

  // Validation manuelle de l'adresse si nécessaire
  const manuallyValidateAddress = () => {
    if (!addressName || !city || !postalCode) {
      return false;
    }
    return true;
  };
  
  // Gestion spécifique pour la sélection d'adresse
  const onAddressSelected = (addressData) => {
    handleAddressSelect(addressData);
    // Vérifier si nous avons tous les champs nécessaires
    setLocalErrors({
      ...localErrors,
      addressName: null,
      city: null,
      postalCode: null
    });
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
      <form onSubmit={handleSubmit}>
        {/* Adresse */}
        <div>
          <label htmlFor="addressName" className="block text-sm font-medium text-blue-300 mb-1">
            Adresse <span className="text-red-400">*</span>
          </label>
          <AddressAutocomplete
            id="addressName"
            value={addressName}
            onValueChange={setAddressName}
            onAddressSelect={handleAddressSelect}
            placeholder="Saisissez votre adresse..."
            className={`${shouldShowError('addressName') ? 'border-red-500' : 'border-gray-700'}`}
            required
          />
          {shouldShowError('addressName') ? (
            <p className="text-red-400 text-xs mt-1">{getErrorMessage('addressName')}</p>
          ) : (
            <p className="text-gray-500 text-xs mt-1">Champ requis - Saisissez votre adresse complète</p>
          )}
        </div>
        
        {/* Complément d'adresse (optionnel) */}
        <div>
          <label htmlFor="addressComplement" className="block text-sm font-medium text-blue-300 mb-1">
            Complément d'adresse <span className="text-blue-400 text-xs">(optionnel)</span>
          </label>
          <input
            id="addressComplement"
            type="text"
            className="w-full px-4 py-3 rounded-md border border-gray-700 bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            value={addressComplement}
            onChange={(e) => setAddressComplement(e.target.value)}
            placeholder="Appartement, étage, etc."
          />
          <p className="text-gray-500 text-xs mt-1">Informations supplémentaires pour faciliter la livraison</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Ville */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-blue-300 mb-1">
              Ville <span className="text-red-400">*</span>
            </label>
            <input
              id="city"
              type="text"
              className={`w-full px-4 py-3 rounded-md border bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${shouldShowError('city') ? 'border-red-500' : 'border-gray-700'}`}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Paris"
              required
            />
            {shouldShowError('city') ? (
              <p className="text-red-400 text-xs mt-1">{getErrorMessage('city')}</p>
            ) : (
              <p className="text-gray-500 text-xs mt-1">Champ requis</p>
            )}
          </div>
          
          {/* Code postal */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-blue-300 mb-1">
              Code postal <span className="text-red-400">*</span>
            </label>
            <input
              id="postalCode"
              type="text"
              className={`w-full px-4 py-3 rounded-md border bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${shouldShowError('postalCode') ? 'border-red-500' : 'border-gray-700'}`}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="75001"
              maxLength={5}
              required
            />
            {shouldShowError('postalCode') ? (
              <p className="text-red-400 text-xs mt-1">{getErrorMessage('postalCode')}</p>
            ) : (
              <p className="text-gray-500 text-xs mt-1">Champ requis - Format: 5 chiffres</p>
            )}
          </div>
        </div>
        
        {/* Boutons de navigation */}
        <div className="flex justify-between mt-6 space-x-4">
          <motion.button
            type="button"
            className="h-12 bg-gray-700/50 hover:bg-gray-700 text-blue-300 px-6 rounded-md flex items-center justify-center border border-gray-600"
            onClick={goToPrevStep}
            disabled={isSubmitting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </motion.button>
          
          <motion.button
            type="submit"
            className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 rounded-md flex items-center justify-center shadow-lg shadow-blue-900/20"
            disabled={isSubmitting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default Step3Form;