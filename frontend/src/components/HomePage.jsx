import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/lib/services/authService';

/**
 * Composant pour la page d'accueil qui redirige vers la page appropriée 
 * en fonction de l'état d'authentification de l'utilisateur
 */
const HomePage = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = authService.isLoggedIn();
        setIsAuthenticated(isLoggedIn);
      } catch (error) {
        // console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    // Afficher un indicateur de chargement minimaliste au lieu de rien
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#528eb2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirection en fonction de l'état d'authentification
  // Si connecté -> Tableau de bord, sinon -> Login
  return isAuthenticated 
    ? <Navigate to="/dashboard" replace /> 
    : <Navigate to="/login" replace />;
};

export default HomePage; 