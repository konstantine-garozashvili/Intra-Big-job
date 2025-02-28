import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from './InputField';
import Button from './ui/button';
import api from '../services/api';
import './RegisterForm.css';

function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    address: '',
    postalCode: '',
    city: '',
    email: '',
    phone: '',
    nationality: '',
    educationLevel: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Réinitialiser les erreurs pour ce champ
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Réinitialiser l'erreur générale
    setError(null);
  };

  const validateStep = (currentStep) => {
    let isValid = true;
    const errors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) {
        isValid = false;
        errors.firstName = 'Le prénom est requis';
      }
      
      if (!formData.lastName.trim()) {
        isValid = false;
        errors.lastName = 'Le nom est requis';
      }
      
      if (!formData.birthDate) {
        isValid = false;
        errors.birthDate = 'La date de naissance est requise';
      }
    } else if (currentStep === 2) {
      if (!formData.address.trim()) {
        isValid = false;
        errors.address = 'L\'adresse est requise';
      }
      
      if (!formData.postalCode.trim()) {
        isValid = false;
        errors.postalCode = 'Le code postal est requis';
      } else if (!/^\d{5}$/.test(formData.postalCode)) {
        isValid = false;
        errors.postalCode = 'Le code postal doit contenir 5 chiffres';
      }
      
      if (!formData.city.trim()) {
        isValid = false;
        errors.city = 'La ville est requise';
      }
    } else if (currentStep === 3) {
      if (!formData.email.trim()) {
        isValid = false;
        errors.email = 'L\'email est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        isValid = false;
        errors.email = 'Veuillez entrer un email valide';
      }
      
      if (!formData.phone.trim()) {
        isValid = false;
        errors.phone = 'Le numéro de téléphone est requis';
      } else if (!/^(\+33|0)[1-9](\d{2}){4}$/.test(formData.phone.replace(/\s/g, ''))) {
        isValid = false;
        errors.phone = 'Veuillez entrer un numéro de téléphone valide';
      }
      
      if (!formData.nationality.trim()) {
        isValid = false;
        errors.nationality = 'La nationalité est requise';
      }
      
      if (!formData.educationLevel.trim()) {
        isValid = false;
        errors.educationLevel = 'Le niveau d\'étude est requis';
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        setLoading(true);
        setError(null);
        console.log('Données envoyées:', formData);
        const response = await api.post('/api/register', formData);
        console.log('Réponse:', response.data);
        setSuccess(true);
        setLoading(false);
        
        // Redirection après 2 secondes
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        setLoading(false);
        if (error.response && error.response.data) {
          // Gestion des erreurs de validation du backend
          if (error.response.data.missing_fields) {
            const backendErrors = {};
            error.response.data.missing_fields.forEach(field => {
              backendErrors[field] = `Le champ ${field} est requis`;
            });
            setFieldErrors(backendErrors);
          } else {
            setError(error.response.data.error || 'Une erreur est survenue lors de l\'inscription');
          }
          
          console.error('Erreur détaillée:', {
            message: error.message,
            response: error.response.data,
            data: formData
          });
        } else {
          setError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
          console.error('Erreur détaillée:', {
            message: error.message,
            data: formData
          });
        }
      }
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="register-form-wrapper">
      {success ? (
        <div className="success-message">
          <h2>Inscription réussie !</h2>
          <p>Vous allez être redirigé vers la page de connexion...</p>
        </div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          
          <div className={`register-card-wrapper ${step === 1 ? 'active' : ''}`}>
            <form onSubmit={handleSubmit} className="register-card">
              <h2>Informations personnelles</h2>
              <InputField 
                label="Prénom" 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required 
                placeholder="Votre prénom"
                error={fieldErrors.firstName}
              />
              <InputField 
                label="Nom" 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required 
                placeholder="Votre nom"
                error={fieldErrors.lastName}
              />
              <InputField 
                label="Date de Naissance" 
                type="date" 
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required 
                error={fieldErrors.birthDate}
              />
              <Button type="submit" disabled={loading}>Suivant</Button>
            </form>
          </div>

          <div className={`register-card-wrapper ${step === 2 ? 'active' : ''}`}>
            <form onSubmit={handleSubmit} className="register-card">
              <h2>Adresse</h2>
              <InputField 
                label="Adresse" 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
                placeholder="Votre adresse"
                error={fieldErrors.address}
              />
              <InputField 
                label="Code Postal" 
                type="text" 
                name="postalCode" 
                value={formData.postalCode} 
                onChange={handleChange} 
                required 
                placeholder="Code postal (5 chiffres)"
                pattern="[0-9]{5}"
                error={fieldErrors.postalCode}
              />
              <InputField 
                label="Ville" 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                required 
                placeholder="Votre ville"
                error={fieldErrors.city}
              />
              <div className="button-group">
                <Button type="button" onClick={goBack} className="secondary-button">Retour</Button>
                <Button type="submit" disabled={loading}>Suivant</Button>
              </div>
            </form>
          </div>

          <div className={`register-card-wrapper ${step === 3 ? 'active' : ''}`}>
            <form onSubmit={handleSubmit} className="register-card">
              <h2>Informations de contact</h2>
              <InputField 
                label="Email" 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="votre.email@exemple.com"
                error={fieldErrors.email}
              />
              <InputField 
                label="Numéro de Téléphone" 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                placeholder="06 12 34 56 78"
                error={fieldErrors.phone}
              />
              <InputField 
                label="Nationalité" 
                type="text" 
                name="nationality" 
                value={formData.nationality} 
                onChange={handleChange} 
                required 
                placeholder="Votre nationalité"
                error={fieldErrors.nationality}
              />
              <InputField 
                label="Niveau d'étude" 
                type="text" 
                name="educationLevel" 
                value={formData.educationLevel} 
                onChange={handleChange} 
                required 
                placeholder="Ex: Bac+2, Licence, Master..."
                error={fieldErrors.educationLevel}
              />
              <div className="button-group">
                <Button type="button" onClick={goBack} className="secondary-button">Retour</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'INSCRIPTION EN COURS...' : 'VALIDER INSCRIPTION'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default RegisterForm;
