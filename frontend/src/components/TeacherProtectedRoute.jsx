 import { Navigate, Outlet, useLocation } from 'react-router-dom';
import authService from '@/lib/services/authService';
import apiService from '@/lib/services/apiService';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/**
 * Composant de route protégée pour les enseignants, administrateurs et super-administrateurs
 * Vérifie si l'utilisateur est connecté et a les droits nécessaires
 * Redirige vers la page de connexion si non connecté
 * Redirige vers la page d'accueil si connecté mais sans les droits nécessaires
 */
const TeacherProtectedRoute = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const renderedOutletRef = useRef(false);
  const checkedRolesRef = useRef(false);
  const notificationShownRef = useRef(false);

  useEffect(() => {
    // Réinitialiser les références à chaque changement de route
    renderedOutletRef.current = false;
    checkedRolesRef.current = false;
    notificationShownRef.current = false;
    // Vérifier si les données utilisateur dans localStorage sont incorrectes
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Si les données contiennent un message d'erreur, les supprimer
        if (userData.success === false || userData.message?.includes('No route found')) {
          console.log('Données utilisateur incorrectes détectées, nettoyage du localStorage');
          localStorage.removeItem('user');
        }
      } catch (e) {
        console.error('Erreur lors de la vérification des données utilisateur:', e);
        localStorage.removeItem('user');
      }
    }
    
    const checkAuth = async () => {
      // Réinitialiser le statut de vérification
      setIsChecking(true);
      
      // Vérifier si l'utilisateur est connecté via le token
      const token = localStorage.getItem('token');
      console.log('Token dans localStorage:', token ? 'Présent' : 'Absent');
      
      // Vérifier les données utilisateur
      const userStr = localStorage.getItem('user');
      console.log('Données utilisateur dans localStorage:', userStr);
      
      if (!token) {
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
        
        // Forcer la récupération des informations utilisateur via l'API
        console.log('Tentative de récupération des informations utilisateur via API...');
        try {
          // Tenter de récupérer les informations utilisateur via l'API
          const userData = await authService.getCurrentUser();
          console.log('Données utilisateur récupérées via API:', userData);
          
          // Si les données contiennent un message d'erreur, considérer comme non autorisé
          if (userData && userData.success === false) {
            console.error('Erreur lors de la récupération des données utilisateur:', userData.message);
            setHasAccess(false);
            setIsChecking(false);
            
            // Si le message d'erreur concerne une route non trouvée, nettoyer les données d'authentification
            if (userData.message && userData.message.includes('No route found')) {
              console.log('Erreur de route API détectée, nettoyage des données d\'authentification');
              authService.clearAuthData();
              return;
            }
            
            if (!notificationShownRef.current) {
              toast.error('Erreur d\'authentification. Veuillez vous reconnecter.', {
                duration: 3000,
                position: 'top-center',
              });
              notificationShownRef.current = true;
            }
            return;
          }
          
          // Extraire les données utilisateur de la réponse
          let userInfo = userData;
          
          // Vérifier si les données sont dans une propriété 'user' ou 'data'
          if (userData.user) {
            userInfo = userData.user;
          } else if (userData.data) {
            userInfo = userData.data;
          } else if (userData.success && userData.user) {
            userInfo = userData.user;
          }
          
          console.log('Données utilisateur extraites:', userInfo);
          
          // Vérifier les rôles de l'utilisateur
          const hasRequiredRole = checkRoles(userInfo);
          console.log('A les droits requis:', hasRequiredRole);
          
          // Mettre à jour l'état d'accès
          setHasAccess(hasRequiredRole);
          checkedRolesRef.current = true;
          
          // Afficher une notification si l'accès est refusé
          if (!hasRequiredRole && !notificationShownRef.current) {
            toast.error('Vous n\'avez pas les droits nécessaires pour accéder à cette page', {
              duration: 3000,
              position: 'top-center',
            });
            notificationShownRef.current = true;
          }
        } catch (apiError) {
          console.error('Erreur lors de l\'appel API getCurrentUser:', apiError);
          
          // En cas d'erreur API, essayer d'utiliser les données du localStorage
          const user = authService.getUser();
          console.log('Utilisateur récupéré via authService.getUser() (fallback):', user);
          
          if (user && !user.success) {
            // Si les données du localStorage contiennent une erreur, considérer comme non autorisé
            setHasAccess(false);
            
            // Si le message d'erreur concerne une route non trouvée, nettoyer les données d'authentification
            if (user.message && user.message.includes('No route found')) {
              console.log('Erreur de route API détectée dans localStorage, nettoyage des données d\'authentification');
              authService.clearAuthData();
              return;
            }
            
            if (!notificationShownRef.current) {
              toast.error('Session expirée. Veuillez vous reconnecter.', {
                duration: 3000,
                position: 'top-center',
              });
              notificationShownRef.current = true;
            }
          } else if (user) {
            // Vérifier les rôles de l'utilisateur depuis le localStorage
            const hasRequiredRole = checkRoles(user);
            console.log('A les droits requis (fallback):', hasRequiredRole);
            
            // Mettre à jour l'état d'accès
            setHasAccess(hasRequiredRole);
            checkedRolesRef.current = true;
            
            // Afficher une notification si l'accès est refusé
            if (!hasRequiredRole && !notificationShownRef.current) {
              toast.error('Vous n\'avez pas les droits nécessaires pour accéder à cette page', {
                duration: 3000,
                position: 'top-center',
              });
              notificationShownRef.current = true;
            }
          } else {
            // Aucune donnée utilisateur disponible
            setHasAccess(false);
            if (!notificationShownRef.current) {
              toast.error('Veuillez vous connecter pour accéder à cette page', {
                duration: 3000,
                position: 'top-center',
              });
              notificationShownRef.current = true;
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des droits:', error);
        
        // En cas d'erreur, ne pas autoriser l'accès
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
    
    // Fonction pour vérifier les rôles
    const checkRoles = (user) => {
      console.log('Vérification des rôles pour:', user);
      
      // Extraire les rôles de l'utilisateur
      let userRoles = [];
      
      if (Array.isArray(user.roles)) {
        userRoles = user.roles;
      } else if (typeof user.roles === 'object' && user.roles !== null) {
        userRoles = Object.values(user.roles);
      } else if (user.role) {
        userRoles = Array.isArray(user.role) ? user.role : [user.role];
      }
      
      console.log('Rôles extraits:', userRoles);
      
      // Vérifier si l'utilisateur a le rôle d'enseignant, d'administrateur ou de super-administrateur
      const hasRequiredRole = userRoles.some(role => {
        // Si le rôle est une chaîne de caractères
        if (typeof role === 'string') {
          const roleLower = role.toLowerCase();
          return roleLower.includes('teacher') || 
                 roleLower.includes('admin') || 
                 roleLower === 'role_teacher' || 
                 roleLower === 'role_admin' ||
                 roleLower === 'role_superadmin';
        }
        
        // Si le rôle est un objet
        if (typeof role === 'object' && role !== null) {
          // Essayer d'extraire le nom du rôle de différentes propriétés possibles
          const roleName = (role.name || role.role || role.roleName || '').toLowerCase();
          return roleName.includes('teacher') || 
                 roleName.includes('admin') || 
                 roleName === 'role_teacher' || 
                 roleName === 'role_admin' ||
                 roleName === 'role_superadmin';
        }
        
        return false;
      });
      
      console.log('A les droits requis:', hasRequiredRole);
      
      // Marquer que nous avons vérifié les rôles
      checkedRolesRef.current = true;
      
      // Si l'utilisateur n'a pas les droits requis, afficher un message d'erreur
      if (!hasRequiredRole && !notificationShownRef.current) {
        toast.error('Vous n\'avez pas les droits nécessaires pour accéder à cette page', {
          duration: 3000,
          position: 'top-center',
        });
        notificationShownRef.current = true;
      }
      
      return hasRequiredRole;
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
  if (!hasAccess && !isChecking) {
    console.log('Accès refusé, redirection en cours...');
    
    // Redirection vers la page de connexion si non connecté
    if (!localStorage.getItem('token')) {
      console.log('Redirection vers /login');
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    
    // Redirection vers le dashboard si connecté mais sans les droits nécessaires
    console.log('Redirection vers /dashboard');
    
    // Afficher une notification d'erreur d'accès
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
    <div className="teacher-protected-route-wrapper">
      <Outlet />
    </div>
  );
};

export default TeacherProtectedRoute;
