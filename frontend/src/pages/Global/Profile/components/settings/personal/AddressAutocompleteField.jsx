import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Pencil, MapPin, Search, Loader2 } from 'lucide-react';
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
  isAdmin,
  handleCancelAddress
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
    
    // Exit edit mode immediately for better UX
    setEditMode(prev => ({
      ...prev,
      [field]: false
    }));
    
    // Call the save function in the background
    await onSaveAddress();
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
  
  // Sélection d'une adresse dans les suggestions
  const handleSelectAddress = (suggestion) => {
    // Mettre à jour les données d'adresse
    setEditedData(prev => ({
      ...prev,
      address: {
        name: suggestion.houseNumber ? `${suggestion.houseNumber} ${suggestion.street}` : suggestion.street,
        complement: '',
        postalCode: { code: suggestion.postcode },
        city: { name: suggestion.city }
      }
    }));
    
    // Réinitialiser la recherche
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  return (
    <div className={`
      rounded-lg transition-all duration-200 
      ${isEditing ? 'bg-white border-2 border-blue-200 shadow-sm' : 'bg-gray-50'} 
      ${!isEditing ? 'hover:bg-gray-100' : ''} 
      p-4 sm:p-5
    `}>
      <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
        <span>Adresse</span>
        {isAdmin && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFieldEdit}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </Label>
      <div className="mt-2">
        {isEditing ? (
          <div className="space-y-3">
            {/* Champ de recherche avec autocomplétion */}
            <div className="space-y-2">
              <Label htmlFor="address-search">Rechercher une adresse</Label>
              <div className="relative">
                <Input
                  id="address-search"
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.length >= 3 && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Commencez à taper une adresse..."
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                
                {/* Liste des suggestions - Positionnement absolu */}
                {showSuggestions && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-50 left-0 right-0 mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
                  >
                    <ul className="py-1">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleSelectAddress(suggestion)}
                        >
                          {suggestion.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Champs d'adresse */}
            <div className="space-y-2">
              <Label htmlFor="address-line">Ligne d'adresse *</Label>
              <Input
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-complement">Complément</Label>
              <Input
                id="address-complement"
                value={editedData.address?.complement || ''}
                onChange={(e) => setEditedData(prev => ({
                  ...prev,
                  address: { 
                    ...prev.address,
                    complement: e.target.value
                  }
                }))}
                placeholder="Complément d'adresse"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="address-postal">Code postal *</Label>
                <Input
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-city">Ville *</Label>
                <Input
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
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSaveAddressOptimistic}
                size="sm"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 min-w-[100px]"
              >
                Enregistrer
              </Button>
              <Button
                onClick={handleCancelAddress}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center min-w-0">
            <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="text-sm truncate flex-1 text-gray-900">
              {address ? formatAddress(address) : <span className="text-gray-500 italic">Aucune adresse renseignée</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 