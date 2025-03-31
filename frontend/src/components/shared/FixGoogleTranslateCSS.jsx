import React, { useEffect } from 'react';

/**
 * Composant pour corriger les problèmes de style CSS liés à Google Translate
 * Ce composant ajoute des règles CSS pour cacher les éléments non désirés et
 * empêcher le décalage de la page après traduction
 */
const FixGoogleTranslateCSS = () => {
  useEffect(() => {
    // Ajouter une feuille de style pour corriger les problèmes de Google Translate
    const style = document.createElement('style');
    style.id = 'google-translate-fixes';
    style.innerHTML = `
      /* Cacher la barre supérieure Google */
      .goog-te-banner-frame.skiptranslate {
        display: none !important;
      }
      
      /* Eviter le décalage de la page */
      body {
        top: 0 !important;
      }
      
      /* Cacher les infobulles de Google Translate */
      .goog-tooltip {
        display: none !important;
      }
      
      /* Cacher les effets de survol de Google Translate */
      .goog-tooltip:hover {
        display: none !important;
      }
      
      /* Cacher la mise en évidence du texte */
      .goog-text-highlight {
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      /* Cacher les éléments inappropriés */
      #goog-gt-tt, .goog-te-balloon-frame {
        display: none !important;
      }
      
      /* Cacher le logo Google */
      .goog-logo-link {
        display: none !important;
      }
      
      /* Ajuster la hauteur du gadget */
      .goog-te-gadget {
        height: 28px !important;
        overflow: hidden;
      }
      
      /* Personnaliser le sélecteur de langue */
      #google_translate_element select {
        background-color: white;
        color: black;
        border: 1px solid #e2e8f0;
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        margin-bottom: 0.5rem;
      }
    `;
    
    document.head.appendChild(style);
    
    // Nettoyer lors du démontage
    return () => {
      const styleElement = document.getElementById('google-translate-fixes');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  
  // Ce composant ne rend rien visuellement
  return null;
};

export default FixGoogleTranslateCSS; 