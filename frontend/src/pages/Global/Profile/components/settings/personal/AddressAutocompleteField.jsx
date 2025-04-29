import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Pencil, MapPin, Search, Loader2, Home, Mail, Landmark } from 'lucide-react';
import { formatAddress } from './utils';
import { adresseApi } from '@/lib/api';
import { toast } from 'sonner';

export const AddressAutocompleteField = ({ 
  userData, 
  editedData, 
  editMode, 
  setEditMode, 
  setEditedData, 
  onSaveAddress,
  handleCancelAddress,
  isEditable = true
}) => {
  const field = 'address';
  const isEditing = editMode[field];
  const address = userData.addresses && userData.addresses.length > 0 ? userData.addresses[0] : null;
  
  // État pour l'autocomplétion
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Références pour gérer le clic en dehors des suggestions
  const suggestionsRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Track if a suggestion was just selected
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  
  // Toggle edit mode for this field
  const toggleFieldEdit = () => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Handle save with optimistic update
  const handleSaveAddressOptimistic = async () => {
    // Validation des champs obligatoires
    if (!editedData.address?.name || !editedData.address?.postalCode?.code || !editedData.address?.city?.name) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      // Call the save function first and wait for it to complete
      await onSaveAddress();
      
      // Exit edit mode after successful save
      setEditMode(prev => ({
        ...prev,
        [field]: false
      }));
      
      // Réinitialiser la recherche
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      
    } catch (error) {
      // En cas d'erreur, on reste en mode édition
      toast.error("Une erreur est survenue lors de l'enregistrement de l'adresse");
      console.error("Erreur lors de l'enregistrement de l'adresse:", error);
    }
  };
  
  // Recherche d'adresses avec autocomplétion
  const searchAddresses = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await adresseApi.searchAddress(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error("Erreur lors de la recherche d'adresses:", error);
      toast.error("Erreur lors de la recherche d'adresses");
    } finally {
      setIsSearching(false);
    }
  };
  
  // Effet pour déclencher la recherche lorsque la requête change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchAddresses(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
  
  // Only show suggestions if user is typing and not after a selection
  useEffect(() => {
    if (searchQuery.length >= 3 && !selectedSuggestion) {
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, suggestions, selectedSuggestion]);
  
  // Effet pour gérer les clics en dehors des suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // When user types, clear selected suggestion
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedSuggestion(null);
  };
  
  // Sélection d'une adresse dans les suggestions
  const handleSelectAddress = (suggestion) => {
    setEditedData(prev => ({
      ...prev,
      address: {
        name: suggestion.houseNumber ? `${suggestion.houseNumber} ${suggestion.street}` : suggestion.street,
        complement: '',
        postalCode: { code: suggestion.postcode },
        city: { name: suggestion.city }
      }
    }));
    setSearchQuery(suggestion.label);
    setSelectedSuggestion(suggestion.label);
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  // Ajouter un état pour suivre si le champ est en cours d'édition
  const [fieldIsFocused, setFieldIsFocused] = useState(false);
  
  return (
    <div className={`address-edit-card ${isEditing ? '' : 'bg-gray-50'} ${!isEditing ? 'hover:bg-gray-100' : ''} mb-2 relative`}
      style={{ minHeight: isEditing ? 340 : undefined, paddingBottom: isEditing ? 0 : undefined }}
    >
      <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-semibold text-gray-700 p-0 m-0 leading-none flex items-center mb-1">
        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
        Votre adresse
      </label>
      {isEditable && !isEditing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFieldEdit}
          className="absolute top-4 right-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <div className="mt-2">
        {isEditing ? (
          <div className="space-y-6">
            {/* Champ de recherche avec autocomplétion */}
            <div className="mb-2">
              <div className="relative">
                <input
                  id="address-search"
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    setFieldIsFocused(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setFieldIsFocused(false), 200);
                  }}
                  placeholder="Rechercher une adresse..."
                  className="address-input w-full pl-10"
                  autoComplete="off"
                />
                <Search className="address-input-icon h-5 w-5" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
                )}
                {/* Liste des suggestions */}
                {showSuggestions && (
                  <div ref={suggestionsRef} className="address-suggestions">
                    <ul>
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="address-suggestion-item"
                          style={{ animationDelay: `${index * 40}ms` }}
                          onClick={() => handleSelectAddress(suggestion)}
                        >
                          <MapPin className="h-4 w-4 mt-1 text-blue-500 flex-shrink-0" />
                          <div>
                            <div className="address-suggestion-label">{suggestion.label}</div>
                            {suggestion.context && (
                              <div className="address-suggestion-context">{suggestion.context}</div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {searchQuery.length > 0 && searchQuery.length < 3 && (
                <div className="address-help mt-1">Veuillez saisir au moins 3 caractères pour la recherche</div>
              )}
            </div>
            {/* Champs d'adresse */}
            <div className="address-fields-grid">
              <div className="relative">
                <input
                  id="address-line"
                  value={editedData.address?.name || ''}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      name: e.target.value
                    }
                  }))}
                  placeholder="Ligne d'adresse"
                  className="address-input w-full pl-10"
                  required
                />
              </div>
              <div className="relative">
                <input
                  id="address-complement"
                  value={editedData.address?.complement || ''}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      complement: e.target.value
                    }
                  }))}
                  placeholder="Complément"
                  className="address-input w-full pl-10"
                />
                <Home className="address-input-icon h-5 w-5" />
              </div>
              <div className="relative">
                <input
                  id="address-postal"
                  value={editedData.address?.postalCode?.code || ''}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      postalCode: { code: e.target.value }
                    }
                  }))}
                  placeholder="Code postal"
                  className="address-input w-full pl-10"
                  required
                />
                <Mail className="address-input-icon h-5 w-5" />
              </div>
              <div className="relative">
                <input
                  id="address-city"
                  value={editedData.address?.city?.name || ''}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    address: {
                      ...prev.address,
                      city: { name: e.target.value }
                    }
                  }))}
                  placeholder="Ville"
                  className="address-input w-full pl-10"
                  required
                />
                <Landmark className="address-input-icon h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-6 justify-end mb-0">
              <button
                type="button"
                onClick={handleSaveAddressOptimistic}
                className="address-btn-primary"
              >
                <span>Enregistrer</span>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              </button>
              <button
                type="button"
                onClick={handleCancelAddress}
                className="address-btn-secondary"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                <span>Annuler</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center min-w-0">
          
            <span className="text-sm truncate flex-1 text-gray-900">
              {address ? formatAddress(address) : <span className="text-gray-500 italic">Aucune adresse renseignée</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 