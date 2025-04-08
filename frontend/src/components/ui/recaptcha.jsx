import React, { useEffect, useRef, useState } from 'react';

/**
 * Composant Google reCAPTCHA v2 ("Je ne suis pas un robot")
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onChange - Fonction appelée lorsque le reCAPTCHA est complété ou expiré
 * @param {string} props.siteKey - Clé de site Google reCAPTCHA
 * @param {boolean} props.error - Indique si une erreur doit être affichée
 * @param {string} props.errorMessage - Message d'erreur à afficher
 */
export const ReCaptcha = ({ onChange, siteKey, error, errorMessage }) => {
  // Référence vers l'élément div qui contiendra le reCAPTCHA
  const captchaRef = useRef(null);
  // État pour suivre le chargement du script
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(null);
  
  // En mode développement, on peut simuler un reCAPTCHA réussi
  const simulateSuccess = () => {
    console.log("Simulation de vérification reCAPTCHA réussie");
    if (onChange) {
      onChange("dev-test-token");
    }
  };
  
  // Initialiser le reCAPTCHA au chargement du composant
  useEffect(() => {
    console.log("Initialisation du reCAPTCHA avec la clé:", siteKey);
    
    // En développement, on peut sauter le chargement du script
    if (import.meta.env.DEV) {
      console.log("DEV MODE: Chargement reCAPTCHA optionnel");
      setScriptLoaded(true);
      // Ne pas retourner tout de suite pour laisser une chance au composant de charger
    }
    
    // Fonction pour charger le script reCAPTCHA
    const loadReCaptcha = () => {
      // Vérifier si le script est déjà chargé
      if (window.grecaptcha && window.grecaptcha.render) {
        console.log("Script reCAPTCHA déjà chargé");
        setScriptLoaded(true);
        renderReCaptcha();
        return;
      }
      
      // Empêcher les chargements multiples
      if (document.querySelector('script[src*="recaptcha/api.js"]')) {
        console.log("Script reCAPTCHA en cours de chargement");
        return;
      }
      
      console.log("Chargement du script reCAPTCHA...");
      
      // Créer et ajouter le script reCAPTCHA au document
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoad&render=explicit`;
      script.async = true;
      script.defer = true;
      
      // Surveiller le chargement du script
      script.onload = () => {
        console.log("Script reCAPTCHA chargé avec succès");
        setScriptLoaded(true);
      };
      
      script.onerror = (error) => {
        console.error("Erreur lors du chargement du script reCAPTCHA:", error);
        setScriptError("Impossible de charger reCAPTCHA. Veuillez vérifier votre connexion.");
        
        // En mode développement, on continue quand même
        if (import.meta.env.DEV) {
          setScriptLoaded(true);
        }
      };
      
      // Définir une fonction globale qui sera appelée une fois le script chargé
      window.onReCaptchaLoad = () => {
        console.log("Callback onReCaptchaLoad appelé");
        renderReCaptcha();
      };
      
      document.head.appendChild(script);
    };
    
    // Fonction pour rendre le widget reCAPTCHA
    const renderReCaptcha = () => {
      if (!captchaRef.current || !window.grecaptcha || !window.grecaptcha.render) {
        console.warn("Impossible de rendre le reCAPTCHA: référence ou API manquante");
        return;
      }
      
      // Vérifier si le reCAPTCHA est déjà rendu
      if (captchaRef.current.childElementCount > 0 && !captchaRef.current.querySelector('.grecaptcha-badge')) {
        // Nettoyer le contenu existant
        console.log("Nettoyage du contenu reCAPTCHA existant");
        captchaRef.current.innerHTML = '';
      }
      
      try {
        console.log("Rendu du widget reCAPTCHA avec la clé:", siteKey);
        // Rendre le widget avec les options d'accessibilité
        window.grecaptcha.render(captchaRef.current, {
          sitekey: siteKey,
          callback: handleCaptchaSuccess,
          'expired-callback': handleCaptchaExpired,
          theme: 'light',
          // Activer les options d'accessibilité
          a11y_ttslegacy: true,
          a11y_ttsactive: true,
        });
        console.log("Widget reCAPTCHA rendu avec succès");
      } catch (error) {
        console.error("Erreur lors du rendu du widget reCAPTCHA:", error);
      }
    };
    
    loadReCaptcha();
    
    // Fonction de nettoyage lors du démontage du composant
    return () => {
      // Supprimer la fonction globale
      delete window.onReCaptchaLoad;
    };
  }, [siteKey]);
  
  // Gérer la validation réussie du captcha
  const handleCaptchaSuccess = (token) => {
    console.log("reCAPTCHA validé avec succès, token reçu");
    if (onChange) {
      onChange(token);
    }
  };
  
  // Gérer l'expiration du captcha
  const handleCaptchaExpired = () => {
    console.log("Le token reCAPTCHA a expiré");
    if (onChange) {
      onChange(null); // Token expiré
    }
  };
  
  // Réinitialiser le captcha
  const resetCaptcha = () => {
    if (window.grecaptcha) {
      window.grecaptcha.reset();
    }
  };
  
  return (
    <div className="mt-4">
      {scriptError && (
        <p className="text-red-500 text-sm mb-2">{scriptError}</p>
      )}
      
      {/* En mode développement, offrir un bouton pour simuler le succès */}
      {import.meta.env.DEV && (
        <div 
          className="my-2 cursor-pointer text-center p-2 rounded border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100"
          onClick={simulateSuccess}
        >
          Simuler une validation reCAPTCHA (mode DEV uniquement)
        </div>
      )}
      
      <div 
        ref={captchaRef} 
        className={`g-recaptcha inline-block min-h-[78px] ${error ? 'border border-red-500 rounded' : ''}`}
        aria-label="reCAPTCHA de Google pour vérifier que vous n'êtes pas un robot"
        style={{ display: scriptLoaded ? 'block' : 'none' }}
      />
      
      {!scriptLoaded && !scriptError && (
        <div className="flex items-center space-x-2 my-2 py-2 px-4 border rounded bg-gray-50">
          <div className="w-5 h-5 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Chargement du reCAPTCHA...</span>
        </div>
      )}
      
      {error && errorMessage && (
        <p className="text-red-500 text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {errorMessage}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Ce site est protégé par reCAPTCHA et les{' '}
        <a 
          href="https://policies.google.com/privacy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          règles de confidentialité
        </a>{' '}
        et{' '}
        <a 
          href="https://policies.google.com/terms" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          conditions d'utilisation
        </a>{' '}
        de Google s'appliquent.
      </p>
    </div>
  );
};

export default ReCaptcha; 