import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import userAutocompleteService from '../lib/services/autocompleteService';
import authService from '../lib/services/authService';
import { useRoles, ROLES } from '../features/roles/roleContext';
import { getPrimaryRole, matchRoleFromSearchTerm, ROLE_ALIASES } from '../lib/utils/roleUtils';
import { getRoleDisplayFormat } from '../lib/utils/roleDisplay.jsx';
import { Search, User, X, UserCircle2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useSearchRoles } from '../lib/hooks/useSearchRoles';
import { useSearchSuggestions } from '../lib/hooks/useSearchSuggestions';
import { SearchSuggestionsList } from './SearchSuggestionsList';

export const SearchBar = () => {
  // Références et state
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Custom hooks
  const { 
    allowedSearchRoles,
    isLoggedIn,
    isRoleSearch,
    setIsRoleSearch,
    checkForRoleSearch,
    hasRole,
    hasAnyRole
  } = useSearchRoles();

  const {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
    activeSuggestion,
    setActiveSuggestion,
    isLoading,
    hasSpecialRole,
    handleInputChange,
    clearSearch,
    fetchInitialSuggestions,
    updateIsRoleSearch
  } = useSearchSuggestions({ 
    isLoggedIn, 
    hasRole, 
    hasAnyRole, 
    checkForRoleSearch 
  });

  // Mettre à jour la largeur du conteneur au montage et au redimensionnement
  useEffect(() => {
    const updateWidth = () => {
      if (wrapperRef.current) {
        setContainerWidth(wrapperRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [showSuggestions]);

  // Gérer les clics en dehors du composant pour fermer les suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current && 
        !wrapperRef.current.contains(event.target) &&
        !event.target.closest('.search-dropdown-portal')
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [setShowSuggestions]);

  // Faire défiler la suggestion active dans la vue
  useEffect(() => {
    if (activeSuggestion >= 0 && suggestionsRef.current) {
      const activeElement = suggestionsRef.current.children[activeSuggestion];
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeSuggestion]);

  // Mettre à jour la position du dropdown quand il devient visible
  useEffect(() => {
    if (showSuggestions && wrapperRef.current) {
      const updatePosition = () => {
        const rect = wrapperRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      };
      
      updatePosition();
      
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showSuggestions]);

  // Gérer la navigation vers le profil utilisateur sélectionné
  const handleSuggestionClick = (suggestion, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const userId = suggestion.id;
    if (!userId) {
      console.error('No user ID found in suggestion:', suggestion);
      return;
    }
    
    setQuery(`${suggestion.firstName} ${suggestion.lastName}`);
    setSuggestions([]);
    setShowSuggestions(false);
    
    try {
      setTimeout(() => {
        navigate(`/profile/${userId}`);
      }, 10);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = `/profile/${userId}`;
    }
  };

  // Gérer les événements clavier
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
      if (suggestions[activeSuggestion]) {
        handleSuggestionClick(suggestions[activeSuggestion]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current.blur();
    }
  };

  // Gérer le focus de l'input
  const handleInputFocus = () => {
    if (!isLoggedIn) {
      inputRef.current.blur();
      return;
    }
    
    setIsFocused(true);
    
    if (hasSpecialRole()) {
      fetchInitialSuggestions();
    } 
    else if (query.length >= 1) {
      fetchSuggestions(query);
    }
  };

  return (
    <div 
      ref={wrapperRef}
      className="relative w-full max-w-md font-sans"
      style={{ isolation: 'isolate', position: 'relative', zIndex: 90 }}
    >
      <div className={cn(
        "relative flex items-center transition-all duration-300 rounded-full overflow-hidden",
        "w-full",
        isFocused ? "ring-2 ring-[#528eb2]/50 dark:ring-[#78b9dd]/50" : "",
        isRoleSearch ? "ring-2 ring-purple-500/50 dark:ring-purple-400/50" : "",
        !isLoggedIn ? "opacity-50" : ""
      )}>
        <div className="absolute left-3 text-white/60 dark:text-white/80 z-10">
          {isRoleSearch ? (
            <Briefcase className="w-4 h-4 text-purple-400 dark:text-purple-300" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        
        <input
          ref={inputRef}
          className={cn(
            "w-full py-2 pl-10 pr-10 text-sm text-white bg-[#02284f]/80 border border-white/20",
            "dark:bg-gray-800 dark:border-gray-600 dark:text-white",
            "rounded-full transition-all duration-300",
            "placeholder:text-white/50 dark:placeholder:text-white/70 focus:outline-none",
            "md:placeholder:text-sm placeholder:text-xs",
            isFocused ? "bg-[#02284f]/90 dark:bg-gray-700 border-[#528eb2] dark:border-[#78b9dd]" : "hover:bg-[#02284f]/90 dark:hover:bg-gray-700",
            isRoleSearch ? "border-purple-500/30 dark:border-purple-400/30" : ""
          )}
          type="text"
          placeholder={isLoggedIn ? "Rechercher par nom ou rôle..." : "Connectez-vous pour effectuer une recherche"}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          disabled={!isLoggedIn}
        />
        
        <AnimatePresence mode="wait">
          {query.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                clearSearch();
                inputRef.current.focus();
              }}
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
      
      {/* Message d'aide (affiché uniquement quand focusé, query vide et PAS un rôle spécial) */}
      {isFocused && query.length === 0 && isLoggedIn && 
       !hasSpecialRole() &&
       !showSuggestions && (
        <div className="absolute top-full left-0 w-full mt-2 px-3 py-2 text-xs text-white/70 bg-[#02284f]/90 rounded-md dark:bg-gray-800 dark:text-gray-200">
          <p>
            {allowedSearchRoles.length > 0 ? (
              allowedSearchRoles.length === 1 ? (
                <>Vous pouvez rechercher des <strong className="dark:text-white">{getRoleDisplayFormat(allowedSearchRoles[0]).toLowerCase()}</strong> par nom</>
              ) : (
                <>Vous pouvez rechercher par nom ou par rôle (<span className="dark:text-white">{allowedSearchRoles.map(role => getRoleDisplayFormat(role).toLowerCase()).join(', ')}</span>)</>
              )
            ) : (
              <>Vous pouvez rechercher par nom</>
            )}
          </p>
        </div>
      )}
      
      {/* Message d'aide pour les utilisateurs non connectés */}
      {!isLoggedIn && isFocused && (
        <div className="absolute top-full left-0 w-full mt-2 px-3 py-2 text-xs text-white/70 bg-[#02284f]/90 rounded-md dark:bg-gray-800 dark:text-gray-200">
          <p>Vous devez être connecté pour effectuer une recherche.</p>
        </div>
      )}
      
      {/* Render dropdown portal */}
      {showSuggestions && createPortal(
        <AnimatePresence mode="wait">
          <SearchSuggestionsList
            suggestions={suggestions}
            isRoleSearch={isRoleSearch}
            activeSuggestion={activeSuggestion}
            setActiveSuggestion={setActiveSuggestion}
            handleSuggestionClick={handleSuggestionClick}
            allowedSearchRoles={allowedSearchRoles}
            hasRole={hasRole}
            hasAnyRole={hasAnyRole}
            suggestionsRef={suggestionsRef}
            query={query}
            containerWidth={containerWidth}
            dropdownPosition={dropdownPosition}
            handleKeyDown={handleKeyDown}
          />
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
