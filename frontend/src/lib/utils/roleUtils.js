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

/**
 * Role name mapping for different languages and variations
 */
export const ROLE_ALIASES = {
  'ADMIN': ['admin', 'adm', 'administrateur'],
  'SUPER_ADMIN': ['super admin', 'superadmin', 'super', 'super adm', 'super administrateur', 'superadministrateur'],
  'TEACHER': ['formateur', 'forma', 'form'],
  'STUDENT': ['étudiant', 'etudiant', 'étud', 'etud', 'student'],
  'HR': ['rh', 'ressources humaines', 'ressources'],
  'RECRUITER': ['recruteur', 'recru', 'rec'],
  'GUEST': ['invité', 'invite', 'inv']
};

/**
 * Checks if a search term matches a role name using various matching strategies
 * @param {string} searchTerm - The search term to check
 * @param {Array} allowedRoles - Optional array of allowed roles to filter by
 * @returns {Object|null} - The matched role information or null if no match
 */
export function matchRoleFromSearchTerm(searchTerm, allowedRoles = null) {
  if (!searchTerm) return null;
  
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  // Filter roles if allowedRoles is provided
  const rolesToCheck = allowedRoles 
    ? Object.keys(ROLE_ALIASES).filter(role => allowedRoles.includes(role))
    : Object.keys(ROLE_ALIASES);
  
  // Try different matching strategies in order of specificity
  for (const role of rolesToCheck) {
    const aliases = ROLE_ALIASES[role];
    
    // 1. Exact match
    if (aliases.includes(normalizedTerm)) {
      return { role, matchType: 'exact', alias: normalizedTerm };
    }
  }
  
  // 2. Word boundary match
  for (const role of rolesToCheck) {
    const aliases = ROLE_ALIASES[role];
    for (const alias of aliases) {
      try {
        if (new RegExp('\\b' + alias + '\\b', 'i').test(normalizedTerm)) {
          return { role, matchType: 'boundary', alias };
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  // 3. Starts with match
  for (const role of rolesToCheck) {
    const aliases = ROLE_ALIASES[role];
    for (const alias of aliases) {
      if (alias.startsWith(normalizedTerm) || normalizedTerm.startsWith(alias)) {
        return { role, matchType: 'startsWith', alias };
      }
    }
  }
  
  // 4. Contains match
  for (const role of rolesToCheck) {
    const aliases = ROLE_ALIASES[role];
    for (const alias of aliases) {
      if (alias.includes(normalizedTerm) || normalizedTerm.includes(alias)) {
        return { role, matchType: 'contains', alias };
      }
    }
  }
  
  return null;
}

/**
 * Gets the display name for a role in French
 * @param {string} role - The role name (e.g., 'ADMIN', 'TEACHER')
 * @returns {string} - The French display name for the role
 */
export function getFrenchRoleDisplayName(role) {
  if (!role) return 'Utilisateur';
  
  // Normalize role name (remove ROLE_ prefix if present)
  const normalizedRole = role.replace(/^ROLE_/i, '');
  
  switch (normalizedRole.toUpperCase()) {
    case 'ADMIN':
      return 'Admin';
    case 'SUPER_ADMIN':
    case 'SUPERADMIN':
      return 'Super Admin';
    case 'TEACHER':
      return 'Formateur';
    case 'STUDENT':
      return 'Étudiant';
    case 'RECRUITER':
      return 'Recruteur';
    case 'GUEST':
      return 'Invité';
    case 'HR':
      return 'Ressources Humaines';
    default:
      return normalizedRole || 'Utilisateur';
  }
} 