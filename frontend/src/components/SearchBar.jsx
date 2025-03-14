import React, { useState, useRef, useEffect } from 'react';
import userAutocompleteService from '../lib/services/autocompleteService';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const wrapperRef = useRef(null);

  // Handle clicks outside the component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    }
  };

  // Inline styles for the component
  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      maxWidth: '500px',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      border: '1px solid #e0e0e0',
      color: 'black',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease',
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#4a90e2',
      boxShadow: '0 2px 8px rgba(74, 144, 226, 0.2)',
    },
    suggestionsContainer: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: '0',
      width: '100%',
      maxHeight: '300px',
      overflowY: 'auto',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '1000',
      border: '1px solid #e0e0e0',
    },
    suggestionItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease',
    },
    suggestionItemHoverOrActive: {
      backgroundColor: '#f5f9ff',
    },
    suggestionName: {
      fontSize: '15px',
      color: '#333',
    },
  };

  return (
    <div style={styles.container} ref={wrapperRef}>
      <input
        style={{
          ...styles.input,
          ...(query.length >= 2 ? styles.inputFocus : {}),
        }}
        type="text"
        placeholder="Rechercher un nom/prénom..."
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 2 && setShowSuggestions(true)}
      />
      {showSuggestions && suggestions.length == 0 && (
        <div style={styles.suggestionsContainer}>
          <div
            style={{
              ...styles.suggestionItem,
              backgroundColor: '#f5f5f5',
              borderRadius: '5px',
              padding: '12px 16px',
              textAlign: 'center',
              color: '#999',
            }}
          >
          Aucun utilisateur trouver
        </div>
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div style={styles.suggestionsContainer}>
          {suggestions.map((user, index) => (
            <div
              key={index}
              style={{
                ...styles.suggestionItem,
                ...(index === activeSuggestion ? styles.suggestionItemHoverOrActive : {}),
              }}
              onClick={() => handleSuggestionClick(user)}
              onMouseEnter={() => setActiveSuggestion(index)}
            >
              <div style={styles.suggestionName}>
                {user.firstName} {user.lastName}          - {user.role}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
