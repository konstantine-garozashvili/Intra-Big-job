import React, { useState } from 'react';
import { useTranslationContext } from '../../context/TranslationContext';
import { T } from '../../context/TranslationContext';
import Translation from './Translation';
import LanguageSelector from './LanguageSelector';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

/**
 * Composant d'exemple pour démontrer l'utilisation du système de traduction
 */
const TranslationExample = () => {
  const { translateText, translateBatch, currentLanguage } = useTranslationContext();
  const [inputText, setInputText] = useState('Entrez du texte à traduire ici...');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Textes d'exemple pour démontrer différentes méthodes de traduction
  const staticTexts = [
    'Bienvenue sur notre plateforme de traduction !',
    'Vous pouvez traduire du texte en temps réel.',
    'Choisissez votre langue préférée dans le sélecteur.'
  ];

  // Fonction pour traduire le texte saisi
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    try {
      // Pour l'exemple, nous traduisons en anglais si la langue actuelle est français,
      // sinon nous traduisons en français
      const targetLang = currentLanguage === 'fr' ? 'en' : 'fr';
      const result = await translateText(inputText, targetLang);
      setOutputText(result);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              <T text="Démo de traduction" />
            </CardTitle>
            <CardDescription>
              <T text="Testez les différentes méthodes de traduction disponibles" />
            </CardDescription>
          </div>
          <LanguageSelector />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Exemple 1: Utilisation du composant Translation */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            <T text="Méthode 1: Composant Translation" />
          </h3>
          <div className="p-4 bg-gray-50 rounded-md">
            {staticTexts.map((text, index) => (
              <p key={index} className="mb-2">
                <Translation 
                  text={text}
                  fallback={<span className="opacity-50">Traduction en cours...</span>}
                />
              </p>
            ))}
          </div>
        </div>
        
        {/* Exemple 2: Utilisation du composant T (HOC) */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            <T text="Méthode 2: Composant T (HOC)" />
          </h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <p><T text="Ceci est un exemple de texte traduit avec le composant T." /></p>
            <p><T text="Ce composant est plus simple mais moins configurable que le composant Translation." /></p>
          </div>
        </div>
        
        {/* Exemple 3: Traduction manuelle */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            <T text="Méthode 3: Traduction manuelle" />
          </h3>
          <div className="space-y-2">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Entrez du texte à traduire..."
              rows={3}
            />
            <Button 
              onClick={handleTranslate} 
              disabled={isTranslating || !inputText.trim()}
              className="w-full"
            >
              {isTranslating 
                ? <T text="Traduction en cours..." />
                : <T text="Traduire" />
              }
            </Button>
            {outputText && (
              <div className="p-4 bg-gray-50 rounded-md mt-2">
                <p>{outputText}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          <T text="Langue actuelle:" /> {currentLanguage.toUpperCase()}
        </p>
        <p className="text-sm text-gray-500">
          <T text="Alimenté par Google Translate API" />
        </p>
      </CardFooter>
    </Card>
  );
};

export default TranslationExample; 