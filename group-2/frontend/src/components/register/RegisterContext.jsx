import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { authService } from '@/lib/services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  isValidEmail, 
  validatePassword, 
  isValidPhone, 
  isValidPostalCode,
  isValidBirthDate,
  formatPhone,
  formatPostalCode
} from '@/lib/utils/validation';

// Création du contexte
const RegisterContext = createContext(null);

// Hook personnalisé pour utiliser le contexte
export const useRegisterContext = () => {
  const context = useContext(RegisterContext);
  if (!context) {
    throw new Error('useRegisterContext doit être utilisé à l\'intérieur d\'un RegisterProvider');
  }
  return context;
};

// Provider du contexte
export const RegisterProvider = ({ children }) => {
  // États pour les champs du formulaire - Étape 1: Informations personnelles
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [nationality, setNationality] = useState("france"); // Valeur par défaut: France
  
  // États pour les champs du formulaire - Étape 2: Informations de contact
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // États pour les champs du formulaire - Étape 3: Adresse
  const [addressName, setAddressName] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // États pour la visibilité des mots de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // État pour le dialog du calendrier
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // États pour la validation et les erreurs
  const [step1Valid, setStep1Valid] = useState(false);
  const [step1Attempted, setStep1Attempted] = useState(false);
  const [step2Valid, setStep2Valid] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [step1Tried, setStep1Tried] = useState(false);
  const [step2Tried, setStep2Tried] = useState(false);
  const [errors, setErrors] = useState({});
  
  // État pour contrôler l'accordéon
  const [activeStep, setActiveStep] = useState("step1");
  
  // État pour le chargement
  const [isSubmitting, setIsSubmitting] = useState(false);
  // État pour le succès de l'inscription
  const [registerSuccess, setRegisterSuccess] = useState(false);
  
  // Hook de navigation
  const navigate = useNavigate();
  
  // Fonction pour gérer la sélection de date - Mémorisée avec useCallback
  const handleDateChange = useCallback((date) => {
    setBirthDate(date);
    setCalendarOpen(false);
  }, []);
  
  // Validation de l'étape 1: Informations personnelles - Optimisée avec useCallback
  const validateStep1 = useCallback(() => {
    const newErrors = {};
    
    if (!firstName) {
      newErrors.firstName = "Le prénom est requis";
    } else if (firstName.length < 2) {
      newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
    }
    
    if (!lastName) {
      newErrors.lastName = "Le nom est requis";
    } else if (lastName.length < 2) {
      newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
    }
    
    if (!birthDate) {
      newErrors.birthDate = "La date de naissance est requise";
    } else if (!isValidBirthDate(birthDate)) {
      newErrors.birthDate = "Vous devez avoir au moins 18 ans";
    }
    
    if (!nationality) {
      newErrors.nationality = "La nationalité est requise";
    }
    
    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
    setStep1Attempted(true);
    
    const isValid = Object.keys(newErrors).length === 0;
    setStep1Valid(isValid);
    
    if (isValid) {
      setActiveStep("step2");
    }
    
    return isValid;
  }, [firstName, lastName, birthDate, nationality]);
  
  // Validation de l'étape 2: Informations de contact - Optimisée avec useCallback
  const validateStep2 = useCallback(() => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    if (!phone) {
      newErrors.phone = "Le numéro de téléphone est requis";
    } else if (!isValidPhone(phone)) {
      newErrors.phone = "Format de téléphone invalide (0X XX XX XX XX)";
    }
    
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        let passwordError = "Le mot de passe doit contenir:";
        if (passwordValidation.errors.length) passwordError += " au moins 8 caractères,";
        if (passwordValidation.errors.upperCase) passwordError += " une majuscule,";
        if (passwordValidation.errors.lowerCase) passwordError += " une minuscule,";
        if (passwordValidation.errors.digit) passwordError += " un chiffre,";
        if (passwordValidation.errors.specialChar) passwordError += " un caractère spécial,";
        
        // Enlever la dernière virgule et ajouter un point
        passwordError = passwordError.slice(0, -1) + ".";
        
        newErrors.password = passwordError;
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    
    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
    setStep2Attempted(true);
    
    const isValid = Object.keys(newErrors).length === 0;
    setStep2Valid(isValid);
    
    if (isValid) {
      setActiveStep("step3");
    }
    
    return isValid;
  }, [email, phone, password, confirmPassword]);
  
  // Gestion du changement d'étape de l'accordéon - Optimisée avec useCallback
  const handleAccordionChange = useCallback((value) => {
    // Validation avant de changer d'étape
    if (value === "step2" && !step1Valid) {
      validateStep1();
      return;
    }
    if (value === "step3" && !step2Valid) {
      validateStep2();
      return;
    }
    setActiveStep(value);
  }, [step1Valid, step2Valid, validateStep1, validateStep2]);
  
  // Gestion du changement de téléphone - Optimisée avec useCallback
  const handlePhoneChange = useCallback((e) => {
    const formattedPhone = formatPhone(e.target.value);
    setPhone(formattedPhone);
  }, []);
  
  // Gestion de la visibilité du mot de passe - Mémorisée
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  
  // Gestion de la visibilité de la confirmation du mot de passe - Mémorisée
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);
  
  // Gestion du changement de l'état des conditions d'utilisation - Mémorisée
  const handleTermsChange = useCallback((checked) => {
    setAcceptTerms(checked);
  }, []);
  
  // Fonction pour gérer la sélection d'une adresse - Optimisée avec useCallback
  const handleAddressSelect = useCallback((addressData) => {
    setAddressName(addressData.address);
    setCity(addressData.city);
    setPostalCode(addressData.postcode);
  }, []);
  
  // Validation du formulaire complet - Optimisée avec useCallback
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    console.log("handleSubmit appelé dans RegisterContext");
    
    // Si l'événement possède validationComplete, ignorer la validation du contexte
    if (e.validationComplete) {
      console.log("Validation locale déjà effectuée, traitement du formulaire sans validation du contexte");
      
      // Passez directement à la soumission du formulaire
      setIsSubmitting(true);
      
      try {
        // Préparation des données
        const userData = {
          firstName,
          lastName,
          birthDate: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
          nationality,
          email,
          phoneNumber: phone,
          password,
          addressName,
          addressComplement,
          city,
          postalCode
        };
        
        console.log("Données utilisateur:", userData);
        
        // Soumission à l'API
        try {
          const response = await authService.register(userData);
          console.log("Réponse de l'API:", response);
          
          if (response && response.status === 201) {
            // Définir l'état de succès
            setRegisterSuccess(true);
            // Notification de succès
            toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.", {
              duration: 5000,
              position: "top-center"
            });
            // Rediriger après un court délai pour laisser le toast s'afficher
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          } else {
            // Message d'erreur si la réponse n'est pas 201
            toast.error("Une erreur s'est produite. Veuillez réessayer.", {
              duration: 5000,
              position: "top-center"
            });
          }
        } catch (apiError) {
          console.error("Erreur API:", apiError);
          toast.error(apiError?.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.");
        }
      } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
      } finally {
        setIsSubmitting(false);
      }
      
      return;
    }
    
    // Validation classique (reste inchangée)
    if (!step1Valid) {
      validateStep1();
      return;
    }
    
    if (!step2Valid) {
      validateStep2();
      return;
    }
    
    const newErrors = { ...errors };
    
    if (!addressName) {
      newErrors.addressName = "L'adresse est requise";
    }
    
    if (!city) {
      newErrors.city = "La ville est requise";
    }
    
    if (!postalCode) {
      newErrors.postalCode = "Le code postal est requis";
    } else if (!isValidPostalCode(postalCode)) {
      newErrors.postalCode = "Format de code postal invalide";
    }
    
    if (!acceptTerms) {
      newErrors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        // Préparation des données
        const userData = {
          firstName,
          lastName,
          birthDate,
          nationality,
          email,
          phoneNumber: phone,
          password,
          addressName,
          addressComplement,
          city,
          postalCode
        };
        
        console.log("Données utilisateur:", userData);
        
        // Soumission à l'API (simulée ici)
        const response = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({ status: 200, data: { success: true, message: "Inscription réussie" } });
          }, 1500);
        });
        
        if (response.status === 200) {
          // Définir l'état de succès
          setRegisterSuccess(true);
          // Notification de succès
          toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.", {
            duration: 5000,
            position: "top-center"
          });
          // Rediriger après un court délai pour laisser le toast s'afficher
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [
    firstName, lastName, birthDate, nationality, email, phone, password,
    addressName, addressComplement, city, postalCode, acceptTerms,
    step1Valid, step2Valid, errors, validateStep1, validateStep2, isValidPostalCode
  ]);
  
  // Mémorisation des éléments du formulaire pour éviter les re-renders inutiles
  const formattedBirthDate = useMemo(() => 
    birthDate ? format(birthDate, 'dd/MM/yyyy') : null
  , [birthDate]);
  
  // Valeur du contexte mémorisée
  const contextValue = useMemo(() => ({
    // États
    firstName, setFirstName,
    lastName, setLastName,
    birthDate, setBirthDate,
    nationality, setNationality,
    email, setEmail,
    phone, setPhone,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    addressName, setAddressName,
    addressComplement, setAddressComplement,
    city, setCity,
    postalCode, setPostalCode,
    acceptTerms, setAcceptTerms,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    calendarOpen, setCalendarOpen,
    step1Valid, setStep1Valid,
    step1Attempted, setStep1Attempted,
    step2Valid, setStep2Valid,
    step2Attempted, setStep2Attempted,
    step1Tried, setStep1Tried,
    step2Tried, setStep2Tried,
    errors, setErrors,
    activeStep, setActiveStep,
    formattedBirthDate,
    isSubmitting,
    registerSuccess,
    
    // Fonctions
    handleDateChange,
    validateStep1,
    validateStep2,
    handleAccordionChange,
    handlePhoneChange,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleTermsChange,
    handleAddressSelect,
    handleSubmit
  }), [
    firstName, lastName, birthDate, nationality,
    email, phone, password, confirmPassword,
    addressName, addressComplement, city, postalCode,
    acceptTerms, showPassword, showConfirmPassword,
    calendarOpen, step1Valid, step1Attempted,
    step2Valid, step2Attempted, step1Tried, step2Tried,
    errors, activeStep, formattedBirthDate, handleDateChange, validateStep1,
    validateStep2, handleAccordionChange, handlePhoneChange,
    togglePasswordVisibility, toggleConfirmPasswordVisibility,
    handleTermsChange, handleAddressSelect, handleSubmit,
    isSubmitting, registerSuccess
  ]);
  
  return (
    <RegisterContext.Provider value={contextValue}>
      {children}
    </RegisterContext.Provider>
  );
};

export default RegisterContext; 