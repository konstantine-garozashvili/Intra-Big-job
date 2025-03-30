import React, { useEffect, useState, useMemo } from 'react';
import { useTranslationContext } from '../../context/TranslationContext';
import { Skeleton } from '../ui/skeleton';
import { containsUntranslatableTerm } from '../../lib/constants/untranslatableTerms';

/**
 * Composant pour traduire un texte automatiquement
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.text - Texte à traduire
 * @param {boolean} props.showSkeleton - Afficher un skeleton pendant le chargement
 * @param {string} props.skeletonWidth - Largeur du skeleton (par défaut: '100%')
 * @param {string} props.skeletonHeight - Hauteur du skeleton (par défaut: '1rem')
 * @param {string} props.as - Type d'élément à rendre (par défaut: 'span')
 * @param {Object} props.className - Classes CSS supplémentaires
 * @param {boolean} props.forceTranslate - Forcer la traduction même pour les termes non-traduisibles
 * @returns {JSX.Element} - Élément React
 */
export function Translation({ 
  text, 
  showSkeleton = true, 
  skeletonWidth = '100%', 
  skeletonHeight = '1rem',
  as = 'span',
  className = '',
  forceTranslate = false,
  ...rest 
}) {
  const { translateText, currentLanguage, isLoading } = useTranslationContext();
  const [translated, setTranslated] = useState('');
  const [isTranslating, setIsTranslating] = useState(true);
  
  // Vérifier si le texte contient des termes non-traduisibles
  const shouldSkipTranslation = useMemo(() => {
    return !forceTranslate && containsUntranslatableTerm(text);
  }, [text, forceTranslate]);
  
  useEffect(() => {
    // Si le texte est vide, ne rien faire
    if (!text) {
      setTranslated('');
      setIsTranslating(false);
      return;
    }
    
    // Si le texte contient des termes non-traduisibles, ne pas traduire
    if (shouldSkipTranslation) {
      setTranslated(text);
      setIsTranslating(false);
      return;
    }
    
    // Traduire le texte
    const translate = async () => {
      setIsTranslating(true);
      try {
        const result = await translateText(text);
        setTranslated(result);
      } catch (error) {
        console.error('Erreur de traduction:', error);
        setTranslated(text); // En cas d'erreur, afficher le texte original
      } finally {
        setIsTranslating(false);
      }
    };
    
    translate();
  }, [text, translateText, currentLanguage, shouldSkipTranslation]);
  
  const Element = as;
  const showingLoader = isTranslating && showSkeleton;
  
  if (showingLoader) {
    return <Skeleton width={skeletonWidth} height={skeletonHeight} className={className} />;
  }
  
  return (
    <Element className={className} {...rest}>
      {shouldSkipTranslation ? text : (translated || text)}
    </Element>
  );
} 