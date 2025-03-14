/**
 * Utilitaire de gestion des rôles utilisateur
 */

/**
 * Retourne le chemin du dashboard en fonction du rôle de l'utilisateur
 * @param {string} role - Rôle de l'utilisateur (ROLE_ADMIN, ROLE_STUDENT, etc.)
 * @returns {string} - Chemin du dashboard spécifique au rôle
 */
export const getDashboardPathByRole = (role) => {
  if (!role) return '/dashboard';

  // Conversion du format ROLE_XXX en minuscules et sans préfixe ROLE_
  const normalizedRole = role.replace('ROLE_', '').toLowerCase();

  // Mapper chaque rôle normalisé à son chemin de dashboard
  switch (normalizedRole) {
    case 'admin':
      return '/admin/dashboard';
    case 'student':
      return '/student/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'hr':
      return '/hr/dashboard';
    case 'superadmin':
      return '/super-admin/dashboard';
    case 'guest':
      return '/guest/dashboard';
    case 'recruiter':
      return '/recruiter/dashboard';
    default:
      // Fallback au dashboard générique
      return '/dashboard';
  }
};

/**
 * Détermine le meilleur rôle à utiliser parmi les rôles de l'utilisateur
 * @param {Array<string>} roles - Liste des rôles de l'utilisateur
 * @returns {string} - Rôle principal à utiliser
 */
export const getPrimaryRole = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return null;
  }

  // Ordre de priorité des rôles (du plus prioritaire au moins prioritaire)
  const rolePriority = [
    'ROLE_SUPERADMIN',
    'ROLE_ADMIN',
    'ROLE_HR',
    'ROLE_TEACHER',
    'ROLE_RECRUITER',
    'ROLE_STUDENT',
    'ROLE_GUEST'
  ];

  // Trouver le rôle avec la plus haute priorité
  for (const priorityRole of rolePriority) {
    if (roles.includes(priorityRole)) {
      return priorityRole;
    }
  }

  // Si aucun rôle prioritaire n'est trouvé, retourner le premier
  return roles[0];
}; 