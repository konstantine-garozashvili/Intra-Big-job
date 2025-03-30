/**
 * Liste des termes qui ne doivent pas être traduits
 * Ces termes seront préservés tels quels lors des traductions
 */
export const UNTRANSLATABLE_TERMS = [
  // Nom du projet et marques
  'Big Project',
  'Intra Big-job',
  'BigProject',
  'Intra-Big-job',
  
  // Termes techniques spécifiques
  'Admin',
  'Super Admin',
  'HR',
  'Dashboard',
  
  // Autres termes spécifiques qui ne doivent jamais être traduits
  'JWT',
  'API',
  'REST',
  'OAuth'
];

/**
 * Vérifie si un texte contient des termes qui ne doivent pas être traduits
 * @param {string} text - Le texte à vérifier
 * @returns {boolean} - True si le texte contient un terme non traduisible
 */
export function containsUntranslatableTerm(text) {
  if (!text) return false;
  
  return UNTRANSLATABLE_TERMS.some(term => 
    text.includes(term) || text === term
  );
}

/**
 * Remplace les termes non traduisibles par des jetons uniques pour les préserver
 * puis les restaure après la traduction
 * @param {string} text - Le texte à préparer pour la traduction
 * @returns {object} - Un objet avec le texte préparé et une fonction pour restaurer les termes
 */
export function preserveUntranslatableTerms(text) {
  if (!text) return { preparedText: '', restoreTerms: (t) => t };
  
  // Créer un dictionnaire des termes à préserver et leurs jetons
  const termsToPreserve = [];
  let preparedText = text;
  
  UNTRANSLATABLE_TERMS.forEach((term, index) => {
    if (text.includes(term)) {
      // Créer un jeton unique qui ne sera pas traduit (utilisant une syntaxe HTML)
      const token = `<keep-${index}>`;
      termsToPreserve.push({ term, token });
      
      // Remplacer tous les occurrences du terme par son jeton
      preparedText = preparedText.replace(new RegExp(escapeRegExp(term), 'g'), token);
    }
  });
  
  // Fonction pour restaurer les termes d'origine après la traduction
  const restoreTerms = (translatedText) => {
    let restoredText = translatedText;
    termsToPreserve.forEach(({ term, token }) => {
      restoredText = restoredText.replace(new RegExp(escapeRegExp(token), 'g'), term);
    });
    return restoredText;
  };
  
  return { preparedText, restoreTerms };
}

/**
 * Échappe les caractères spéciaux dans une chaîne pour une utilisation dans une regex
 * @param {string} string - La chaîne à échapper
 * @returns {string} - La chaîne échappée
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 