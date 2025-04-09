import { toast as sonnerToast } from 'sonner';

/**
 * Fonction wrapper pour créer des toasts avec des styles et comportements spécifiques
 * pour les messages liés aux limites de mots de passe
 */
export const toast = {
  // Réexporter les fonctions standard de sonner
  ...sonnerToast,
  
  /**
   * Affiche un message d'erreur spécifique pour les problèmes de limite de mot de passe
   * @param {string} message Le message d'erreur à afficher
   */
  passwordLimitError: (message) => {
    sonnerToast.error(message, {
      description: "La limite de 50 caractères est une mesure de sécurité importante.",
      duration: 6000, // Durée plus longue pour ce type d'erreur
      position: "top-center",
      style: {
        backgroundColor: "#fef2f2", // Rouge très pâle
        border: "1px solid #f87171", // Bordure rouge
        color: "#b91c1c", // Texte rouge foncé
        fontWeight: "500",
      }
    });
  },
  
  /**
   * Affiche un avertissement spécifique pour les problèmes de limite de mot de passe
   * @param {string} message Le message d'avertissement à afficher
   */
  passwordLimitWarning: (message) => {
    sonnerToast(message, {
      description: "Les mots de passe doivent avoir entre 8 et 50 caractères.",
      duration: 4000,
      icon: "⚠️",
      position: "top-center",
      style: {
        backgroundColor: "#fffbeb", // Jaune très pâle
        border: "1px solid #fbbf24", // Bordure jaune
        color: "#92400e", // Texte orangé foncé
        fontWeight: "500",
      }
    });
  }
};

export default toast; 