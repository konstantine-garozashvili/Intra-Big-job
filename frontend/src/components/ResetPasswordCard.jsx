import React from 'react';
import InputField from './InputField';
import Button from "./ui/button.jsx";
import avatarImage from '../assets/avatarINVIT.png';
import './ResetPasswordCard.css';

function ResetPasswordCard() {
    return (
        <div className="reset-password-card-wrapper">
            <div className="reset-password-card">
                <div className="avatar-container">
                    <img src={avatarImage} alt="Avatar" className="avatar-icon" />
                </div>
                <InputField label="Email" type="email" />
                <div className="button-container">
                    <Button className="cancel-button">Annuler</Button>
                    <Button className="continue-button">Continuer</Button>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordCard;
