// src/components/InputField.jsx
import React from 'react';
import './InputField.css'; // Importez le fichier CSS

function InputField({ label, type, name, value, onChange, required }) {
    return (
        <div className="input-field">
            <label htmlFor={name}>{label}</label>
            <input 
                type={type} 
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
}

export default InputField;
