import React from "react";

// Fonction pour évaluer la force du mot de passe
export const evaluatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Longueur du mot de passe
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Présence de chiffres
  if (/\d/.test(password)) score += 1;
  
  // Présence de lettres minuscules et majuscules
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  
  // Présence de caractères spéciaux
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  return Math.min(score, 4); // Score de 0 à 4
};

// Composant pour afficher la force du mot de passe
export const PasswordStrengthIndicator = ({ password }) => {
  const strength = evaluatePasswordStrength(password);
  
  // Déterminer la couleur et le texte en fonction de la force
  const getColorClass = () => {
    switch (strength) {
      case 0: return "bg-gray-200";
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-green-500";
      default: return "bg-gray-200";
    }
  };
  
  const getText = () => {
    switch (strength) {
      case 0: return "Veuillez entrer un mot de passe";
      case 1: return "Très faible";
      case 2: return "Faible";
      case 3: return "Moyen";
      case 4: return "Fort";
      default: return "";
    }
  };
  
  // Calculer le pourcentage de progression
  const strengthPercentage = (strength / 4) * 100;
  
  return (
    <div className="mt-1 space-y-1">
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColorClass()} transition-all duration-300`} 
          style={{ width: `${strengthPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{getText()}</span>
        <span className="text-xs text-gray-500">{strength > 0 ? `${strength}/4` : ""}</span>
      </div>
    </div>
  );
}; 