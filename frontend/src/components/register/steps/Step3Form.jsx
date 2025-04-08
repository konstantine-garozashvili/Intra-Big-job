import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserData, useValidation } from "../RegisterContext";
import { motion } from "framer-motion";

const Step3Form = ({ goToPrevStep, onSubmit }) => {
  const {
    addressName, setAddressName,
    addressCity, setAddressCity,
    addressPostalCode, setAddressPostalCode,
    addressComplement, setAddressComplement,
  } = useUserData();

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
    if (!addressCity || addressCity.trim() === "") {
      newErrors.addressCity = "La ville est requise";
      valid = false;
    }
    
    // Valider code postal
    if (!addressPostalCode || addressPostalCode.trim() === "") {
      newErrors.addressPostalCode = "Le code postal est requis";
      valid = false;
    } else if (!/^\d{5}$/.test(addressPostalCode)) {
      newErrors.addressPostalCode = "Le code postal doit contenir 5 chiffres";
      valid = false;
    }
    
    setLocalErrors(newErrors);
    
    return valid;
  };

  // Fonction pour soumettre le formulaire après validation
  const handleSubmit = async () => {
    const isValid = validateStep3();
    if (isValid) {
      try {
      onSubmit(e);
      } catch (error) {
        setLocalErrors({
          ...localErrors,
          addressName: "Erreur lors de la validation de l'adresse. Veuillez réessayer."
        });
      }
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
      {/* Adresse */}
      <div>
        <label htmlFor="addressName" className="block text-sm font-medium text-blue-300 mb-1">
          Adresse
        </label>
        <input
          id="addressName"
          type="text"
          className={`w-full px-4 py-3 rounded-md border bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${shouldShowError('addressName') ? 'border-red-500' : 'border-gray-700'}`}
          value={addressName}
          onChange={(e) => setAddressName(e.target.value)}
          placeholder="123 rue de la République"
        />
        {shouldShowError('addressName') && (
          <p className="text-red-400 text-xs mt-1">{getErrorMessage('addressName')}</p>
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
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Ville */}
        <div>
          <label htmlFor="addressCity" className="block text-sm font-medium text-blue-300 mb-1">
            Ville
          </label>
          <AddressAutocomplete
            id="addressName"
            value={addressName}
            onChange={(e) => setAddressName(e.target.value)}
            onAddressSelect={(data) => {
              handleAddressSelect(data);
              // Nettoyer les erreurs après sélection d'une adresse valide
              setLocalErrors({
                ...localErrors,
                addressName: null,
                city: null,
                postalCode: null
              });
            }}
            error={shouldShowError('addressName') ? getErrorMessage('addressName') : null}
            className=""
            inputClassName={`w-full px-4 py-3 rounded-md border ${shouldShowError('addressName') ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
        
        {/* Code postal */}
        <div>
          <label htmlFor="addressPostalCode" className="block text-sm font-medium text-blue-300 mb-1">
            Code postal
          </label>
          <input
            id="addressPostalCode"
            type="text"
            className={`w-full px-4 py-3 rounded-md border bg-gray-800/50 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${shouldShowError('addressPostalCode') ? 'border-red-500' : 'border-gray-700'}`}
            value={addressPostalCode}
            onChange={(e) => setAddressPostalCode(e.target.value)}
            placeholder="75001"
            maxLength={5}
          />
          {shouldShowError('addressPostalCode') && (
            <p className="text-red-400 text-xs mt-1">{getErrorMessage('addressPostalCode')}</p>
          )}
        </div>
      </div>
      
      {/* Boutons de navigation */}
      <div className="flex justify-between mt-6">
        <motion.button
          type="button"
          className="h-12 bg-gray-700/50 hover:bg-gray-700 text-white px-6 rounded-md flex items-center justify-center border border-gray-600"
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
          type="button"
          className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 rounded-md flex items-center justify-center shadow-lg shadow-blue-900/20"
          onClick={handleSubmit}
          disabled={isSubmitting}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Traitement...
            </>
          ) : (
            <>
              S'inscrire
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Step3Form;