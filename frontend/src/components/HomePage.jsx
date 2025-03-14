import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import { useRolePermissions } from '@/features/roles/useRolePermissions';

/**
 * Composant pour la page d'accueil qui redirige vers la page appropriée 
 * en fonction de l'état d'authentification de l'utilisateur
 */
const HomePage = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('/login');
  const permissions = useRolePermissions();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = authService.isLoggedIn();
        setIsAuthenticated(isLoggedIn);
        
        if (isLoggedIn) {
          // Déterminer le chemin du tableau de bord en fonction du rôle
          const roleDashboardPath = permissions.getRoleDashboardPath();
          setDashboardPath(roleDashboardPath);
        }
      } catch (error) {
        // console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [permissions]);

  if (isChecking) {
    // Afficher un indicateur de chargement minimaliste au lieu de rien
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#528eb2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirection en fonction de l'état d'authentification
  // Si connecté -> Tableau de bord spécifique au rôle, sinon -> Login
  return <Navigate to={isAuthenticated ? dashboardPath : '/login'} replace />;
};

export default HomePage; 