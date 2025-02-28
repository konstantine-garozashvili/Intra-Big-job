import React from 'react';
import Navbar from '../components/Navbar';
import RegisterForm from '../components/RegisterForm';
import './RegisterPage.css';

function RegisterPage() {
  return (
    <div className="register-page">
      <Navbar />
      <div className="register-content">
        <RegisterForm />
      </div>
    </div>
  );
}

export default RegisterPage;
