import React, { useState } from 'react';
import InputField from './InputField';
import Button from './ui/button';
import api from '../services/api';
import './RegisterForm.css';

function RegisterForm() {
  const [step, setStep] = useState(1);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        console.log('Données envoyées:', formData);
        const response = await api.post('/api/register', formData);
        console.log('Réponse:', response.data);
      } catch (error) {
        console.error('Erreur détaillée:', {
          message: error.message,
          response: error.response?.data,
          data: formData
        });
      }
    }
  };

  return (
    <div className="register-form-wrapper">
      <div className={`register-card-wrapper ${step === 1 ? 'active' : ''}`}>
        <form onSubmit={handleSubmit} className="register-card">
          <InputField 
            label="Prénom" 
            type="text" 
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required 
          />
          <InputField 
            label="Nom" 
            type="text" 
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required 
          />
          <InputField 
            label="Date de Naissance" 
            type="date" 
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required 
          />
          <Button type="submit">Suivant</Button>
        </form>
      </div>

      <div className={`register-card-wrapper ${step === 2 ? 'active' : ''}`}>
        <form onSubmit={handleSubmit} className="register-card">
          <InputField label="Adresse" type="text" name="address" value={formData.address} onChange={handleChange} required />
          <InputField label="Code Postal" type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
          <InputField label="Ville" type="text" name="city" value={formData.city} onChange={handleChange} required />
          <Button type="submit">Suivant</Button>
        </form>
      </div>

      <div className={`register-card-wrapper ${step === 3 ? 'active' : ''}`}>
        <form onSubmit={handleSubmit} className="register-card">
          <InputField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
          <InputField label="Numéro de Téléphone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          <InputField label="Nationalité" type="text" name="nationality" value={formData.nationality} onChange={handleChange} required />
          <InputField label="Niveau d'étude" type="text" name="educationLevel" value={formData.educationLevel} onChange={handleChange} required />
          <Button type="submit">VALIDER INSCRIPTION</Button>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
