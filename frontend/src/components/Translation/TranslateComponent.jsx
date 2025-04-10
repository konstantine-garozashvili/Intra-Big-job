import React, { useState, useEffect } from 'react';
import { translationService } from './TranslationService';

/**
 * A reusable component for translating text
 * 
 * @param {Object} props
 * @param {string} props.text - Text to translate
 * @param {string} props.targetLang - Target language code (default: 'fr')
 * @param {string} props.sourceLang - Source language code (optional)
 * @param {boolean} props.autoTranslate - Whether to translate automatically on text change (default: true)
 * @param {boolean} props.showOriginal - Whether to show original text alongside translation (default: false)
 * @param {function} props.onTranslated - Callback when translation is complete (optional)
 */
const TranslateComponent = ({ 
  text, 
  targetLang = 'fr', 
  sourceLang = null,
  autoTranslate = true,
  showOriginal = false,
  onTranslated = null
}) => {
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!text || !autoTranslate) return;
    
    translateText();
  }, [text, targetLang, sourceLang, autoTranslate]);

  const translateText = async () => {
    if (!text) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await translationService.translateText(text, targetLang, sourceLang);
      setTranslatedText(result);
      if (onTranslated) {
        onTranslated(result);
      }
    } catch (err) {
      setError('Erreur de traduction');
      console.error('Translation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!text) return null;

  // Simple widget when not expanded
  if (!isExpanded) {
    return (
      <div className="inline-flex items-center">
        {showOriginal && <span className="mr-2">{text}</span>}
        {loading ? (
          <span className="text-gray-500 italic text-sm">Traduction en cours...</span>
        ) : error ? (
          <span className="text-red-500 text-sm" title={error}>⚠️</span>
        ) : (
          <span className="text-sm">{translatedText}</span>
        )}
        <button 
          onClick={() => setIsExpanded(true)}
          className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
          title="Afficher plus d'options"
        >
          ⚙️
        </button>
      </div>
    );
  }

  // Expanded widget with more options
  return (
    <div className="border rounded p-3 my-2">
      <div className="flex justify-between mb-2">
        <h4 className="font-medium">Traduction</h4>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {showOriginal && (
        <div className="mb-2 p-2 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Texte original:</div>
          <div>{text}</div>
        </div>
      )}

      <div className="mb-3">
        {loading ? (
          <div className="text-center p-2">
            <div className="inline-block animate-spin mr-2">⟳</div>
            Traduction en cours...
          </div>
        ) : error ? (
          <div className="text-red-500 p-2">{error}</div>
        ) : translatedText ? (
          <div className="p-2 bg-blue-50 rounded">
            <div className="text-xs text-blue-500">Traduction ({targetLang}):</div>
            <div>{translatedText}</div>
          </div>
        ) : null}
      </div>

      {!autoTranslate && (
        <button
          onClick={translateText}
          disabled={loading || !text}
          className="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Traduire
        </button>
      )}
    </div>
  );
};

export default TranslateComponent; 