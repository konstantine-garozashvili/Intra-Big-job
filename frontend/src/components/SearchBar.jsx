import React, { useState, useRef, useEffect } from 'react';
import userAutocompleteService from '../lib/services/autocompleteService';
import { Search, User, X, UserCircle2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Reset active suggestion when input changes
    setActiveSuggestion(-1);

    // Only fetch when query is 2 or more characters
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    userAutocompleteService.getSuggestions(value)
      .then((data) => {
        if (Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      })
      .catch(() => {
        setSuggestions([]);
        setShowSuggestions(false);
      });
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(`${suggestion.firstName} ${suggestion.lastName}`);
    setSuggestions([]);
    setShowSuggestions(false);
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
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
      case 'super admin':
      case 'superadmin':
        return <Briefcase className="w-3 h-3 mr-1 text-blue-600" />;
      case 'teacher':
      case 'professor':
      case 'enseignant':
        return <Briefcase className="w-3 h-3 mr-1 text-green-600" />;
      case 'student':
      case 'étudiant':
        return <UserCircle2 className="w-3 h-3 mr-1 text-amber-600" />;
      default:
        return <UserCircle2 className="w-3 h-3 mr-1 text-gray-600" />;
    }
  };

  // Get role color based on user role
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
      case 'super admin':
      case 'superadmin':
        return 'bg-blue-50 text-blue-700';
      case 'teacher':
      case 'professor':
      case 'enseignant':
        return 'bg-green-50 text-green-700';
      case 'student':
      case 'étudiant':
        return 'bg-amber-50 text-amber-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div 
      ref={wrapperRef}
      className="relative w-full max-w-md font-sans"
    >
      <div className={cn(
        "relative flex items-center transition-all duration-300 rounded-full overflow-hidden",
        isFocused ? "ring-2 ring-[#528eb2]/50" : ""
      )}>
        <div className="absolute left-3 text-white/60 z-10">
          <Search className="w-4 h-4" />
        </div>
        
        <input
          ref={inputRef}
          className={cn(
            "w-full py-2 pl-10 pr-10 text-sm text-white bg-[#02284f]/80 border border-white/20",
            "rounded-full transition-all duration-300",
            "placeholder:text-white/50 focus:outline-none",
            isFocused ? "bg-[#02284f]/90 border-[#528eb2]" : "hover:bg-[#02284f]/90"
          )}
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (query.length >= 2) setShowSuggestions(true);
          }}
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
      </div>
      
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-full left-0 w-full mt-2 overflow-hidden bg-white rounded-xl shadow-xl border border-gray-100 z-50"
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
                  <Search className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
                  <p className="text-gray-400 text-sm mt-1">Essayez avec un autre terme de recherche</p>
                </div>
              </motion.div>
            ) : (
              <div className="overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500">
                    {suggestions.length} résultat{suggestions.length > 1 ? 's' : ''} trouvé{suggestions.length > 1 ? 's' : ''}
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
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            getRoleColor(user.role)
                          )}>
                            {getRoleIcon(user.role)}
                            {user.role}
                          </span>
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
