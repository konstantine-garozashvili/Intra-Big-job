import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import { useEffect, useState, useRef } from 'react';

/**
 * Composant pour protéger les routes publiques (login, register, etc.)
 * Redirige vers le dashboard si l'utilisateur est déjà connecté
 */
const PublicRoute = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const lastAuthState = useRef(false);
  const isProcessingRef = useRef(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      // Éviter les vérifications excessives si déjà en cours
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      
      const isLoggedIn = authService.isLoggedIn();
      
      // Ne mettre à jour l'état que si la valeur a changé
      if (isLoggedIn !== lastAuthState.current) {
        lastAuthState.current = isLoggedIn;
        setIsAuthenticated(isLoggedIn);
      }
      
      setIsChecking(false);
      isProcessingRef.current = false;
    };

    checkAuth();
    
    // Ajouter un écouteur pour les événements d'authentification
    const handleAuthEvent = () => {
      // Petit délai pour s'assurer que localStorage est à jour
      setTimeout(checkAuth, 50);
    };
    
    window.addEventListener('login-success', handleAuthEvent);
    window.addEventListener('logout-success', handleAuthEvent);
    
    return () => {
      window.removeEventListener('login-success', handleAuthEvent);
      window.removeEventListener('logout-success', handleAuthEvent);
    };
  }, []); // Suppression de la dépendance location.pathname pour éviter des vérifications excessives

  // Si encore en vérification, retourner un élément vide
  if (isChecking) {
    return null;
  }

  // Si l'utilisateur est authentifié et n'est pas sur la page d'accueil, rediriger vers le dashboard
  if (isAuthenticated && location.pathname !== '/') {
    return <Navigate to="/dashboard" replace />;
  }

  // Si l'utilisateur n'est pas authentifié ou est sur la page d'accueil, on affiche la page publique
  return <Outlet />;
};

export default PublicRoute; 