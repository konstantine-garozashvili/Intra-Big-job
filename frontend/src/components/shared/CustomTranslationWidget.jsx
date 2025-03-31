import React, { useEffect } from 'react';
import { useTranslationContext } from '../../context/TranslationContext';
import FixGoogleTranslateCSS from './FixGoogleTranslateCSS';

/**
 * Widget personnalisé pour intégrer Google Translate directement dans l'application
 * Ce composant sert de point central pour synchroniser le widget Google Translate avec
 * notre système de traduction interne.
 */
const CustomTranslationWidget = () => {
  const { currentLanguage } = useTranslationContext();
  
  // Fonction pour initialiser le widget Google Translate
  const initGoogleTranslate = () => {
    // Vérifier si le widget existe déjà
    if (!document.getElementById('google_translate_element')) {
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.position = 'fixed';
      div.style.bottom = '10px';
      div.style.right = '10px';
      div.style.zIndex = '9999';
      document.body.appendChild(div);
      
      // Injecter le script Google Translate
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        function googleTranslateElementInit() {
          new google.translate.TranslateElement({
            pageLanguage: 'fr',
            includedLanguages: 'en,es,de,it,pt,ru,zh-CN,ja,ar',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, 'google_translate_element');
        }
      `;
      document.body.appendChild(script);
      
      // Charger le script Google Translate
      const translateScript = document.createElement('script');
      translateScript.type = 'text/javascript';
      translateScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(translateScript);
    }
  };
  
  useEffect(() => {
    // Initialiser Google Translate lors du montage du composant
    initGoogleTranslate();
    
    // Synchroniser les changements de langue avec Google Translate
    const syncGoogleTranslate = () => {
      // Si le sélecteur de Google Translate existe, on peut le manipuler
      const iframe = document.querySelector('.goog-te-menu-frame');
      if (iframe) {
        // La langue actuelle est 'fr', mais si on clique sur le sélecteur,
        // Google Translate devrait toujours afficher les autres langues
        console.log('Google Translate widget détecté, langue actuelle:', currentLanguage);
      }
    };
    
    // Appeler la synchronisation quand la langue change
    syncGoogleTranslate();
    
    // Nettoyer lors du démontage
    return () => {
      // Pas de nettoyage nécessaire, car le widget doit rester présent
    };
  }, [currentLanguage]);
  
  // Intégrer les correctifs CSS pour Google Translate
  return <FixGoogleTranslateCSS />;
};

export default CustomTranslationWidget; 