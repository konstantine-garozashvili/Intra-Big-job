// src/components/InputField.jsx
import React from 'react';
import './InputField.css'; // Importez le fichier CSS

function InputField({ label, type }) {
    return (
        <div className="input-field">
            <label htmlFor={label}>{label}</label>
            <input type={type} id={label} />
        </div>
    );
}

export default InputField;
