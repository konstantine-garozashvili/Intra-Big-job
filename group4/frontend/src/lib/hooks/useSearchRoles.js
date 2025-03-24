import { useState, useEffect } from 'react';
import authService from '../services/authService';
import { useRoles, ROLES } from '../../features/roles/roleContext';

/**
 * Hook personnalisé pour gérer les rôles de recherche autorisés
 */
export const useSearchRoles = () => {
  const [allowedSearchRoles, setAllowedSearchRoles] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRoleSearch, setIsRoleSearch] = useState(false);
  const { roles: userRoles, hasRole, hasAnyRole } = useRoles();
  
  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const loggedIn = authService.isLoggedIn();
    setIsLoggedIn(loggedIn);
  }, []);

  // Déterminer les rôles de recherche autorisés en fonction des rôles de l'utilisateur
  useEffect(() => {
    let searchableRoles = [];
    
    // Check if user is logged in
    if (isLoggedIn) {
      // SuperAdmin a accès à tous les rôles (avec les deux variantes)
      if (hasRole(ROLES.SUPERADMIN)) {
        searchableRoles = ['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'TEACHER', 'STUDENT', 'RECRUITER', 'HR', 'GUEST'];
      }
      // Admin peut rechercher tous les rôles SAUF superadmin
      else if (hasRole(ROLES.ADMIN)) {
        searchableRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'RECRUITER', 'HR', 'GUEST'];
      } 
      // Teacher ne peut rechercher que les students et les HR
      else if (hasRole(ROLES.TEACHER) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN])) {
        searchableRoles = ['STUDENT', 'HR'];
      }
      // HR peut rechercher les teachers, students et recruiters
      else if (hasRole(ROLES.HR) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN])) {
        searchableRoles = ['TEACHER', 'STUDENT', 'RECRUITER'];
      }
      // Recruteurs ne peuvent chercher que les étudiants et les formateurs
      else if (hasRole(ROLES.RECRUITER) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.HR, ROLES.TEACHER])) {
        searchableRoles = ['TEACHER', 'STUDENT'];
      }
      // Students can search for students, teachers, recruiters, and HR
      else if (hasRole(ROLES.STUDENT)) {
        searchableRoles = ['TEACHER', 'STUDENT', 'RECRUITER', 'HR'];
      } 
      // Guests can only search recruiters
      else if (hasRole(ROLES.GUEST)) {
        searchableRoles = ['RECRUITER'];
      }
      // Default fallback (should not happen, but just in case)
      else {
        searchableRoles = ['RECRUITER'];
      }
    } else {
      // Not logged in users cannot search
      searchableRoles = [];
    }
    
    setAllowedSearchRoles(searchableRoles);
  }, [userRoles, hasRole, hasAnyRole, isLoggedIn]);

  // Fonction pour vérifier si une recherche est basée sur un rôle
  const checkForRoleSearch = (value) => {
    const matchRoleFromSearchTerm = (searchTerm, allowedRoles) => {
      if (!searchTerm || !allowedRoles || allowedRoles.length === 0) return false;
      
      // Convertir le terme de recherche en minuscules pour la comparaison
      const normalizedTerm = searchTerm.toLowerCase();
      
      // Liste des alias pour différents rôles en français
      const ROLE_ALIASES = {
        'admin': ['admin', 'administrateur'],
        'super_admin': ['super admin', 'superadmin', 'super administrateur'],
        'teacher': ['prof', 'professeur', 'formateur', 'formatrice', 'enseignant'],
        'student': ['étudiant', 'etudiante', 'élève', 'eleve', 'apprenant'],
        'hr': ['rh', 'ressources humaines', 'ressource humaine'],
        'recruiter': ['recruteur', 'recruteuse', 'recrutement']
      };
      
      // Vérifier si le terme correspond à un des rôles autorisés
      for (const role of allowedRoles) {
        const normalizedRole = role.replace(/^ROLE_/i, '').toLowerCase();
        
        // Vérifier les alias pour ce rôle
        const aliases = ROLE_ALIASES[normalizedRole] || [];
        
        // Vérifier si le terme correspond au rôle lui-même ou à un de ses alias
        if (normalizedTerm === normalizedRole || aliases.some(alias => normalizedTerm.includes(alias))) {
          return role;
        }
      }
      
      return false;
    };
    
    const matchResult = matchRoleFromSearchTerm(value, allowedSearchRoles);
    return matchResult ? true : false;
  };

  return {
    allowedSearchRoles,
    isLoggedIn,
    isRoleSearch,
    setIsRoleSearch,
    checkForRoleSearch,
    hasRole,
    hasAnyRole
  };
}; 