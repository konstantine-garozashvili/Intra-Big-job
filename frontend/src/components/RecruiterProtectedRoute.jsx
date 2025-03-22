import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '@/lib/services/authService';
import userDataManager from '@/lib/services/userDataManager';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useRolePermissions } from '@/features/roles/useRolePermissions';

/**
 * Composant de route protégée pour les recruteurs et administrateurs
 * Vérifie si l'utilisateur est connecté et a les droits nécessaires
 * Redirige vers la page de connexion si non connecté
 * Redirige vers la page d'accueil si connecté mais sans les droits nécessaires
 */
const RecruiterProtectedRoute = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const renderedOutletRef = useRef(false);
  const checkedRolesRef = useRef(false);
  const notificationShownRef = useRef(false);
  const lastCheckRef = useRef(0);
  const permissions = useRolePermissions();

  useEffect(() => {
    // Réinitialiser la notification à chaque changement de chemin
    renderedOutletRef.current = false;
    checkedRolesRef.current = false;
    notificationShownRef.current = false;
    
    const checkAuth = async () => {
      // Éviter les vérifications trop fréquentes (moins de 50ms d'intervalle)
      const now = Date.now();
      if (now - lastCheckRef.current < 50) {
        return;
      }
      lastCheckRef.current = now;
      
      // Réinitialiser le statut de vérification
      setIsChecking(true);
      
      // Vérifier si l'utilisateur est connecté
      if (!authService.isLoggedIn()) {
        if (!notificationShownRef.current) {
          toast.error('Veuillez vous connecter pour accéder à cette page', {
            duration: 3000,
            position: 'top-center',
          });
          notificationShownRef.current = true;
        }
        setHasAccess(false);
        setIsChecking(false);
        return;
      }
      
      try {
        // Si nous avons déjà vérifié les rôles et accordé l'accès, ne pas revérifier
        if (checkedRolesRef.current && hasAccess) {
          setIsChecking(false);
          return;
        }
        
        // Récupérer les données utilisateur en privilégiant le cache
        let userData;
        const cachedUserData = userDataManager.getCachedUserData();
        
        if (cachedUserData) {
          // Utiliser les données en cache si disponibles
          console.log('RecruiterProtectedRoute: Utilisation des données utilisateur en cache');
          userData = cachedUserData;
          
          // Vérifier si les données sont actuelles
          const stats = userDataManager.getStats();
          if (stats.dataAge && stats.dataAge > 5 * 60 * 1000) { // 5 minutes
            // Rafraîchir en arrière-plan sans bloquer l'affichage
            userDataManager.getUserData({
              forceRefresh: false,
              background: true,
              requestId: 'recruiter_protected_route_background'
            }).catch(e => {
              console.warn('Erreur lors du rafraîchissement en arrière-plan:', e);
            });
          }
        } else {
          // Si pas de cache, récupérer les données via le service utilisateur
          console.log('RecruiterProtectedRoute: Récupération des données utilisateur via API');
          userData = await authService.getCurrentUser(false, { requestSource: 'recruiterProtectedRoute' });
        }
        
        if (!userData) {
          setHasAccess(false);
          setIsChecking(false);
          if (!notificationShownRef.current) {
            toast.error('Impossible de récupérer vos informations, veuillez vous reconnecter', {
              duration: 3000,
              position: 'top-center',
            });
            notificationShownRef.current = true;
          }
          return;
        }
        
        // Utiliser les permissions du contexte des rôles pour une cohérence globale
        const hasRecruiterAccess = permissions.isRecruiter() || permissions.isAdmin();
        
        // Si les permissions ne sont pas encore chargées, vérifier manuellement
        if (!hasRecruiterAccess && userData.roles) {
          const hasRequiredRole = checkRolesManually(userData);
          setHasAccess(hasRequiredRole);
          checkedRolesRef.current = true;
        } else {
          setHasAccess(hasRecruiterAccess);
          checkedRolesRef.current = true;
        }
        
        // Afficher une notification si l'accès est refusé
        if (!hasAccess && !notificationShownRef.current) {
          toast.error('Vous n\'avez pas les droits nécessaires pour accéder à cette page', {
            duration: 3000,
            position: 'top-center',
          });
          notificationShownRef.current = true;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des droits:', error);
        setHasAccess(false);
        if (!notificationShownRef.current) {
          toast.error('Erreur lors de la vérification de vos droits d\'accès', {
            duration: 3000,
            position: 'top-center',
          });
          notificationShownRef.current = true;
        }
      } finally {
        setIsChecking(false);
      }
    };
    
    // Fonction pour vérifier manuellement les rôles (fallback)
    const checkRolesManually = (user) => {
      // Extraire les rôles de l'utilisateur
      let userRoles = [];
      
      if (Array.isArray(user.roles)) {
        userRoles = user.roles;
      } else if (typeof user.roles === 'object' && user.roles !== null) {
        userRoles = Object.values(user.roles);
      } else if (user.role) {
        userRoles = Array.isArray(user.role) ? user.role : [user.role];
      }
      
      // Vérifier si l'utilisateur a le rôle de recruteur, d'administrateur ou de super-administrateur
      return userRoles.some(role => {
        let roleName = '';
        
        if (typeof role === 'object' && role !== null) {
          roleName = role.name || role.role || '';
        } else if (typeof role === 'string') {
          roleName = role;
        } else {
          return false;
        }
        
        roleName = roleName.toLowerCase();
        
        return roleName.includes('recruiter') || 
               roleName.includes('admin') || 
               roleName === 'role_recruiter' || 
               roleName === 'role_admin' ||
               roleName === 'role_superadmin';
      });
    };

    checkAuth();
  }, [location.pathname, permissions]);

  // Pendant la vérification, on renvoie le contenu existant ou null la première fois
  if (isChecking) {
    // Si on a déjà rendu l'Outlet auparavant et qu'on est authentifié, on continue de l'afficher
    // pour éviter un flash de chargement
    if (renderedOutletRef.current && authService.isLoggedIn()) {
      return <Outlet />;
    }
    
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Vérification de vos droits d'accès...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié ou n'a pas les droits nécessaires
  if (!hasAccess) {
    // Redirection vers la page de connexion si non connecté
    if (!authService.isLoggedIn()) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    
    // Redirection vers le dashboard si connecté mais sans les droits nécessaires
    if (!notificationShownRef.current) {
      toast.error('Vous n\'avez pas les droits nécessaires pour accéder à cette page.', {
        duration: 3000,
        position: 'top-center',
      });
      notificationShownRef.current = true;
    }
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  // Si l'utilisateur est authentifié et a les droits nécessaires, on affiche le contenu de la route
  renderedOutletRef.current = true; // Marquer que l'Outlet a été rendu
  
  return (
    <div className="recruiter-protected-route-wrapper">
      <Outlet />
    </div>
  );
};

export default RecruiterProtectedRoute;
