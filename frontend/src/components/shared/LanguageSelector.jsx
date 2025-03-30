import React, { useState } from 'react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { useTranslationContext } from '../../context/TranslationContext';
import { Check, Globe } from 'lucide-react';

// Noms des langues dans leur langue native
const NATIVE_LANGUAGE_NAMES = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ar: 'العربية',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
};

// Emojis drapeaux des pays représentant les langues
const LANGUAGE_FLAGS = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹',
  ar: '🇸🇦',
  ru: '🇷🇺',
  zh: '🇨🇳',
  ja: '🇯🇵',
};

/**
 * Composant de sélection de langue
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.className - Classes CSS supplémentaires
 */
export function LanguageSelector({ className = '' }) {
  const [open, setOpen] = useState(false);
  const { currentLanguage, changeLanguage, availableLanguages } = useTranslationContext();
  
  // Traduire le libellé du bouton en fonction de la langue actuelle
  const getCurrentLanguageLabel = () => {
    const nativeName = NATIVE_LANGUAGE_NAMES[currentLanguage] || currentLanguage;
    const flag = LANGUAGE_FLAGS[currentLanguage] || '';
    return `${flag} ${nativeName}`;
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`px-3 flex items-center gap-2 ${className}`}
        >
          <Globe size={16} />
          <span className="hidden md:inline">{getCurrentLanguageLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          Changer de langue
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              changeLanguage(lang.code);
              setOpen(false);
            }}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>{LANGUAGE_FLAGS[lang.code]}</span>
              <span>{NATIVE_LANGUAGE_NAMES[lang.code] || lang.name}</span>
            </span>
            
            {currentLanguage === lang.code && (
              <Check size={16} className="text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 