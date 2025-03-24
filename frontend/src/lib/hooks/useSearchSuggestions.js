import { useState, useRef, useEffect } from 'react';
import userAutocompleteService from '../services/autocompleteService';
import { ROLES } from '../../features/roles/roleContext';

/**
 * Hook pour gérer les suggestions de recherche
 */
export const useSearchSuggestions = ({ isLoggedIn, hasRole, hasAnyRole, checkForRoleSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isRoleSearch, setIsRoleSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Vérifie si l'utilisateur a un rôle spécial qui devrait toujours voir les suggestions
  const hasSpecialRole = () => {
    return hasRole(ROLES.SUPERADMIN) || 
      hasRole(ROLES.RECRUITER) || 
      hasRole(ROLES.TEACHER) || 
      hasRole(ROLES.STUDENT) ||
      hasRole(ROLES.HR) ||
      hasRole(ROLES.GUEST) ||
      hasRole(ROLES.ADMIN);
  };

  // Effacer le timeout lors du démontage
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Vérifie si la recherche est basée sur un rôle
  const updateIsRoleSearch = (value) => {
    const isRoleBasedSearch = checkForRoleSearch(value);
    setIsRoleSearch(isRoleBasedSearch);
    return isRoleBasedSearch;
  };

  // Récupère les suggestions de recherche
  const fetchSuggestions = (value) => {
    // Ne pas effectuer de recherche si l'utilisateur n'est pas connecté
    if (!isLoggedIn) {
      return;
    }
    
    const shouldAlwaysShowSuggestions = hasSpecialRole();
    
    // Only fetch when query is 1 or more characters
    if (value.length < 1) {
      setSuggestions([]);
      
      if (!shouldAlwaysShowSuggestions) {
        setShowSuggestions(false);
      }
      
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    userAutocompleteService.getSuggestions(value)
      .then((data) => {
        if (Array.isArray(data)) {
          // Limiter les résultats à 10 maximum
          setSuggestions(data.slice(0, 10));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          
          if (!shouldAlwaysShowSuggestions) {
            setShowSuggestions(false);
          }
        }
        
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        
        if (!shouldAlwaysShowSuggestions) {
          setShowSuggestions(false);
        }
        
        setIsLoading(false);
      });
  };

  // Récupère les suggestions initiales pour les rôles spéciaux
  const fetchInitialSuggestions = async () => {
    if (!isLoggedIn || !hasSpecialRole()) {
      return;
    }
    
    setIsLoading(true);
    setSuggestions([]);
    setShowSuggestions(true);
    
    let allResults = [];
    let searchSequence = [];
    
    // Définir la séquence de recherche en fonction du rôle
    if (hasRole(ROLES.SUPERADMIN)) {
      searchSequence = ['a'];
    } else if (hasRole(ROLES.ADMIN) && !hasRole(ROLES.SUPERADMIN)) {
      searchSequence = ['étudiant', 'formateur', 'recruteur', 'admin'];
    } else if (hasRole(ROLES.RECRUITER) && !hasRole(ROLES.SUPERADMIN)) {
      searchSequence = ['formateur', 'étudiant'];
    } else if (hasRole(ROLES.TEACHER) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN])) {
      searchSequence = ['étudiant', 'ressources humaines'];
    } else if (hasRole(ROLES.STUDENT) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.TEACHER])) {
      searchSequence = ['formateur', 'étudiant', 'recruteur'];
    } else if (hasRole(ROLES.HR) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN])) {
      searchSequence = ['étudiant', 'formateur', 'recruteur'];
    } else if (hasRole(ROLES.GUEST)) {
      searchSequence = ['recruteur'];
    }
    
    try {
      const MAX_RESULTS = 10;
      
      for (const term of searchSequence) {
        if (allResults.length >= MAX_RESULTS) break;
        
        const data = await userAutocompleteService.getSuggestions(term);
        
        if (Array.isArray(data) && data.length > 0) {
          const newUniqueResults = data.filter(newUser => 
            !allResults.some(existingUser => existingUser.id === newUser.id)
          );
          
          if (newUniqueResults.length > 0) {
            allResults = [...allResults, ...newUniqueResults];
            setSuggestions(allResults.slice(0, MAX_RESULTS));
          }
        }
      }
      
      // Recherches supplémentaires si nécessaire
      if (allResults.length < MAX_RESULTS) {
        const fallbackTerms = ['a', 'e', 'i', 'o', 'u'];
        
        for (const term of fallbackTerms) {
          if (allResults.length >= MAX_RESULTS) break;
          
          const data = await userAutocompleteService.getSuggestions(term);
          
          if (Array.isArray(data) && data.length > 0) {
            const newUniqueResults = data.filter(newUser => 
              !allResults.some(existingUser => existingUser.id === newUser.id)
            );
            
            if (newUniqueResults.length > 0) {
              allResults = [...allResults, ...newUniqueResults];
              setSuggestions(allResults.slice(0, MAX_RESULTS));
            }
          }
        }
      }
      
      // Trier les résultats selon les priorités de rôle
      if (allResults.length > 0) {
        let rolePriority = [];
        
        if (hasRole(ROLES.RECRUITER)) {
          rolePriority = ['TEACHER', 'STUDENT'];
        } else if (hasRole(ROLES.TEACHER)) {
          rolePriority = ['STUDENT', 'HR'];
        } else if (hasRole(ROLES.STUDENT)) {
          rolePriority = ['TEACHER', 'STUDENT', 'RECRUITER'];
        } else if (hasRole(ROLES.HR)) {
          rolePriority = ['TEACHER', 'STUDENT', 'RECRUITER'];
        } else if (hasRole(ROLES.GUEST)) {
          rolePriority = ['RECRUITER'];
        }
        
        if (rolePriority.length > 0) {
          allResults.sort((a, b) => {
            const roleA = a.roles && a.roles.length > 0 ? a.roles[0].replace(/^ROLE_/i, '') : '';
            const roleB = b.roles && b.roles.length > 0 ? b.roles[0].replace(/^ROLE_/i, '') : '';
            
            const priorityA = rolePriority.indexOf(roleA);
            const priorityB = rolePriority.indexOf(roleB);
            
            if (priorityA !== -1 && priorityB !== -1) {
              return priorityA - priorityB;
            } else if (priorityA !== -1) {
              return -1;
            } else if (priorityB !== -1) {
              return 1;
            }
            return 0;
          });
          
          setSuggestions(allResults.slice(0, MAX_RESULTS));
        } else {
          setSuggestions(allResults.slice(0, MAX_RESULTS));
        }
      }
    } catch (error) {
      console.error('Error during sequential searches:', error);
    } finally {
      setIsLoading(false);
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Vérifier si c'est une recherche par rôle
    updateIsRoleSearch(value);

    // Réinitialiser la suggestion active
    setActiveSuggestion(-1);

    // Effacer le timeout existant
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Afficher le panneau de suggestions pour les rôles spéciaux
    if (hasSpecialRole() && !showSuggestions) {
      setShowSuggestions(true);
    }

    // Débouncer la recherche
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsRoleSearch(false);
  };

  return {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
    activeSuggestion,
    setActiveSuggestion,
    isRoleSearch,
    setIsRoleSearch,
    isLoading,
    hasSpecialRole,
    handleInputChange,
    clearSearch,
    fetchInitialSuggestions,
    updateIsRoleSearch
  };
}; 