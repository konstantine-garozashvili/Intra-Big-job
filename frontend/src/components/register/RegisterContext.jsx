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

// Création des sous-contextes
const UserDataContext = createContext(null);
const AddressContext = createContext(null);
const ValidationContext = createContext(null);

// Hooks personnalisés pour chaque contexte
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData doit être utilisé à l\'intérieur d\'un RegisterProvider');
  }
  return context;
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress doit être utilisé à l\'intérieur d\'un RegisterProvider');
  }
  return context;
};

export const useValidation = () => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation doit être utilisé à l\'intérieur d\'un RegisterProvider');
  }
  return context;
};

// Provider du contexte
export const RegisterProvider = ({ children }) => {
  const navigate = useNavigate();

  // États pour les champs du formulaire - Étape 1: Informations personnelles
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [nationality, setNationality] = useState("france");
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
  // États pour la validation et les erreurs
  const [step1Valid, setStep1Valid] = useState(false);
  const [step1Attempted, setStep1Attempted] = useState(false);
  const [step2Valid, setStep2Valid] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [step1Tried, setStep1Tried] = useState(false);
  const [step2Tried, setStep2Tried] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState("step1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Callbacks
  const handleDateChange = useCallback((date) => {
    // Vérification immédiate de l'âge
    const now = new Date();
    const minAgeDate = new Date(now);
    minAgeDate.setFullYear(now.getFullYear() - 16);
    
    if (date > minAgeDate) {
      toast.error("Vous n'êtes pas éligible à l'inscription. Vous devez avoir au moins 16 ans.", {
        duration: 5000,
        position: "top-center"
      });
      return; // Ne pas mettre à jour la date si l'utilisateur est trop jeune
    }
    
    setBirthDate(date);
  }, []);

  const handlePhoneChange = useCallback((value) => {
    // PhoneInput directly returns the formatted phone number value
    setPhone(value);
  }, []);

  const handleTermsChange = useCallback((checked) => {
    setAcceptTerms(checked);
  }, []);

  const handleAddressSelect = useCallback((addressData) => {
    setAddressName(addressData.address);
    setCity(addressData.city);
    setPostalCode(addressData.postcode);
  }, []);

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
    
    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = "Le mot de passe ne respecte pas les critères de sécurité";
      }
    }
    
    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
    setStep1Attempted(true);
    
    const isValid = Object.keys(newErrors).length === 0;
    setStep1Valid(isValid);
    
    return isValid;
  }, [firstName, lastName, email, password]);

  const validateStep2 = useCallback(() => {
    const newErrors = {};
    
    if (!birthDate) {
      newErrors.birthDate = "La date de naissance est requise";
    } else if (!isValidBirthDate(birthDate)) {
      newErrors.birthDate = "Vous devez avoir au moins 16 ans";
    }
    
    if (!nationality) {
      newErrors.nationality = "La nationalité est requise";
    }
    
    if (!phone) {
      newErrors.phone = "Le numéro de téléphone est requis";
    } else if (!isValidPhone(phone)) {
      newErrors.phone = "Format de téléphone invalide";
    }
    
    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
    setStep2Attempted(true);
    
    const isValid = Object.keys(newErrors).length === 0;
    setStep2Valid(isValid);
    
    return isValid;
  }, [birthDate, nationality, phone]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Assurer que les données sont bien encodées en UTF-8
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: birthDate ? format(birthDate, 'yyyy-MM-dd') : null,
        nationality,
        email: email.trim(),
        phoneNumber: phone,
        password,
        address: {
          name: addressName.trim(),
          complement: addressComplement ? addressComplement.trim() : '',
          city: city.trim(),
          postalCode: postalCode.trim()
        }
      };
      
      console.log('[RegisterContext] Données d\'inscription:', { ...userData, password: '***' });
      const response = await authService.register(userData);
      
      if (response && response.status === 201) {
        setRegisterSuccess(true);
        toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.", {
          duration: 5000,
          position: "top-center"
        });
        setTimeout(() => {
          navigate('/login');
        }, 500);
      } else {
        toast.error("Une erreur s'est produite. Veuillez réessayer.", {
          duration: 5000,
          position: "top-center"
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast.error(error?.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    firstName, lastName, birthDate, nationality, email, phone, password,
    addressName, addressComplement, city, postalCode, navigate
  ]);

  // Mémorisation des valeurs du contexte utilisateur
  const userDataValue = useMemo(() => ({
    firstName, setFirstName,
    lastName, setLastName,
    birthDate, setBirthDate,
    nationality, setNationality,
    email, setEmail,
    phone, setPhone,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    handleDateChange,
    handlePhoneChange,
  }), [
    firstName, lastName, birthDate, nationality,
    email, phone, password, confirmPassword,
    handleDateChange, handlePhoneChange
  ]);

  // Mémorisation des valeurs du contexte adresse
  const addressValue = useMemo(() => ({
    addressName, setAddressName,
    addressComplement, setAddressComplement,
    city, setCity,
    postalCode, setPostalCode,
    acceptTerms, setAcceptTerms,
    handleAddressSelect,
    handleTermsChange,
  }), [
    addressName, addressComplement, city, postalCode,
    acceptTerms, handleAddressSelect, handleTermsChange
  ]);

  // Mémorisation des valeurs du contexte validation
  const validationValue = useMemo(() => ({
    step1Valid, setStep1Valid,
    step1Attempted, setStep1Attempted,
    step2Valid, setStep2Valid,
    step2Attempted, setStep2Attempted,
    step1Tried, setStep1Tried,
    step2Tried, setStep2Tried,
    errors, setErrors,
    activeStep, setActiveStep,
    isSubmitting, registerSuccess,
    validateStep1,
    validateStep2,
    handleSubmit,
  }), [
    step1Valid, step1Attempted,
    step2Valid, step2Attempted,
    step1Tried, step2Tried,
    errors, activeStep,
    isSubmitting, registerSuccess,
    validateStep1, validateStep2,
    handleSubmit
  ]);

  return (
    <UserDataContext.Provider value={userDataValue}>
      <AddressContext.Provider value={addressValue}>
        <ValidationContext.Provider value={validationValue}>
          {children}
        </ValidationContext.Provider>
      </AddressContext.Provider>
    </UserDataContext.Provider>
  );
};

export default RegisterProvider; 
