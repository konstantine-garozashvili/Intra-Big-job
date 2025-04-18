import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../contexts/TranslationContext';

const AsyncTranslation = ({ text }) => {
  const { translate } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    const translateText = async () => {
      try {
        const result = await translate(text);
        setTranslatedText(result);
      } catch (error) {
        console.error('[AsyncTranslation] Error:', error);
        setTranslatedText(text);
      }
    };

    translateText();
  }, [text, translate]);

  return translatedText;
};

export default AsyncTranslation; 