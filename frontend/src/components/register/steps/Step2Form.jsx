import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { CountrySelector } from "@/components/ui/country-selector";
import { PhoneInput } from "@/components/ui/phone-input";
import { useUserData, useValidation } from "../RegisterContext";
import { isValidPhone } from "@/lib/utils/validation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Suppression de l'import de react-calendar qui cause des erreurs
// import 'react-calendar/dist/Calendar.css';
// import '../../../styles/custom-calendar.css';

// Retiré l'import conditionnel problématique
// let Calendar = null;
// try {
//   Calendar = require('react-calendar').default;
// } catch (error) {
//   console.error("Erreur lors du chargement du calendrier:", error);
// }

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

  // État local pour les erreurs et le focus
  const [localErrors, setLocalErrors] = React.useState({});
  const [dateInput, setDateInput] = useState(
    birthDate 
      ? new Intl.DateTimeFormat('fr-FR').format(birthDate) 
      : ""
  );
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // États pour notre calendrier personnalisé simple
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  
  // État pour gérer la sélection de l'année
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  
  // Générer les années disponibles pour la sélection
  useEffect(() => {
    const startYear = 1940;
    const endYear = new Date().getFullYear() - 16; // Jusqu'à 16 ans en arrière
    const years = [];
    
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    
    setAvailableYears(years);
  }, []);
  
  const inputRef = useRef(null);

  // Formater la date pour l'affichage

  // Effet pour mettre à jour l'entrée quand birthDate change
  useEffect(() => {
    if (birthDate) {
      setDateInput(new Intl.DateTimeFormat('fr-FR').format(birthDate));
    }
  }, [birthDate]);

  // Fonction pour générer un calendrier simple
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Obtenir le jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Convertir pour l'ordre européen (lundi premier jour)
    if (firstDayOfWeek === 0) firstDayOfWeek = 7;
    firstDayOfWeek--; // Ajuster pour commencer à 0 pour lundi
    
    const daysInMonth = lastDay.getDate();
    const days = [];
    
    // Ajouter des jours du mois précédent pour compléter la première semaine
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      const dayNumber = prevMonthDays - firstDayOfWeek + i + 1;
      const date = new Date(year, month - 1, dayNumber);
      days.push({
        day: dayNumber,
        date,
        isCurrentMonth: false,
        isDisabled: true,
        isToday: false
      });
    }
    
    // Ajouter les jours du mois
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Vérifier l'âge minimum (16 ans)
    const minAgeDate = new Date(today);
    minAgeDate.setFullYear(today.getFullYear() - 16);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      
      const isDisabled = date > minAgeDate;
      const isToday = date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear();
      
      days.push({
        day,
        date,
        isCurrentMonth: true,
        isDisabled,
        isToday
      });
    }
    
    // Ajouter des jours du mois suivant pour compléter la dernière semaine
    const totalCells = 42; // 6 semaines complètes
    const remainingCells = totalCells - days.length;
    
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isDisabled: true,
        isToday: false
      });
    }
    
    return days;
  };

  // Obtenir les noms des mois en français
  const getMonthName = (month) => {
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    return months[month];
  };

  // Navigation dans le calendrier
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const goToPreviousYear = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setFullYear(newMonth.getFullYear() - 1);
      return newMonth;
    });
  };

  const goToNextYear = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setFullYear(newMonth.getFullYear() + 1);
      return newMonth;
    });
  };

  // Fonction pour gérer les événements tactiles
  const handleTouchStart = () => {
    setIsTouched(true);
  };

  const handleTouchEnd = () => {
    setIsTouched(false);
  };

  // Fonction pour ouvrir/fermer le calendrier
  const toggleCalendar = (e) => {
    e.stopPropagation();
    setShowCalendar(prev => !prev);
  };

  // Fonction pour gérer la sélection de date dans le calendrier
  const handleCalendarDateSelect = (dayInfo) => {
    if (dayInfo.isDisabled || !dayInfo.isCurrentMonth || !dayInfo.day) {
      return;
    }
    
    const selectedDate = dayInfo.date;
    
    // Si la date est valide, la mettre à jour
    handleDateChange(selectedDate);
    setShowCalendar(false);
    
    // Mettre à jour l'entrée de texte
    setDateInput(new Intl.DateTimeFormat('fr-FR').format(selectedDate));
    
    // Forcer le focus sur l'input après la sélection
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

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
    
    // Si une erreur était affichée, la masquer pendant que l'utilisateur tape
    if (localErrors.birthDate && formattedValue !== dateInput) {
      setLocalErrors(prev => ({...prev, birthDate: null}));
    }
    
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
    
    // Valider à la volée uniquement si la date semble complète
    if (formattedValue.length === 10) {
      // Attendre que l'utilisateur ait fini de taper (300ms)
      setTimeout(() => {
        if (dateInput === formattedValue) {
          validateDateOnChange(formattedValue);
        }
      }, 300);
    }
  };

  // Appliquer la date saisie
  const applyDateInput = () => {
    // Si le champ est vide, ne pas afficher d'erreur immédiatement (attendre la validation finale)
    if (!dateInput || dateInput.trim() === "") {
      return;
    }
    
    // Si la date est incomplète
    if (dateInput.length < 10) { // JJ/MM/AAAA = 10 caractères
      setLocalErrors(prev => ({...prev, birthDate: "Format de date invalide. Utilisez JJ/MM/AAAA"}));
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
    
    // Valider les plages de valeurs
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      setLocalErrors(prev => ({...prev, birthDate: "Format de date invalide"}));
      return;
    }
    
    if (day < 1 || day > 31) {
      setLocalErrors(prev => ({...prev, birthDate: "Jour invalide (doit être entre 1 et 31)"}));
      return;
    }
    
    if (month < 0 || month > 11) {
      setLocalErrors(prev => ({...prev, birthDate: "Mois invalide (doit être entre 01 et 12)"}));
      return;
    }
    
    if (year < 1940 || year > new Date().getFullYear()) {
      setLocalErrors(prev => ({...prev, birthDate: `L'année doit être entre 1940 et ${new Date().getFullYear()}`}));
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
    today.setHours(0, 0, 0, 0);
    const minAgeDate = new Date(today);
    minAgeDate.setFullYear(today.getFullYear() - 16);
    
    if (birthDateObj > minAgeDate) {
      const missingYears = Math.ceil((birthDateObj - minAgeDate) / (1000 * 60 * 60 * 24 * 365.25));
      if (missingYears === 1) {
        setLocalErrors(prev => ({...prev, birthDate: "Vous devez avoir au moins 16 ans pour vous inscrire (il vous manque 1 an)"}));
      } else {
        setLocalErrors(prev => ({...prev, birthDate: `Vous devez avoir au moins 16 ans pour vous inscrire (il vous manque ${missingYears} ans)`}));
      }
      return;
    }
    
    // Si tout est valide, mettre à jour la date
    handleDateChange(birthDateObj);
    setLocalErrors(prev => ({...prev, birthDate: null}));
    
    // Mettre à jour l'affichage du calendrier courant pour correspondre à la date sélectionnée
    setCurrentMonth(new Date(year, month, 1));
  };

  // Fonction pour vérifier si la date est potentiellement valide (validation à la volée)
  const validateDateOnChange = (value) => {
    // Si la saisie est en cours (moins de 10 caractères), ne pas faire de validation complète
    if (!value || value.length < 10) return;
    
    const dateParts = value.split('/');
    if (dateParts.length !== 3) return;
    
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);
    
    // Vérification minimale pendant la saisie
    if (isNaN(day) || isNaN(month) || isNaN(year)) return;
    
    // Vérification de base des plages
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1940 || year > new Date().getFullYear()) {
      return;
    }
    
    // Si les conditions de base sont remplies, faire une validation complète
    applyDateInput();
  };

  // Fonction exécutée quand on quitte le champ de date
  const handleDateBlur = () => {
    setIsFocused(false);
    applyDateInput();
  };

  // Fonction exécutée quand on focus le champ
  const handleDateFocus = () => {
    setIsFocused(true);
  };

  // Fonction pour gérer les touches spéciales
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyDateInput();
      inputRef.current?.blur();
      return;
    }
    
    // Ouvrir le calendrier avec la touche bas
    if (e.key === 'ArrowDown' && !showCalendar) {
      e.preventDefault();
      setShowCalendar(true);
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

  // Fonction pour vider le champ de date
  const clearDateInput = () => {
    setDateInput("");
    handleDateChange(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

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
    return (step2Tried || localErrors[fieldName]) && localErrors[fieldName];
  };

  // Récupérer le message d'erreur
  const getErrorMessage = (fieldName) => {
    return localErrors[fieldName] || null;
  };

  // Fonction pour basculer l'affichage du sélecteur d'année
  const toggleYearSelector = (e) => {
    e.stopPropagation();
    setShowYearSelector(prev => !prev);
  };
  
  // Fonction pour sélectionner une année spécifique
  const handleYearSelection = (year) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setShowYearSelector(false);
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
            className={`w-full px-4 py-3 rounded-md border flex items-center transition-colors ${
              isTouched ? 'bg-gray-50 border-blue-500' :
              isFocused ? 'border-blue-500 shadow-sm' : 
              shouldShowError('birthDate') ? 'border-red-500' : 'border-gray-300'
            }`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <input 
              ref={inputRef}
              type="text" 
              placeholder="JJ/MM/AAAA"
              className="w-full border-none focus:outline-none bg-transparent"
              value={dateInput}
              onChange={handleDateInputChange}
              onBlur={handleDateBlur}
              onFocus={handleDateFocus}
              onKeyDown={handleKeyDown}
              inputMode="numeric"
              maxLength={10}
              aria-invalid={shouldShowError('birthDate') ? "true" : "false"}
              aria-describedby={shouldShowError('birthDate') ? "date-error" : undefined}
              pattern="\d{2}/\d{2}/\d{4}"
              autoComplete="bday"
            />
            <CalendarIcon 
              className={`h-5 w-5 transition-colors ${
                isFocused ? 'text-blue-500' : 
                shouldShowError('birthDate') ? 'text-red-500' : 'text-gray-500'
              } cursor-pointer hover:text-blue-600 active:scale-95`} 
              onClick={toggleCalendar}
            />
            {dateInput && (
              <button
                type="button"
                onClick={clearDateInput}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors active:bg-gray-200"
                aria-label="Effacer la date"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Calendrier visuel en dialogue */}
          <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
            <DialogContent className="p-0 sm:max-w-[425px] bg-white rounded-lg shadow-xl border-none overflow-hidden">
              <div className="p-4 pb-2">
                <DialogTitle className="text-lg font-semibold text-center text-gray-900">
                  Sélectionnez votre date de naissance
                </DialogTitle>
                <p className="text-sm text-center text-gray-500 mt-1">
                  Vous devez avoir au moins 16 ans pour vous inscrire.
                </p>
              </div>
              
              {/* Navigation du calendrier */}
              <div className="flex justify-between items-center px-4 py-2 border-b">
                <button 
                  onClick={goToPreviousYear}
                  className="p-1 text-gray-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md"
                  aria-label="Année précédente"
                >
                  «
                </button>
                <button 
                  onClick={goToPreviousMonth}
                  className="p-1 text-gray-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md"
                  aria-label="Mois précédent"
                >
                  ‹
                </button>
                <div className="flex flex-col items-center">
                  <span className="font-medium text-gray-700" aria-live="polite">
                    {getMonthName(currentMonth.getMonth())}
                  </span>
                  <button 
                    onClick={toggleYearSelector}
                    className="font-medium text-gray-700 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md px-2"
                    aria-label="Sélectionner l'année"
                    aria-expanded={showYearSelector}
                  >
                    {currentMonth.getFullYear()}
                  </button>
                </div>
                <button 
                  onClick={goToNextMonth}
                  className="p-1 text-gray-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md"
                  aria-label="Mois suivant"
                >
                  ›
                </button>
                <button 
                  onClick={goToNextYear}
                  className="p-1 text-gray-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md"
                  aria-label="Année suivante"
                >
                  »
                </button>
              </div>
              
              {/* Sélecteur d'années */}
              {showYearSelector && (
                <div className="max-h-48 overflow-y-auto px-4 py-2 border-b bg-white">
                  <div className="grid grid-cols-4 gap-2">
                    {availableYears.map(year => (
                      <button
                        key={year}
                        onClick={() => handleYearSelection(year)}
                        className={`py-2 px-1 rounded-md text-sm transition-colors
                          ${year === currentMonth.getFullYear() 
                            ? 'bg-blue-100 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                          } focus:outline-none focus:ring-2 focus:ring-blue-300`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Jours de la semaine */}
              <div className="grid grid-cols-7 gap-2 px-4 py-2 bg-gray-50">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                  <div key={index} className="text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="p-4">
                {/* Calendrier personnalisé */}
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays().map((dayInfo, index) => (
                    <button
                      key={index}
                      disabled={dayInfo.isDisabled || !dayInfo.isCurrentMonth || !dayInfo.day}
                      onClick={() => handleCalendarDateSelect(dayInfo)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        !dayInfo.day ? 'invisible' :
                        !dayInfo.isCurrentMonth ? 'text-gray-300 opacity-50' :
                        dayInfo.isDisabled ? 'text-gray-300 bg-red-50' :
                        dayInfo.isToday ? 'bg-blue-100 text-blue-700 font-medium' : 
                        'text-gray-800 hover:bg-blue-50'
                      } ${
                        birthDate && dayInfo.date && 
                        birthDate.getDate() === dayInfo.date.getDate() && 
                        birthDate.getMonth() === dayInfo.date.getMonth() && 
                        birthDate.getFullYear() === dayInfo.date.getFullYear() 
                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : ''
                      } focus:outline-none transition-colors`}
                    >
                      {dayInfo.day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 flex justify-end">
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={() => setShowCalendar(false)}
                  aria-label="Fermer le calendrier"
                >
                  Fermer
                </button>
              </div>
            </DialogContent>
          </Dialog>
          
          {shouldShowError('birthDate') && (
            <p id="date-error" className="text-red-500 text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
              {getErrorMessage('birthDate')}
            </p>
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