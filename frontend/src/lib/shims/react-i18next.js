/**
 * Shim pour react-i18next
 * Ce fichier fournit des exportations factices pour éviter les erreurs d'importation
 */

export const useTranslation = () => {
  return {
    t: (key) => {
      return key; // Retourne simplement la clé comme valeur
    },
    i18n: {
      changeLanguage: () => {
        return Promise.resolve();
      }
    }
  };
};

export const withTranslation = () => (Component) => {
  return Component;
};

export const Trans = ({ children }) => {
  return children;
};

export const I18nextProvider = ({ children }) => {
  return children;
};

export default {
  useTranslation,
  withTranslation,
  Trans,
  I18nextProvider
}; 