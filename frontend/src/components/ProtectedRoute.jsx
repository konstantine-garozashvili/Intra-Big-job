import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useRoles } from '@/features/roles/roleContext';
import { useRolePermissions } from '@/features/roles/useRolePermissions';

/**
 * Composant pour protéger les routes nécessitant une authentification
 * Redirige vers la racine si l'utilisateur n'est pas connecté
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const redirectedRef = useRef(false);
  const renderedOutletRef = useRef(false);
  const { roles, hasRole, isLoading: rolesLoading } = useRoles();
  const permissions = useRolePermissions();

  // Verify that the user has the necessary roles for the requested path
  const checkRouteAccess = () => {
    // Ne pas vérifier les accès si les rôles ne sont pas encore chargés
    if (!rolesLoaded || rolesLoading) {
      return true;
    }
    
    const path = location.pathname;
    
    // Check for role-specific paths
    if (path.startsWith('/admin') && !permissions.isAdmin()) {
      toast.error("Accès refusé: Vous n'avez pas les droits d'administrateur nécessaires", {
        duration: 3000,
        position: 'top-center',
      });
      return false;
    }
    
    if (path.startsWith('/student') && !permissions.isStudent()) {
      toast.error("Accès refusé: Cette page est réservée aux étudiants", {
        duration: 3000,
        position: 'top-center',
      });
      return false;
    }
    
    if (path.startsWith('/teacher') && !permissions.isTeacher()) {
      toast.error("Accès refusé: Cette page est réservée aux formateurs", {
        duration: 3000,
        position: 'top-center',
      });
      return false;
    }
    
    if (path.startsWith('/hr') && !permissions.isHR()) {
      toast.error("Accès refusé: Cette page est réservée aux ressources humaines", {
        duration: 3000,
        position: 'top-center',
      });
      return false;
    }
    
    if (path.startsWith('/superadmin') && !hasRole("ROLE_SUPERADMIN")) {
      toast.error("Accès refusé: Cette page est réservée aux super administrateurs", {
        duration: 3000,
        position: 'top-center',
      });
      return false;
    }
    
    if (path.startsWith('/recruiter') && !permissions.isRecruiter() && !permissions.isAdmin() && !permissions.isSuperAdmin()) {
      toast.error("Accès refusé: Cette page est réservée aux recruteurs", {
        duration: 3000,
        position: 'top-center',
      });
      return false;
    }
    
    if (path.startsWith('/guest') && !permissions.isGuest()) {
      toast.error("Accès refusé: Cette page est réservée aux invités", {
        duration: 3000,
        position: 'top-center',
      });
      return false;
    }
    
    return true;
  };

  // Effet pour surveiller le chargement des rôles
  useEffect(() => {
    if (!rolesLoading && isAuthenticated) {
      setRolesLoaded(true);
    }
  }, [rolesLoading, isAuthenticated]);

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
  if (isChecking || (isAuthenticated && rolesLoading)) {
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
  
  // Vérifier l'accès aux routes seulement si les rôles sont chargés
  const hasRouteAccess = checkRouteAccess();
  
  // If the user doesn't have access to the route, redirect to dashboard
  if (!hasRouteAccess && rolesLoaded) {
    return <Navigate to="/dashboard" replace />;
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
