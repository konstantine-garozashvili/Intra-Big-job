import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook pour le préchargement intelligent des pages
 * Ne charge que les pages pertinentes en fonction du contexte et du chemin actuel
 */
const useIntelligentPreload = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  useEffect(() => {
    // Fonction pour précharger des composants spécifiques
    const preloadComponent = (getComponent) => {
      // Précharger immédiatement sans délai
      getComponent();
    };
    
    // Préchargement basé sur le chemin actuel
    if (currentPath.includes('/login') || currentPath === '/') {
      // Sur la page de login, précharger le dashboard et l'enregistrement
      preloadComponent(() => import('../../pages/Dashboard'));
      preloadComponent(() => import('../../pages/Register'));
      // Précharger les composants de réinitialisation de mot de passe
      preloadComponent(() => import('../../components/auth/ResetPasswordRequest'));
    } 
    else if (currentPath.includes('/register')) {
      // Sur la page d'enregistrement, précharger la confirmation
      preloadComponent(() => import('../../pages/RegistrationSuccess'));
    }
    else if (currentPath.includes('/reset-password')) {
      // Précharger les composants de réinitialisation de mot de passe
      if (currentPath === '/reset-password') {
        preloadComponent(() => import('../../components/auth/ResetPasswordConfirmation'));
      } else if (currentPath.includes('/reset-password/confirmation')) {
        preloadComponent(() => import('../../components/auth/ResetPassword'));
      }
    }
    else if (currentPath.includes('/profile')) {
      // Sur le profil, précharger les sous-pages de profil
      const profilePath = currentPath.split('/').pop();
      
      // Préchargement contextuel des vues de profil
      if (profilePath === 'settings') {
        preloadComponent(() => import('../../pages/Global/Profile/views/SecuritySettings'));
      } 
      else if (profilePath === 'security') {
        preloadComponent(() => import('../../pages/Global/Profile/views/NotificationSettings'));
      }
      else {
        // Précharger la page de paramètres par défaut
        preloadComponent(() => import('../../pages/Global/Profile/views/SettingsProfile'));
      }
    }
    // Préchargement pour les routes spécifiques aux rôles
    else if (currentPath.includes('/admin')) {
      preloadComponent(() => import('../../pages/Admin/Dashboard'));
    }
    else if (currentPath.includes('/student')) {
      preloadComponent(() => import('../../pages/Student/Dashboard'));
      preloadComponent(() => import('../../pages/Student/Schedule'));
      preloadComponent(() => import('../../pages/Student/Attendance'));
    }
    else if (currentPath.includes('/teacher')) {
      preloadComponent(() => import('../../pages/Teacher/Dashboard'));
      preloadComponent(() => import('../../pages/Teacher/SignatureMonitoring'));
      preloadComponent(() => import('../../pages/Teacher/Attendance'));
    }
  }, [currentPath]);
  
  return null;
};

/**
 * Composant IntelligentPreload - Gère le préchargement intelligent des pages
 */
const IntelligentPreload = () => {
  useIntelligentPreload();
  return null;
};

export default IntelligentPreload;
