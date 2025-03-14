import { Navigate, Outlet, useLocation } from 'react-router-dom';
import authService from '@/lib/services/authService';
import apiService from '@/lib/services/apiService';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

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
  const redirectedRef = useRef(false);
  const renderedOutletRef = useRef(false);
  const checkedRolesRef = useRef(false);

  useEffect(() => {
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
        toast.error('Veuillez vous connecter pour accéder à cette page', {
          duration: 3000,
          position: 'top-center',
        });
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
        
        // Récupérer les informations de l'utilisateur
        const user = authService.getUser();
        console.log('Utilisateur récupéré via authService.getUser():', user);
        
        // Si nous n'avons pas d'informations utilisateur, essayer de les récupérer via l'API
        if (!user) {
          console.log('Tentative de récupération des informations utilisateur via API...');
          try {
            // Tenter de récupérer les informations utilisateur via l'API
            const userData = await authService.getCurrentUser();
            console.log('Données utilisateur récupérées via API:', userData);
            
            // Stocker les informations utilisateur dans le localStorage
            if (userData) {
              localStorage.setItem('user', JSON.stringify(userData));
              console.log('Informations utilisateur stockées dans localStorage');
              
              // Vérifier les rôles avec les nouvelles données
              checkRoles(userData);
            } else {
              console.log('Aucune donnée utilisateur récupérée via API');
              setHasAccess(true); // Autoriser temporairement
            }
          } catch (apiError) {
            console.error('Erreur lors de la récupération des données utilisateur via API:', apiError);
            setHasAccess(true); // Autoriser temporairement
          }
        } else {
          // Vérifier les rôles avec les données existantes
          checkRoles(user);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des droits:', error);
        
        // En cas d'erreur, autoriser temporairement l'accès
        setHasAccess(true);
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
      
      // Vérifier si l'utilisateur a le rôle de recruteur ou d'administrateur
      const hasRequiredRole = userRoles.some(role => {
        let roleName = '';
        
        if (typeof role === 'object' && role !== null) {
          roleName = role.name || role.role || '';
        } else if (typeof role === 'string') {
          roleName = role;
        } else {
          return false;
        }
        
        roleName = roleName.toLowerCase();
        console.log('Vérification du rôle:', roleName);
        
        return roleName.includes('recruiter') || 
               roleName.includes('admin') || 
               roleName === 'role_recruiter' || 
               roleName === 'role_admin';
      });
      
      console.log('A les droits requis:', hasRequiredRole);
      
      // Marquer que nous avons vérifié les rôles
      checkedRolesRef.current = true;
      
      // Si l'utilisateur n'a pas les droits requis, afficher un message d'erreur
      if (!hasRequiredRole) {
        toast.error('Vous n\'avez pas les droits nécessaires pour accéder à cette page', {
          duration: 3000,
          position: 'top-center',
        });
      }
      
      setHasAccess(hasRequiredRole);
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

  // Si l'utilisateur n'est pas authentifié ou n'a pas les droits nécessaires
  if (!hasAccess) {
    // Éviter les redirections multiples
    if (redirectedRef.current) {
      return null;
    }
    
    redirectedRef.current = true;
    
    // Redirection vers la page de connexion si non connecté
    if (!localStorage.getItem('token')) {
      toast.error('Veuillez vous connecter pour accéder à cette page', {
        duration: 3000,
        position: 'top-center',
      });
      return <Navigate to="/login" replace />;
    }
    
    // Redirection vers le dashboard si connecté mais sans les droits nécessaires
    toast.error('Vous n\'avez pas les droits nécessaires pour accéder à cette page', {
      duration: 3000,
      position: 'top-center',
    });
    return <Navigate to="/dashboard" replace />;
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
