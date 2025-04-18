import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { adresseApi } from "@/lib/api";
import { MapPin, Loader2 } from "lucide-react";

/**
 * Composant d'autocomplétion d'adresses utilisant l'API Adresse du gouvernement français
 */
export const AddressAutocomplete = React.forwardRef(({
  className,
  error,
  required = false,
  onValueChange,
  onAddressSelect,
  inputClassName,
  ...props
}, ref) => {
  // États
  const [hasValue, setHasValue] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [helpText, setHelpText] = useState("");
  
  // Références
  const containerRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Effet pour détecter les clics en dehors du composant
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Effet pour vérifier si le champ a une valeur
  useEffect(() => {
    setHasValue(props.value !== undefined && props.value !== "");
    setQuery(props.value || "");
  }, [props.value]);
  
  // Fonction pour rechercher des adresses
  const searchAddresses = useCallback(async (searchQuery) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await adresseApi.searchAddress(searchQuery);
      
      if (results && results.length > 0) {
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Effet pour déclencher la recherche lorsque la requête change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Validation améliorée des entrées
      const trimmedQuery = query?.trim();
      
      // Ne pas rechercher si:
      // 1. La requête est vide ou trop courte
      // 2. La requête contient seulement des chiffres et est courte (code postal partiel)
      // 3. La requête est un seul mot court
      const isValidQuery = 
        trimmedQuery && 
        trimmedQuery.length >= 3 && 
        !(/^\d+$/.test(trimmedQuery) && trimmedQuery.length < 5) &&
        !(trimmedQuery.split(/\s+/).length === 1 && trimmedQuery.length < 4);
      
      // Afficher des messages d'aide contextuels
      if (trimmedQuery && trimmedQuery.length < 3) {
        setHelpText("Veuillez saisir au moins 3 caractères");
      } else if (/^\d+$/.test(trimmedQuery) && trimmedQuery.length < 5) {
        setHelpText("Pour un code postal, saisissez les 5 chiffres");
      } else if (trimmedQuery && trimmedQuery.length < 4) {
        setHelpText("Veuillez préciser votre recherche");
      } else {
        setHelpText("");
      }
      
      if (isValidQuery) {
        searchAddresses(trimmedQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [query, searchAddresses]);
  
  // Handlers
  const handleFocus = useCallback(() => {
    if (query && query.length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [query, suggestions.length]);
  
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  }, []);
  
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (onValueChange) {
      onValueChange(value);
    }
  }, [onValueChange]);
  
  const handleSuggestionClick = useCallback((suggestion) => {
    const formattedAddress = suggestion.label;
    setQuery(formattedAddress);
    setHasValue(true);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    if (onAddressSelect) {
      onAddressSelect({
        address: formattedAddress,
        houseNumber: suggestion.houseNumber,
        street: suggestion.street,
        postcode: suggestion.postcode,
        city: suggestion.city,
        coordinates: suggestion.coordinates
      });
    }
    
    if (onValueChange) {
      onValueChange(formattedAddress);
    }
  }, [onAddressSelect, onValueChange, props.name]);
  
  // Gestion des touches du clavier pour la navigation dans les suggestions
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions) return;
    
    // Flèche bas
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    }
    // Flèche haut
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    }
    // Entrée
    else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    }
    // Échap
    else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSuggestionClick]);
  
  // Classes
  const containerClasses = cn(
    "relative border border-gray-300 rounded-md transition-all duration-200",
    error ? "border-red-500" : "",
    className
  );

  const inputClasses = cn(
    "block w-full h-11 px-3 py-2 text-base bg-transparent rounded-md appearance-none focus:outline-none text-white",
    "transition-all duration-200",
    inputClassName
  );

  return (
    <div className="relative">
      <div className={containerClasses}>
        {/* Champ de saisie */}
        <input
          type="text"
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          value={query}
          ref={ref}
          autoComplete="off"
          {...props}
        />
        
        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
      
      {/* Message d'erreur ou d'aide */}
      {error ? (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      ) : helpText ? (
        <p className="text-gray-500 text-xs mt-1">{helpText}</p>
      ) : null}
      
      {/* Liste des suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto fade-in-up border border-gray-700"
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li 
                key={suggestion.id || index}
                className={cn(
                  "px-3 py-2 cursor-pointer flex items-start gap-2",
                  "hover:bg-gray-700 transition-colors duration-150 text-white",
                  selectedIndex === index ? "bg-gray-700" : ""
                )}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium text-gray-200">{suggestion.label}</span>
                  <span className="text-xs text-gray-500">{suggestion.context}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

AddressAutocomplete.displayName = "AddressAutocomplete"; 