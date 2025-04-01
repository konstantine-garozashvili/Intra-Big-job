/**
 * Constants pour les rôles utilisateur
 * Ce fichier centralise toutes les définitions liées aux rôles pour une maintenance facile
 */

/**
 * Définition des rôles supportés par l'application
 * Ces constantes doivent être utilisées partout où on fait référence à un rôle
 */
export const ROLES = {
  SUPERADMIN: 'ROLE_SUPERADMIN',
  SUPER_ADMIN: 'ROLE_SUPER_ADMIN', // Alternative spelling
  ADMIN: 'ROLE_ADMIN',
  HR: 'ROLE_HR',
  TEACHER: 'ROLE_TEACHER',
  STUDENT: 'ROLE_STUDENT',
  RECRUITER: 'ROLE_RECRUITER',
  GUEST: 'ROLE_GUEST',
  USER: 'ROLE_USER', // Rôle par défaut/générique
};

/**
 * Définition des affichages français pour chaque rôle
 */
export const ROLE_DISPLAY_NAMES = {
  // Avec préfixe ROLE_
  'ROLE_SUPERADMIN': 'Super Administrateur',
  'ROLE_SUPER_ADMIN': 'Super Administrateur',
  'ROLE_ADMIN': 'Administrateur',
  'ROLE_HR': 'Ressources Humaines',
  'ROLE_TEACHER': 'Formateur',
  'ROLE_STUDENT': 'Étudiant',
  'ROLE_RECRUITER': 'Recruteur',
  'ROLE_GUEST': 'Invité',
  'ROLE_USER': 'Utilisateur',
  
  // Sans préfixe ROLE_
  'SUPERADMIN': 'Super Administrateur',
  'SUPER_ADMIN': 'Super Administrateur',
  'ADMIN': 'Administrateur',
  'HR': 'Ressources Humaines',
  'TEACHER': 'Formateur',
  'STUDENT': 'Étudiant',
  'RECRUITER': 'Recruteur',
  'GUEST': 'Invité',
  'USER': 'Utilisateur',
};

/**
 * Définition des couleurs de badges pour chaque rôle
 * Format: classes Tailwind pour les badges
 */
export const ROLE_COLORS = {
  // Avec préfixe ROLE_
  'ROLE_SUPERADMIN': 'bg-gradient-to-r from-red-500/90 to-red-700/90 text-white',
  'ROLE_SUPER_ADMIN': 'bg-gradient-to-r from-red-500/90 to-red-700/90 text-white',
  'ROLE_ADMIN': 'bg-gradient-to-r from-amber-500/90 to-amber-700/90 text-white',
  'ROLE_HR': 'bg-gradient-to-r from-purple-500/90 to-purple-700/90 text-white',
  'ROLE_TEACHER': 'bg-gradient-to-r from-emerald-500/90 to-emerald-700/90 text-white',
  'ROLE_STUDENT': 'bg-gradient-to-r from-blue-500/90 to-blue-700/90 text-white',
  'ROLE_RECRUITER': 'bg-gradient-to-r from-pink-500/90 to-pink-700/90 text-white',
  'ROLE_GUEST': 'bg-gradient-to-r from-teal-500/90 to-teal-700/90 text-white',
  'ROLE_USER': 'bg-gradient-to-r from-gray-500/90 to-gray-700/90 text-white',
  
  // Sans préfixe ROLE_
  'SUPERADMIN': 'bg-gradient-to-r from-red-500/90 to-red-700/90 text-white',
  'SUPER_ADMIN': 'bg-gradient-to-r from-red-500/90 to-red-700/90 text-white',
  'ADMIN': 'bg-gradient-to-r from-amber-500/90 to-amber-700/90 text-white',
  'HR': 'bg-gradient-to-r from-purple-500/90 to-purple-700/90 text-white',
  'TEACHER': 'bg-gradient-to-r from-emerald-500/90 to-emerald-700/90 text-white',
  'STUDENT': 'bg-gradient-to-r from-blue-500/90 to-blue-700/90 text-white',
  'RECRUITER': 'bg-gradient-to-r from-pink-500/90 to-pink-700/90 text-white',
  'GUEST': 'bg-gradient-to-r from-teal-500/90 to-teal-700/90 text-white',
  'USER': 'bg-gradient-to-r from-gray-500/90 to-gray-700/90 text-white',
};

/**
 * Définition des couleurs solides de badges pour chaque rôle
 * Format: classes Tailwind pour les badges au format BG et texte
 */
export const ROLE_SOLID_COLORS = {
  // Avec préfixe ROLE_
  'ROLE_SUPERADMIN': 'bg-red-100 text-red-700',
  'ROLE_SUPER_ADMIN': 'bg-red-100 text-red-700',
  'ROLE_ADMIN': 'bg-amber-100 text-amber-700',
  'ROLE_HR': 'bg-purple-100 text-purple-700',
  'ROLE_TEACHER': 'bg-emerald-100 text-emerald-700',
  'ROLE_STUDENT': 'bg-blue-100 text-blue-700',
  'ROLE_RECRUITER': 'bg-pink-100 text-pink-700',
  'ROLE_GUEST': 'bg-teal-100 text-teal-700',
  'ROLE_USER': 'bg-gray-100 text-gray-700',
  
  // Sans préfixe ROLE_
  'SUPERADMIN': 'bg-red-100 text-red-700',
  'SUPER_ADMIN': 'bg-red-100 text-red-700',
  'ADMIN': 'bg-amber-100 text-amber-700',
  'HR': 'bg-purple-100 text-purple-700',
  'TEACHER': 'bg-emerald-100 text-emerald-700',
  'STUDENT': 'bg-blue-100 text-blue-700',
  'RECRUITER': 'bg-pink-100 text-pink-700',
  'GUEST': 'bg-teal-100 text-teal-700',
  'USER': 'bg-gray-100 text-gray-700',
};

/**
 * Normalise un nom de rôle en supprimant le préfixe ROLE_ et en normalisant la casse
 * @param {string} role - Rôle à normaliser
 * @returns {string} - Rôle normalisé
 */
export const normalizeRole = (role) => {
  if (!role) return '';
  return role.replace(/^ROLE_/i, '').toUpperCase();
};

/**
 * Récupère le nom d'affichage d'un rôle, avec une gestion sécurisée des valeurs nulles
 * @param {string} role - Rôle pour lequel obtenir le nom d'affichage
 * @returns {string} - Nom d'affichage du rôle
 */
export const getRoleDisplayName = (role) => {
  if (!role) return ROLE_DISPLAY_NAMES['ROLE_USER'];
  
  // Si le rôle existe directement dans le mapping, on le retourne
  if (ROLE_DISPLAY_NAMES[role]) {
    return ROLE_DISPLAY_NAMES[role];
  }
  
  // Sinon on tente de normaliser le rôle pour le trouver
  // Cas 1: Peut-être qu'il manque le préfixe ROLE_
  if (!role.startsWith('ROLE_')) {
    const withPrefix = `ROLE_${role}`;
    if (ROLE_DISPLAY_NAMES[withPrefix]) {
      return ROLE_DISPLAY_NAMES[withPrefix];
    }
  }
  
  // Cas 2: Peut-être qu'il y a le préfixe mais qu'il faut le retirer
  if (role.startsWith('ROLE_')) {
    const withoutPrefix = role.replace(/^ROLE_/i, '');
    if (ROLE_DISPLAY_NAMES[withoutPrefix]) {
      return ROLE_DISPLAY_NAMES[withoutPrefix];
    }
  }
  
  // En dernier recours, on retourne le rôle tel quel ou un défaut
  return role || ROLE_DISPLAY_NAMES['ROLE_USER'];
};

/**
 * Récupère la couleur d'un badge de rôle, avec une gestion sécurisée des valeurs nulles
 * @param {string} role - Rôle pour lequel obtenir la couleur
 * @param {boolean} solid - Si true, retourne les couleurs solides au lieu des gradients
 * @returns {string} - Classes Tailwind pour le badge
 */
export const getRoleBadgeColor = (role, solid = false) => {
  if (!role) return solid ? ROLE_SOLID_COLORS['ROLE_USER'] : ROLE_COLORS['ROLE_USER'];
  
  const colorMap = solid ? ROLE_SOLID_COLORS : ROLE_COLORS;
  
  // Si le rôle existe directement dans le mapping, on le retourne
  if (colorMap[role]) {
    return colorMap[role];
  }
  
  // Sinon on tente de normaliser le rôle pour le trouver
  // Cas 1: Peut-être qu'il manque le préfixe ROLE_
  if (!role.startsWith('ROLE_')) {
    const withPrefix = `ROLE_${role}`;
    if (colorMap[withPrefix]) {
      return colorMap[withPrefix];
    }
  }
  
  // Cas 2: Peut-être qu'il y a le préfixe mais qu'il faut le retirer
  if (role.startsWith('ROLE_')) {
    const withoutPrefix = role.replace(/^ROLE_/i, '');
    if (colorMap[withoutPrefix]) {
      return colorMap[withoutPrefix];
    }
  }
  
  // En dernier recours, on retourne la couleur par défaut
  return solid ? ROLE_SOLID_COLORS['ROLE_USER'] : ROLE_COLORS['ROLE_USER'];
}; 