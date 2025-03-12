import React, { useState } from 'react';
import userAutocompleteService from '../lib/services/autocompleteService';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    console.log('Input changed:', value);

    // Only fetch when query is 2 or more characters
    if (value.length < 2) {
      setSuggestions([]);
      console.log('Query too short. Cleared suggestions.');
      return;
    }

    userAutocompleteService.getSuggestions(value)
      .then((data) => {
        console.log('Fetched data:', data);
        if (Array.isArray(data)) {
          data.forEach((suggestion) => console.log('Suggestion:', suggestion));
          setSuggestions(data);
        } else {
          console.warn('Data is not an array. Clearing suggestions.');
          setSuggestions([]);
        }
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        setSuggestions([]);
      });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Rechercher un nom/prénom..."
        value={query}
        onChange={handleInputChange}
        list="autocomplete-results"
      />
      <datalist id="autocomplete-results">
        {suggestions.map((user, index) => (
          <option key={index} value={`${user.firstName} ${user.lastName}`} />
        ))}
      </datalist>
    </div>
  );
};
