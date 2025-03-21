import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import { useEffect, useState } from 'react';

/**
 * Composant pour protéger les routes publiques (login, register, etc.)
 * Redirige vers la racine si l'utilisateur est déjà connecté
 */
const PublicRoute = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = authService.isLoggedIn();
      setIsAuthenticated(isLoggedIn);
      setIsChecking(false);
    };

    checkAuth();
  }, [location.pathname]);

  if (isChecking) {
    return null;
  }

  // Si l'utilisateur est authentifié, rediriger vers la page d'accueil
  // qui s'occupera de rediriger vers la page appropriée
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur n'est pas authentifié, on affiche la page publique
  return <Outlet />;
};

export default PublicRoute; 