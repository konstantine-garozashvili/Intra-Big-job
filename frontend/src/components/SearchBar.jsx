import React, { useState, useRef, useEffect } from 'react';
import userAutocompleteService from '../lib/services/autocompleteService';
import { Search } from 'lucide-react';

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
    inputContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      color: 'rgba(255, 255, 255, 0.6)',
      width: '16px',
      height: '16px',
    },
    input: {
      width: '100%',
      padding: '10px 16px 10px 36px',
      fontSize: '14px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease',
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#528eb2',
      boxShadow: '0 2px 8px rgba(82, 142, 178, 0.2)',
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
    suggestionRole: {
      fontSize: '12px',
      color: '#666',
      marginLeft: '4px',
    },
    noResults: {
      backgroundColor: '#f5f5f5',
      borderRadius: '5px',
      padding: '12px 16px',
      textAlign: 'center',
      color: '#999',
    }
  };

  return (
    <div style={styles.container} ref={wrapperRef}>
      <div style={styles.inputContainer}>
        <Search style={styles.searchIcon} />
        <input
          style={{
            ...styles.input,
            ...(query.length >= 2 ? styles.inputFocus : {}),
          }}
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
        />
      </div>
      
      {showSuggestions && suggestions.length === 0 && (
        <div style={styles.suggestionsContainer}>
          <div style={styles.noResults}>
            Aucun utilisateur trouvé
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
                {user.firstName} {user.lastName}
                <span style={styles.suggestionRole}> - {user.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
