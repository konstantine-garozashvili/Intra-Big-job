import React, { useState, useRef, useEffect } from 'react';
import userAutocompleteService from '../lib/services/autocompleteService';
import authService from '../lib/services/authService';
import { useRoles, ROLES } from '../features/roles/roleContext';
import { getPrimaryRole, matchRoleFromSearchTerm, getFrenchRoleDisplayName, ROLE_ALIASES } from '../lib/utils/roleUtils';
import { Search, User, X, UserCircle2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

// Convert role constants to display format for allowed search roles
const getRoleDisplayFormat = (roleConstant) => {
  // Normaliser le rôle en retirant le préfixe ROLE_ s'il existe
  const normalizedRole = roleConstant.replace(/^ROLE_/i, '');
  
  switch (normalizedRole.toUpperCase()) {
    case 'ADMIN': return 'Admin';
    case 'SUPER_ADMIN': 
    case 'SUPERADMIN': return 'Super Admin';
    case 'TEACHER': return 'Formateur';
    case 'STUDENT': return 'Étudiant';
    case 'RECRUITER': return 'Recruteur';
    case 'HR': return 'Ressources Humaines';
    case 'GUEST': return 'Invité';
    default: return roleConstant;
  }
};

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isRoleSearch, setIsRoleSearch] = useState(false);
  const [allowedSearchRoles, setAllowedSearchRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { roles: userRoles, hasRole, hasAnyRole } = useRoles();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const loggedIn = authService.isLoggedIn();
    setIsLoggedIn(loggedIn);
  }, []);

  // Determine allowed search roles based on user roles
  useEffect(() => {
    let searchableRoles = [];
    
    // Check if user is logged in
    if (isLoggedIn) {
      // SuperAdmin a accès à tous les rôles (avec les deux variantes)
      if (hasRole(ROLES.SUPERADMIN)) {
        searchableRoles = ['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'TEACHER', 'STUDENT', 'RECRUITER', 'HR', 'GUEST'];
      }
      // Admin et autres rôles peuvent rechercher la plupart des rôles
      else if (hasAnyRole([ROLES.ADMIN, ROLES.TEACHER, ROLES.HR, ROLES.RECRUITER])) {
        searchableRoles = ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT', 'RECRUITER', 'HR', 'GUEST'];
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

  // Handle clicks outside the component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll active suggestion into view
  useEffect(() => {
    if (activeSuggestion >= 0 && suggestionsRef.current) {
      const activeElement = suggestionsRef.current.children[activeSuggestion];
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeSuggestion]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const checkForRoleSearch = (value) => {
    // Use the centralized function to check for role matches
    const matchResult = matchRoleFromSearchTerm(value, allowedSearchRoles);
    
    if (matchResult) {
      return true;
    }
    
    return false;
  };

  const fetchSuggestions = (value) => {
    // Ne pas effectuer de recherche si l'utilisateur n'est pas connecté
    if (!isLoggedIn) {
      return;
    }
    
    // Only fetch when query is 1 or more characters
    if (value.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    userAutocompleteService.getSuggestions(value)
      .then((data) => {
        if (Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Check if this is a role-based search
    const isRoleBasedSearch = checkForRoleSearch(value);
    setIsRoleSearch(isRoleBasedSearch);

    // Reset active suggestion when input changes
    setActiveSuggestion(-1);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search to avoid too many requests
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(`${suggestion.firstName} ${suggestion.lastName}`);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Rediriger vers la page de profil de l'utilisateur sélectionné
    console.log(`Navigating to profile of user with ID: ${suggestion.id}`);
    navigate(`/profile/${suggestion.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prevActive) =>
        prevActive < suggestions.length - 1 ? prevActive + 1 : prevActive
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prevActive) =>
        prevActive > 0 ? prevActive - 1 : prevActive
      );
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current.focus();
  };

  // Get role icon based on user role
  const getRoleIcon = (role) => {
    // Normalize role name (remove ROLE_ prefix if present)
    const normalizedRole = role?.toLowerCase().replace('role_', '');
    
    switch (normalizedRole) {
      case 'admin':
      case 'super_admin':
        return <Briefcase className="w-3 h-3 mr-1 text-blue-600" />;
      case 'teacher':
        return <Briefcase className="w-3 h-3 mr-1 text-green-600" />;
      case 'student':
        return <UserCircle2 className="w-3 h-3 mr-1 text-amber-600" />;
      case 'hr':
        return <Briefcase className="w-3 h-3 mr-1 text-purple-600" />;
      case 'recruiter':
        return <Briefcase className="w-3 h-3 mr-1 text-indigo-600" />;
      default:
        return <UserCircle2 className="w-3 h-3 mr-1 text-gray-600" />;
    }
  };

  // Get role color based on user role
  const getRoleColor = (role) => {
    // Normalize role name (remove ROLE_ prefix if present)
    const normalizedRole = role?.toLowerCase().replace('role_', '');
    
    switch (normalizedRole) {
      case 'admin':
        return 'bg-blue-50 text-blue-700';
      case 'super_admin':
      case 'superadmin':
        return 'bg-red-50 text-red-700';
      case 'teacher':
        return 'bg-green-50 text-green-700';
      case 'student':
        return 'bg-amber-50 text-amber-700';
      case 'hr':
        return 'bg-purple-50 text-purple-700';
      case 'recruiter':
        return 'bg-indigo-50 text-indigo-700';
      case 'guest':
        return 'bg-gray-50 text-gray-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  // Get display name for role using the centralized function
  const getRoleDisplayName = (role) => {
    return getFrenchRoleDisplayName(role);
  };

  return (
    <div 
      ref={wrapperRef}
      className="relative w-full max-w-md font-sans"
    >
      <div className={cn(
        "relative flex items-center transition-all duration-300 rounded-full overflow-hidden",
        "w-full",
        isFocused ? "ring-2 ring-[#528eb2]/50" : "",
        isRoleSearch ? "ring-2 ring-purple-500/50" : "",
        !isLoggedIn ? "opacity-50" : ""
      )}>
        <div className="absolute left-3 text-white/60 z-10">
          {isRoleSearch ? (
            <Briefcase className="w-4 h-4 text-purple-400" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        
        <input
          ref={inputRef}
          className={cn(
            "w-full py-2 pl-10 pr-10 text-sm text-white bg-[#02284f]/80 border border-white/20",
            "rounded-full transition-all duration-300",
            "placeholder:text-white/50 focus:outline-none",
            "md:placeholder:text-sm placeholder:text-xs",
            isFocused ? "bg-[#02284f]/90 border-[#528eb2]" : "hover:bg-[#02284f]/90",
            isRoleSearch ? "border-purple-500/30" : ""
          )}
          type="text"
          placeholder={isLoggedIn ? "Rechercher par nom ou rôle..." : "Connectez-vous pour effectuer une recherche"}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!isLoggedIn) {
              inputRef.current.blur();
              return;
            }
            setIsFocused(true);
            if (query.length >= 1) {
              fetchSuggestions(query);
            }
          }}
          disabled={!isLoggedIn}
        />
        
        <AnimatePresence>
          {query.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearSearch}
              className="absolute right-3 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-3 h-3" />
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-10 z-10">
            <div className="w-3 h-3 border-2 border-t-transparent border-white/30 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {isFocused && query.length === 0 && isLoggedIn && (
        <div className="absolute top-full left-0 w-full mt-2 px-3 py-2 text-xs text-white/70 bg-[#02284f]/90 rounded-md">
          <p>
            {hasRole(ROLES.SUPERADMIN) ? (
              <>En tant que Super Admin, vous pouvez rechercher tous les utilisateurs par nom ou par rôle : {allowedSearchRoles.map(role => 
                role !== 'SUPERADMIN' ? getRoleDisplayFormat(role).toLowerCase() : null
              ).filter(Boolean).join(', ')}</>
            ) : allowedSearchRoles.length > 0 ? (
              allowedSearchRoles.length === 1 ? (
                <>Vous pouvez rechercher des <strong>{getRoleDisplayFormat(allowedSearchRoles[0]).toLowerCase()}</strong> par nom</>
              ) : (
                <>Vous pouvez rechercher par nom ou par rôle ({allowedSearchRoles.map(role => getRoleDisplayFormat(role).toLowerCase()).join(', ')})</>
              )
            ) : (
              <>Vous pouvez rechercher par nom</>
            )}
          </p>
        </div>
      )}
      
      {!isLoggedIn && isFocused && (
        <div className="absolute top-full left-0 w-full mt-2 px-3 py-2 text-xs text-white/70 bg-[#02284f]/90 rounded-md">
          <p>Vous devez être connecté pour effectuer une recherche.</p>
        </div>
      )}
      
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "absolute top-full left-0 w-full mt-2 overflow-hidden bg-white rounded-xl shadow-xl border border-gray-100 z-50",
              "max-h-[60vh] md:max-h-[70vh]"
            )}
            style={{ 
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            }}
          >
            {suggestions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="p-6 text-center"
              >
                <div className="flex flex-col items-center justify-center">
                  {isRoleSearch ? (
                    <>
                      <Briefcase className="w-10 h-10 text-purple-300 mb-2" />
                      <p className="text-gray-500 font-medium">Aucun utilisateur trouvé avec ce rôle</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {allowedSearchRoles.length > 0 ? (
                          allowedSearchRoles.length === 1 ? (
                            <>Vous pouvez uniquement rechercher des <strong>{getRoleDisplayFormat(allowedSearchRoles[0]).toLowerCase()}</strong></>
                          ) : (
                            <>Essayez avec un autre rôle : {allowedSearchRoles.map(role => getRoleDisplayFormat(role).toLowerCase()).join(', ')}</>
                          )
                        ) : (
                          <>Essayez avec un autre terme de recherche</>
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <Search className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {allowedSearchRoles.length > 0 ? (
                          allowedSearchRoles.length === 1 ? (
                            <>Essayez avec un autre terme ou recherchez par le rôle <strong>{getRoleDisplayFormat(allowedSearchRoles[0]).toLowerCase()}</strong></>
                          ) : (
                            <>Essayez avec un autre terme ou recherchez par rôle : {allowedSearchRoles.map(role => getRoleDisplayFormat(role).toLowerCase()).join(', ')}</>
                          )
                        ) : (
                          <>Essayez avec un autre terme de recherche</>
                        )}
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500">
                    {suggestions.length} résultat{suggestions.length > 1 ? 's' : ''} trouvé{suggestions.length > 1 ? 's' : ''}
                    {isRoleSearch && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        <Briefcase className="w-3 h-3 mr-1" />
                        Recherche par rôle
                      </span>
                    )}
                  </p>
                </div>
                <div 
                  ref={suggestionsRef}
                  className="max-h-[300px] overflow-y-auto py-1 divide-y divide-gray-50"
                >
                  {suggestions.map((user, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        backgroundColor: index === activeSuggestion ? "rgba(82, 142, 178, 0.08)" : "transparent" 
                      }}
                      transition={{ 
                        duration: 0.2,
                        delay: index * 0.03
                      }}
                      whileHover={{ backgroundColor: "rgba(82, 142, 178, 0.08)" }}
                      onClick={() => handleSuggestionClick(user)}
                      onMouseEnter={() => setActiveSuggestion(index)}
                      className={cn(
                        "flex items-center px-4 py-3 cursor-pointer transition-all",
                        index === activeSuggestion ? "bg-[rgba(82,142,178,0.08)]" : ""
                      )}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#02284f] to-[#528eb2] flex items-center justify-center mr-3 shadow-sm">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="flex items-center mt-1">
                          {user.roles && user.roles.length > 0 ? (
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              getRoleColor(user.roles[0])
                            )}>
                              {getRoleIcon(user.roles[0])}
                              {getRoleDisplayName(user.roles[0])}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
                              <UserCircle2 className="w-3 h-3 mr-1 text-gray-600" />
                              Utilisateur
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: index === activeSuggestion ? 1 : 0, x: index === activeSuggestion ? 0 : -10 }}
                        className="ml-2 text-[#528eb2]"
                      >
                        <Search className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
