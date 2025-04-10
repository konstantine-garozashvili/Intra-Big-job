import React, { useState, useEffect } from 'react';
import { translationService } from './TranslationService';
import { toast } from 'sonner';

const initialLanguages = [
  { language: 'fr', name: 'Français' },
  { language: 'en', name: 'English' },
  { language: 'es', name: 'Español' },
  { language: 'de', name: 'Deutsch' },
  { language: 'it', name: 'Italiano' }
];

const TranslationTest = () => {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [detectedLang, setDetectedLang] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState(initialLanguages);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [error, setError] = useState(null);
  
  // Vérifier si la clé API est définie
  const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  const isValidApiKey = apiKey && apiKey !== 'YOUR_ACTUAL_API_KEY';

  useEffect(() => {
    // Load available languages
    const fetchLanguages = async () => {
      if (!isValidApiKey) {
        console.warn('Clé API Google Translate non configurée. Utilisation des langues par défaut.');
        return;
      }
      
      try {
        setLoadingLanguages(true);
        setError(null);
        const availableLanguages = await translationService.getAvailableLanguages('fr');
        if (availableLanguages && availableLanguages.length > 0) {
          setLanguages(availableLanguages);
          toast.success('Langues chargées avec succès');
        }
      } catch (err) {
        console.error('Error loading languages:', err);
        setError(`Erreur de configuration: ${err.message}`);
        toast.error('Erreur de chargement des langues: ' + (err.message || 'Une erreur est survenue'));
        // Fall back to initial languages
      } finally {
        setLoadingLanguages(false);
      }
    };

    fetchLanguages();
  }, [isValidApiKey]);

  const handleDetectLanguage = async () => {
    if (!isValidApiKey) {
      toast.error('Veuillez configurer une clé API Google Translate valide dans le fichier .env');
      return;
    }
    
    if (!inputText) {
      toast.error('Veuillez entrer un texte pour détecter la langue');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const detected = await translationService.detectLanguage(inputText);
      setDetectedLang(detected);
      
      // Find language name
      const langName = languages.find(l => l.language === detected)?.name || detected;
      toast.success(`Langue détectée: ${langName}`);
    } catch (err) {
      console.error('Detection error:', err);
      setError(`Erreur de détection: ${err.message}`);
      toast.error('Erreur de détection: ' + (err.message || 'Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!isValidApiKey) {
      toast.error('Veuillez configurer une clé API Google Translate valide dans le fichier .env');
      return;
    }
    
    if (!inputText) {
      toast.error('Veuillez entrer un texte à traduire');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await translationService.translateText(inputText, targetLang, detectedLang || null);
      setTranslatedText(result);
      toast.success('Traduction réussie');
    } catch (err) {
      console.error('Translation error:', err);
      setError(`Erreur de traduction: ${err.message}`);
      toast.error('Erreur de traduction: ' + (err.message || 'Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Test de Traduction Google Cloud</h1>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <h2 className="text-lg font-semibold text-red-700 mb-2">⚠️ Erreur</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {!isValidApiKey && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
          <h2 className="text-lg font-semibold text-yellow-700 mb-2">⚠️ Configuration requise</h2>
          <p className="text-yellow-700 mb-2">
            Pour utiliser cette fonctionnalité, vous devez configurer une clé API Google Translate valide.
          </p>
          <ol className="list-decimal pl-5 text-yellow-700 space-y-1">
            <li>Créez une clé API dans la console Google Cloud</li>
            <li>Activez l'API Cloud Translation</li>
            <li>Dans les restrictions de la clé API, ajoutez l'URL de votre site sous "Référents HTTP"</li>
            <li>Ajoutez votre clé API dans le fichier <code className="bg-yellow-100 px-1 rounded">.env</code> :</li>
          </ol>
          <pre className="bg-yellow-100 p-2 rounded mt-2 text-sm text-yellow-800">
            VITE_GOOGLE_TRANSLATE_API_KEY=votre_clé_api_google
          </pre>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Texte à traduire:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows="4"
            placeholder="Entrez votre texte ici..."
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDetectLanguage}
            disabled={loading || !inputText || !isValidApiKey}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
          >
            Détecter la langue
          </button>
          
          {detectedLang && (
            <div className="flex items-center">
              <span className="font-medium">Langue détectée: </span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {detectedLang}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Langue cible:
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={loadingLanguages}
          >
            {loadingLanguages ? (
              <option>Chargement des langues...</option>
            ) : (
              languages.map((lang) => (
                <option key={lang.language} value={lang.language}>
                  {lang.name}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          onClick={handleTranslate}
          disabled={loading || !inputText || !isValidApiKey}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Traduction en cours...' : 'Traduire'}
        </button>

        {translatedText && (
          <div className="mt-4">
            <h2 className="text-lg font-medium mb-2">Résultat :</h2>
            <div className="p-4 bg-gray-100 rounded-md">
              {translatedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationTest; 