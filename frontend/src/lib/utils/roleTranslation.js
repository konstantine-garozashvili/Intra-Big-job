/**
 * Traduit les codes de rôles en noms lisibles en français
 * @param {string} role - Le code du rôle (avec ou sans préfixe ROLE_)
 * @returns {string} - Le nom traduit du rôle
 */
export const translateRole = (role) => {
  // Supprimer le préfixe ROLE_ si présent
  const roleName = role.replace("ROLE_", "");

  // Table de correspondance
  const translations = {
    STUDENT: "Étudiant",
    ADMIN: "Administrateur",
    TEACHER: "Enseignant",
    HR: "RH",
    SUPERADMIN: "Super Administrateur",
    GUEST: "Invité",
    RECRUITER: "Recruteur",
  };

  // Retourner la traduction ou le nom original si pas de traduction
  return translations[roleName] || roleName;
};

/**
 * Récupère la traduction du rôle principal d'un utilisateur
 * @param {Array} roles - Tableau d'objets de rôles ou de chaînes
 * @returns {string} - Le nom traduit du rôle principal
 */
export const getPrimaryRoleTranslation = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return "Utilisateur";
  }

  // Si les rôles sont des objets avec une propriété name
  if (typeof roles[0] === "object" && roles[0].name) {
    return translateRole(roles[0].name);
  }

  // Si les rôles sont des chaînes de caractères
  if (typeof roles[0] === "string") {
    return translateRole(roles[0]);
  }

  return "Utilisateur";
};
