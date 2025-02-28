// src/components/LoginCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import InputField from './InputField';
import Button from "./ui/button.jsx";
import avatarImage from '../assets/avatarINVIT.png';

import './LoginCard.css';

function LoginCard() {
    return (
        <div className="login-card-wrapper">
            <div className="login-card">
            <div className="avatar-container">
  <img src={avatarImage} alt="Avatar" className="avatar-icon" />
</div>


                <InputField label="Email" type="email" />
                <InputField label="Mot de Passe" type="password" />
                <Button className="button">Connexion</Button>
                <div className="forgot-password-container">
                <Link to="/reset-password" className="forgot-password">Mot de Passe Oublié ?</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginCard;
