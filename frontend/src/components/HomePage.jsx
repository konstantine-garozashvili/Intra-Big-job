import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import { useRolePermissions } from '@/features/roles/useRolePermissions';
import { useNavigate } from 'react-router-dom';

/**
 * Composant pour la page d'accueil qui redirige vers la page appropriée 
 * en fonction de l'état d'authentification de l'utilisateur
 */
const HomePage = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('/login');
  const permissions = useRolePermissions();
  const navigate = useNavigate();
  
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

  // Modification: Ajouter un délai avant la redirection pour éviter les cascades
  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      // Attendre un court instant avant de rediriger vers /login
      // pour éviter une redirection immédiate qui pourrait interférer
      // avec d'autres processus de redirection
      const timer = setTimeout(() => {
        // Ne rediriger que si nous sommes sur la page d'accueil exactement
        if (window.location.pathname === '/') {
          navigate('/login');
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isChecking, isAuthenticated]);

  // Redirection en fonction de l'état d'authentification
  return <Navigate to={isAuthenticated ? dashboardPath : '/login'} replace />;
};

export default HomePage; 