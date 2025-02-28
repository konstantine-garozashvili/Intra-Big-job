import React, { useState } from 'react';
import InputField from './InputField';
import Button from './ui/button';
import './RegisterForm.css';

function RegisterForm() {
  const [step, setStep] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Ici, vous pouvez ajouter la logique pour soumettre le formulaire complet
      console.log("Formulaire soumis !");
    }
  };

  return (
    <div className="register-form-wrapper">
      <div className={`register-card-wrapper ${step === 1 ? 'active' : ''}`}>
        <form onSubmit={handleSubmit} className="register-card">
          <InputField label="Prénom" type="text" required />
          <InputField label="Nom" type="text" required />
          <InputField label="Date de Naissance" type="date" required />
          <Button type="submit">Suivant</Button>
        </form>
      </div>

      <div className={`register-card-wrapper ${step === 2 ? 'active' : ''}`}>
        <form onSubmit={handleSubmit} className="register-card">
          <InputField label="Adresse" type="text" required />
          <InputField label="Code Postal" type="text" required />
          <InputField label="Ville" type="text" required />
          <Button type="submit">Suivant</Button>
        </form>
      </div>

      <div className={`register-card-wrapper ${step === 3 ? 'active' : ''}`}>
        <form onSubmit={handleSubmit} className="register-card">
          <InputField label="Email" type="email" required />
          <InputField label="Numéro de Téléphone" type="tel" required />
          <InputField label="Nationalité" type="text" required />
          <InputField label="Niveau d'étude" type="text" required />
          <Button type="submit">VALIDER INSCRIPTION</Button>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
