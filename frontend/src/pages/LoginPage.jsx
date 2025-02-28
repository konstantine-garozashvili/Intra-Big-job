import React from 'react';
import Navbar from '../components/Navbar';
import LoginCard from '../components/LoginCard';
import './LoginPage.css'; // Assurez-vous que ce fichier existe et contient les styles pour le background

function LoginPage() {
  return (
    <div className="login-page">
      <Navbar />
      <div className="login-content">
        <LoginCard />
      </div>
    </div>
  );
}

export default LoginPage;
