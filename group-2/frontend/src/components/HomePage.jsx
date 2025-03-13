import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import { getDashboardPathByRole, getPrimaryRole } from '@/lib/utils/roleUtils';

/**
 * Composant pour la page d'accueil qui redirige vers la page appropriée 
 * en fonction de l'état d'authentification de l'utilisateur
 */
const HomePage = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('/login');
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = authService.isLoggedIn();
        setIsAuthenticated(isLoggedIn);
        
        if (isLoggedIn) {
          const userData = await authService.getCurrentUser();
          const primaryRole = getPrimaryRole(userData.roles);
          const path = getDashboardPathByRole(primaryRole);
          setDashboardPath(path);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setDashboardPath('/login');
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
  return <Navigate to={dashboardPath} replace />;
};

export default HomePage; 