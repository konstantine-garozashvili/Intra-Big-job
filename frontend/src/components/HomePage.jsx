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
          // Navigation proactive vers le dashboard spécifique au rôle
          navigate(roleDashboardPath, { replace: true });
        } else {
          // Si non connecté, rediriger vers la page de connexion
          setDashboardPath('/login');
          // Navigation proactive pour éviter la double redirection
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        // En cas d'erreur, rediriger vers login
        navigate('/login', { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [permissions, navigate]);

  // Pendant la vérification, ne rien afficher
  if (isChecking) {
    return null;
  }

  // Ce return ne sera jamais atteint car nous utilisons navigate() directement
  return null;
};

export default HomePage;