import React, { lazy, Suspense, memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CountrySelector } from "@/components/ui/country-selector";
import { PhoneInput } from "@/components/ui/phone-input";
import { useUserData, useValidation } from "../RegisterContext";
import 'react-calendar/dist/Calendar.css';
import '../../../styles/custom-calendar.css'; // Import du CSS personnalisé pour le calendrier
import { isValidPhone } from "@/lib/utils/validation";

// Chargement dynamique du calendrier pour améliorer les performances
const Calendar = lazy(() => import('react-calendar'));

// Composant de chargement pour le calendrier - Mémorisé
const CalendarFallback = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="w-12 h-12 relative">
      <div className="absolute w-full h-full border-4 border-t-[#3b7dff] border-r-[#78b9dd] border-b-[#3b7dff] border-l-[#78b9dd] rounded-full animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-4 border-t-[#a5cdff] border-r-transparent border-b-[#a5cdff] border-l-transparent rounded-full animate-spin animation-delay-150"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#3b7dff] dark:bg-[#a5cdff] rounded-full animate-pulse"></div>
    </div>
  </div>
));

CalendarFallback.displayName = 'CalendarFallback';

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

  // État local pour le calendrier et les erreurs
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [localErrors, setLocalErrors] = React.useState({});

  // Formater la date pour l'affichage
  const formattedBirthDate = birthDate ? new Intl.DateTimeFormat('fr-FR').format(birthDate) : null;

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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date de naissance
        </label>
        <div className="relative">
          <div 
            className={`w-full px-4 py-3 rounded-md border flex items-center cursor-pointer transition-all hover:shadow-md ${shouldShowError('birthDate') ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
            ${formattedBirthDate ? 'hover:border-[#0066ff] dark:hover:border-[#a5cdff]' : 'hover:border-[#0066ff] dark:hover:border-[#a5cdff]'}
            dark:bg-gradient-to-r dark:from-[#1e3556] dark:to-[#263b58] dark:shadow-inner dark:shadow-black/10 dark:text-gray-200`}
            onClick={() => setCalendarOpen(true)}
          >
            {formattedBirthDate ? (
              <span className="text-gray-900 dark:text-[#f0f7ff] font-medium">
                {formattedBirthDate}
              </span>
            ) : (
              <span className="text-gray-500 dark:text-[#a3b8cc]">JJ/MM/AAAA</span>
            )}
            <CalendarIcon className="ml-auto h-5 w-5 text-gray-500 dark:text-[#a5cdff]" />
          </div>
          
          <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
            <DialogContent className="p-0 sm:max-w-[450px] md:max-w-[500px] bg-white dark:bg-gradient-to-br dark:from-[#192334] dark:to-[#0f172a] rounded-lg shadow-xl border-none overflow-hidden">
              <div className="p-4 pb-0">
                <DialogTitle className="text-xl font-semibold text-center text-gray-900 dark:text-[#f0f7ff]">
                  Sélectionnez votre date de naissance
                </DialogTitle>
                <DialogDescription className="text-sm text-center text-gray-500 dark:text-[#a5cdff] mt-1">
                  Vous devez avoir au moins 16 ans pour vous inscrire.
                </DialogDescription>
              </div>
              <div className="calendar-container w-full p-4">
                <Suspense fallback={<CalendarFallback />}>
                  <Calendar 
                    onChange={handleDateChange} 
                    value={birthDate} 
                    locale="fr"
                    maxDate={new Date()}
                    minDetail="decade" 
                    defaultView="century"
                    minDate={new Date(1940, 0, 1)}
                    className="modern-calendar w-full"
                    formatShortWeekday={(locale, date) => ['L', 'M', 'M', 'J', 'V', 'S', 'D'][date.getDay()]}
                    navigationLabel={({ date }) => 
                      date.toLocaleString('fr', { month: 'long', year: 'numeric' }).toLowerCase()
                    }
                    next2Label={<span className="text-lg text-[#0055cc] dark:text-[#a5cdff]">»</span>}
                    prev2Label={<span className="text-lg text-[#0055cc] dark:text-[#a5cdff]">«</span>}
                    nextLabel={<span className="text-lg text-[#0055cc] dark:text-[#a5cdff]">›</span>}
                    prevLabel={<span className="text-lg text-[#0055cc] dark:text-[#a5cdff]">‹</span>}
                    showNeighboringMonth={false}
                    tileClassName={({ date, view }) => {
                      // Vérifie si la date est dans le futur
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      if (view === 'month' && date > today) {
                        return 'calendar-future-date';
                      }
                      
                      return null;
                    }}
                  />
                </Suspense>
              </div>
              <div className="p-4 flex justify-end dark:bg-gray-800">
                <button 
                  className="calendar-confirm-button"
                  onClick={() => setCalendarOpen(false)}
                >
                  Confirmer
                </button>
              </div>
            </DialogContent>
          </Dialog>
          
          {shouldShowError('birthDate') && (
            <p className="text-red-500 text-xs mt-1">{getErrorMessage('birthDate')}</p>
          )}
        </div>
      </div>

      {/* Nationalité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nationalité
        </label>
        <CountrySelector
          value={nationality}
          onChange={setNationality}
          error={shouldShowError('nationality') ? getErrorMessage('nationality') : null}
        />
        {shouldShowError('nationality') && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{getErrorMessage('nationality')}</p>
        )}
      </div>

      {/* Téléphone */}
      <div className="mb-6">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Numéro de téléphone
        </label>
        <PhoneInput
          id="phone"
          value={phone}
          onChange={handlePhoneChange}
          error={shouldShowError('phone') ? getErrorMessage('phone') : null}
          placeholder="06 12 34 56 78"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Format français uniquement (+33). Exemple: 06 12 34 56 78
        </p>
      </div>
      
      {/* Boutons de navigation */}
      <div className="flex space-x-4 mt-8">
        <Button 
          type="button"
          variant="outline"
          className="flex-1 h-12 bg-white text-[#02284f] border-[#02284f] hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          onClick={goToPrevStep}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </Button>
        
        <Button 
          type="button"
          className="flex-1 h-12 bg-[#528eb2] hover:bg-[#528eb2]/90 text-white transition-colors dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
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