/**
 * Shim pour react-i18next
 * Ce fichier fournit des exportations factices pour éviter les erreurs d'importation
 */

console.log('[SHIM] react-i18next shim has been loaded');

export const useTranslation = () => {
  console.log('[SHIM] useTranslation called');
  return {
    t: (key) => {
      console.log(`[SHIM] t() called with key: ${key}`);
      return key; // Retourne simplement la clé comme valeur
    },
    i18n: {
      changeLanguage: () => {
        console.log('[SHIM] i18n.changeLanguage called');
        return Promise.resolve();
      }
    }
  };
};

export const withTranslation = () => (Component) => {
  console.log('[SHIM] withTranslation called');
  return Component;
};

export const Trans = ({ children }) => {
  console.log('[SHIM] Trans component rendered');
  return children;
};

export const I18nextProvider = ({ children }) => {
  console.log('[SHIM] I18nextProvider component rendered');
  return children;
};

export default {
  useTranslation,
  withTranslation,
  Trans,
  I18nextProvider
}; 