// src/components/InputField.jsx
import React, { useState } from 'react';
import './InputField.css'; // Importez le fichier CSS

function InputField({ 
    label, 
    type, 
    name, 
    value, 
    onChange, 
    required, 
    placeholder,
    error,
    pattern,
    minLength,
    maxLength
}) {
    const [focused, setFocused] = useState(false);
    
    const handleFocus = () => {
        setFocused(true);
    };

    return (
        <div className={`input-field ${error ? 'has-error' : ''}`}>
            <label htmlFor={name}>{label}{required && <span className="required">*</span>}</label>
            <input 
                type={type} 
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                pattern={pattern}
                minLength={minLength}
                maxLength={maxLength}
                onBlur={handleFocus}
                data-focused={focused.toString()}
                className={error ? 'input-error' : ''}
            />
            {error && <div className="error-text">{error}</div>}
        </div>
    );
}

// Valeurs par défaut pour les props
InputField.defaultProps = {
    type: 'text',
    required: false,
    placeholder: '',
    error: null,
    pattern: null,
    minLength: null,
    maxLength: null
};

export default InputField;
