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
  label,
  error,
  required = false,
  onAddressSelect,
  inputClassName,
  ...props
}, ref) => {
  // États
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
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
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await adresseApi.searchAddress(searchQuery);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      // console.error("Erreur lors de la recherche d'adresses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Effet pour déclencher la recherche lorsque la requête change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        searchAddresses(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 150);
    
    return () => clearTimeout(delayDebounceFn);
  }, [query, searchAddresses]);
  
  // Handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (query && query.length >= 3) {
      setShowSuggestions(true);
    }
  }, [query]);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Délai pour permettre la sélection d'une suggestion avant de fermer
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 100);
  }, []);
  
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Appeler le handler onChange du parent si fourni
    if (props.onChange) {
      props.onChange(e);
    }
  }, [props.onChange]);
  
  const handleSuggestionClick = useCallback((suggestion) => {
    // Mettre à jour la valeur du champ
    // Assurer l'encodage correct des adresses avec caractères accentués
    const formattedAddress = decodeURIComponent(encodeURIComponent(suggestion.label));
    setQuery(formattedAddress);
    setHasValue(true);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Extraire le code postal et la ville
    const postcode = suggestion.postcode || '';
    const city = suggestion.city || '';
    
    // Appeler le callback avec les détails de l'adresse sélectionnée
    if (onAddressSelect) {
      onAddressSelect({
        address: formattedAddress,
        houseNumber: suggestion.houseNumber,
        street: suggestion.street,
        postcode: postcode,
        city: decodeURIComponent(encodeURIComponent(city)),
        coordinates: suggestion.coordinates
      });
    }
    
    // Créer un événement synthétique pour simuler un changement de valeur
    const syntheticEvent = {
      target: {
        name: props.name,
        value: formattedAddress
      }
    };
    
    if (props.onChange) {
      props.onChange(syntheticEvent);
    }
  }, [onAddressSelect, props.onChange, props.name]);
  
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
  const isFloating = isFocused || hasValue;
  
  const containerClasses = cn(
    "relative border border-gray-300 rounded-md transition-all duration-200",
    isFloating ? "border-[#0062FF]" : "",
    error ? "border-red-500" : "",
    className
  );
  
  const labelClasses = cn(
    "absolute left-3 transition-all duration-200 pointer-events-none",
    isFloating 
      ? "transform -translate-y-1/2 top-0 text-xs bg-white px-1 z-10" 
      : "transform translate-y-0 top-1/2 -translate-y-1/2 text-gray-500",
    isFocused ? "text-[#0062FF]" : "text-gray-500",
    error ? "text-red-500" : ""
  );
  
  const inputClasses = cn(
    "block w-full h-11 px-3 pt-5 pb-5 text-base bg-transparent rounded-md appearance-none focus:outline-none",
    "transition-all duration-200",
    inputClassName
  );
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        className
      )}
    >
      <div className={containerClasses}>
        {/* Étiquette flottante */}
        <label 
          htmlFor={props.id} 
          className={labelClasses}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
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
      
      {/* Message d'erreur */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
      
      {/* Liste des suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto fade-in-up"
        >
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li 
                key={suggestion.id || index}
                className={cn(
                  "px-3 py-2 cursor-pointer flex items-start gap-2",
                  "hover:bg-gray-100 transition-colors duration-150",
                  selectedIndex === index ? "bg-gray-100" : ""
                )}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{suggestion.label}</span>
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