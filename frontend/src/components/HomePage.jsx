import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
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

  // Redirection en fonction de l'état d'authentification
  return <Navigate to={isAuthenticated ? dashboardPath : '/login'} replace />;
};

export default HomePage; 