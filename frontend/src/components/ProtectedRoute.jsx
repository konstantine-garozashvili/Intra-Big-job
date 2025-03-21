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
      console.log('Rôles pas encore chargés, autorisation temporaire');
      return true;
    }
    
    const path = location.pathname;
    
    // Check for role-specific paths in order of specificity
    // SuperAdmin has access to everything
    if (hasRole('ROLE_SUPERADMIN')) {
      return true;
    }

    // Check specific role paths
    const roleChecks = [
      {
        path: '/superadmin',
        check: () => hasRole('ROLE_SUPERADMIN'),
        message: "Accès refusé: Cette page est réservée aux super administrateurs"
      },
      {
        path: '/admin',
        check: () => permissions.isAdmin(),
        message: "Accès refusé: Vous n'avez pas les droits d'administrateur nécessaires"
      },
      {
        path: '/teacher',
        check: () => permissions.isTeacher() || permissions.isAdmin() || hasRole('ROLE_SUPERADMIN'),
        message: "Accès refusé: Cette page est réservée aux formateurs"
      },
      {
        path: '/student',
        check: () => permissions.isStudent() || permissions.isAdmin() || hasRole('ROLE_SUPERADMIN'),
        message: "Accès refusé: Cette page est réservée aux étudiants"
      },
      {
        path: '/hr',
        check: () => permissions.isHR() || permissions.isAdmin() || hasRole('ROLE_SUPERADMIN'),
        message: "Accès refusé: Cette page est réservée aux ressources humaines"
      },
      {
        path: '/recruiter',
        check: () => permissions.isRecruiter() || permissions.isAdmin() || hasRole('ROLE_SUPERADMIN'),
        message: "Accès refusé: Cette page est réservée aux recruteurs"
      },
      {
        path: '/guest',
        check: () => permissions.isGuest() || permissions.isAdmin() || hasRole('ROLE_SUPERADMIN'),
        message: "Accès refusé: Cette page est réservée aux invités"
      }
    ];

    // Find the first matching path and check its permissions
    const matchingRole = roleChecks.find(role => path.startsWith(role.path));
    if (matchingRole) {
      if (!matchingRole.check()) {
        // Utiliser un court délai avant d'afficher l'erreur pour éviter les faux positifs
        // pendant le chargement des rôles
        setTimeout(() => {
          // Vérifier à nouveau avant d'afficher l'erreur
          if (!matchingRole.check()) {
            toast.error(matchingRole.message, {
              duration: 3000,
              position: 'top-center',
            });
          }
        }, 300);
        return false;
      }
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
      // Ajouter un délai avant de vérifier l'authentification pour éviter les redirections multiples
      // et laisser le temps aux autres composants de se charger correctement
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const isLoggedIn = authService.isLoggedIn();
      
      if (!isLoggedIn) {
        // Éviter de montrer des toasts pendant le chargement initial
        if (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && !redirectedRef.current) {
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
    
    // Rediriger vers la page d'accueil qui gère elle-même la redirection vers login si nécessaire
    return <Navigate to="/" replace />;
  }
  
  // Vérifier l'accès aux routes seulement si les rôles sont chargés
  const hasRouteAccess = checkRouteAccess();
  
  // If the user doesn't have access to the route, redirect to dashboard
  if (!hasRouteAccess && rolesLoaded) {
    // Éviter les redirections multiples
    if (redirectedRef.current) {
      return null;
    }
    
    redirectedRef.current = true;
    
    // Récupérer le chemin approprié en fonction du rôle
    const dashboardPath = permissions.getRoleDashboardPath();
    return <Navigate to={dashboardPath} replace />;
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
