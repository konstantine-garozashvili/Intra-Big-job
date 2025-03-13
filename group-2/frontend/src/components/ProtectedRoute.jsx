import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { getDashboardPathByRole, getPrimaryRole } from '@/lib/utils/roleUtils';

/**
 * Composant pour protéger les routes nécessitant une authentification
 * Redirige vers la racine si l'utilisateur n'est pas connecté
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const redirectedRef = useRef(false);
  const renderedOutletRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = authService.isLoggedIn();
      
      if (!isLoggedIn) {
        // Afficher une notification seulement si l'utilisateur essaie d'accéder à une page protégée
        if (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register') {
          toast.error('Veuillez vous connecter pour accéder à cette page', {
            duration: 3000,
            position: 'top-center',
          });
        }
      }
      
      setIsAuthenticated(isLoggedIn);
      setIsChecking(false);
    };

    checkAuth();
  }, [location.pathname]);

  // Pendant la vérification, on renvoie le contenu existant ou null la première fois
  if (isChecking) {
    // Si on a déjà rendu l'Outlet auparavant et qu'on est authentifié, on continue de l'afficher
    // pour éviter un flash de chargement
    if (renderedOutletRef.current && localStorage.getItem('token')) {
      return <Outlet />;
    }
    
    return null;
  }

  // Si l'utilisateur n'est pas authentifié, on le redirige vers la page d'accueil
  if (!isAuthenticated) {
    // Éviter les redirections multiples
    if (redirectedRef.current) {
      return null;
    }
    
    redirectedRef.current = true;
    
    // Stocker l'URL à laquelle l'utilisateur essayait d'accéder pour y revenir après la connexion
    const returnTo = location.pathname !== '/' ? location.pathname : undefined;
    if (returnTo) {
      sessionStorage.setItem('returnTo', returnTo);
    }
    
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur est authentifié, on affiche le contenu de la route
  renderedOutletRef.current = true; // Marquer que l'Outlet a été rendu
  
  // Utilisation d'un wrapper div pour préserver la référence DOM
  return (
    <div className="protected-route-wrapper">
      <Outlet />
    </div>
  );
};

export default ProtectedRoute; 