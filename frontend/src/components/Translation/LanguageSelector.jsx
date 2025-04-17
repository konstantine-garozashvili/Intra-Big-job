import React from 'react';
import { useTranslation } from '../../contexts/TranslationContext';
import { Button } from '../ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' }
];

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useTranslation();

  return (
    <div className="language-selector-wrapper">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full w-10 h-10 p-0 bg-transparent text-gray-200 hover:bg-[#02284f]/80 hover:text-white"
          >
            <Globe className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px] z-[101]">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              className={`navbar-dropdown-item ${currentLanguage === language.code ? 'bg-[#528eb2]/10' : ''}`}
              onClick={() => changeLanguage(language.code)}
            >
              <span className="mr-2">{language.code.toUpperCase()}</span>
              {language.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
