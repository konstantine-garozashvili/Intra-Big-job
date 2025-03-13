import React, { lazy, Suspense, memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
    <div className="w-8 h-8 border-t-2 border-b-2 border-[#0066ff] rounded-full animate-spin"></div>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date de naissance
        </label>
        <div className="relative">
          <div 
            className={`w-full px-4 py-3 rounded-md border flex items-center cursor-pointer transition-colors hover:border-[#0066ff] ${shouldShowError('birthDate') ? 'border-red-500' : 'border-gray-300'}`}
            onClick={() => setCalendarOpen(true)}
          >
            {formattedBirthDate ? (
              <span className="text-gray-900">
                {formattedBirthDate}
              </span>
            ) : (
              <span className="text-gray-500">JJ/MM/AAAA</span>
            )}
            <CalendarIcon className="ml-auto h-5 w-5 text-gray-500" />
          </div>
          
          <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
            <DialogContent className="p-0 sm:max-w-[425px] bg-white rounded-lg shadow-xl border-none overflow-hidden">
              <div className="p-4 pb-0">
                <DialogTitle className="text-xl font-semibold text-center text-gray-900">
                  Sélectionnez votre date de naissance
                </DialogTitle>
                <p className="text-sm text-center text-gray-500 mt-1">
                  Vous devez avoir au moins 16 ans pour vous inscrire.
                </p>
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
                    next2Label={<span className="text-lg text-[#0066ff]">»</span>}
                    prev2Label={<span className="text-lg text-[#0066ff]">«</span>}
                    nextLabel={<span className="text-lg text-[#0066ff]">›</span>}
                    prevLabel={<span className="text-lg text-[#0066ff]">‹</span>}
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
              <div className="p-4 flex justify-end">
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
          aria-describedby="phone-description"
        />
        <p id="phone-description" className="text-xs text-gray-500 mt-1">
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