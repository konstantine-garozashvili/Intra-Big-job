// Ajoutez un console.log pour déboguer la structure des données dans ProfileHeader
console.log("ProfileHeader received userData:", userData);

// Récupération sécurisée des propriétés utilisateur
const getUserProperty = (propName, defaultValue = '') => {
  // Si la propriété existe directement dans userData
  if (userData && userData[propName] !== undefined) {
    return userData[propName];
  }
  // Si la propriété existe dans userData.user
  if (userData && userData.user && userData.user[propName] !== undefined) {
    return userData.user[propName];
  }
  // Valeur par défaut
  return defaultValue;
}; 