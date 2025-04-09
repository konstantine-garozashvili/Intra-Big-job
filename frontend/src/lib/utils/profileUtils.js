/**
 * Utility functions for profile-related operations
 */

/**
 * Generates a complete URL for a profile picture path
 * @param {string|null} picturePath - The profile picture path from the API
 * @param {string|null} s3Url - The S3 URL for the profile picture
 * @returns {string|null} - The complete URL or null if no path is provided
 */
export const getProfilePictureUrl = (picturePath, s3Url = null) => {
  // Si une URL S3 est fournie, l'utiliser directement
  if (s3Url) {
    return s3Url;
  }

  // Si le chemin est null, vide ou une chaîne vide, retourner null
  if (!picturePath || picturePath.trim() === '') {
    return null;
  }

  // Si le chemin commence déjà par http, c'est déjà une URL complète
  if (picturePath.startsWith('http')) {
    return picturePath;
  }

  // Obtenir l'URL de base de l'API à partir des variables d'environnement
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const apiBaseUrl = baseUrl.replace(/\/api$/, ''); // Supprimer /api si elle existe à la fin

  // Si le chemin est juste un nom de fichier (sans slash ou backslash)
  if (!picturePath.includes('/') && !picturePath.includes('\\')) {
    // Essayer différentes localisations possibles
    const possibleUrls = [
      `${apiBaseUrl}/uploads/documents/${picturePath}`,
      `${apiBaseUrl}/uploads/profile-pictures/${picturePath}`,
      `${apiBaseUrl}/uploads/${picturePath}`
    ];
    
    // Retourner la première URL (nous les essaierons tous dans le composant)
    return possibleUrls[0];
  }

  // Gérer les chemins de fichiers locaux (qui pourraient être des chemins absolus)
  if (picturePath.includes('/var/www/') || picturePath.includes('C:\\') || picturePath.includes('/public/uploads/')) {
    // Extraire la partie pertinente du chemin
    let relativePath;
    
    if (picturePath.includes('/public/uploads/')) {
      // Extraire le chemin après /public/
      relativePath = picturePath.split('/public/')[1];
    } else if (picturePath.includes('/var/www/')) {
      // Extraire le chemin après /var/www/html/ ou similaire
      const parts = picturePath.split('/var/www/');
      const afterVarWww = parts[1];
      // Ignorer le premier répertoire (généralement html ou le nom du projet)
      const pathParts = afterVarWww.split('/');
      relativePath = pathParts.slice(1).join('/');
    } else {
      // Extraire le nom de fichier du chemin pour les chemins Windows
      const parts = picturePath.split('\\');
      // Chercher le répertoire 'uploads' dans le chemin
      const uploadsIndex = parts.findIndex(part => part === 'uploads');
      if (uploadsIndex !== -1) {
        relativePath = 'uploads/' + parts.slice(uploadsIndex + 1).join('/');
      } else {
        relativePath = 'uploads/' + parts[parts.length - 1];
      }
    }
    
    // Construire l'URL avec le chemin relatif
    return `${apiBaseUrl}/${relativePath}`;
  }

  // S'assurer que le chemin commence par un slash
  const normalizedPath = picturePath.startsWith('/') ? picturePath : `/${picturePath}`;
  
  // Si le chemin contient 'uploads', c'est probablement un chemin de fichier
  if (normalizedPath.includes('uploads')) {
    return `${apiBaseUrl}${normalizedPath}`;
  }

  // Si le chemin ne contient pas 'uploads', c'est peut-être un chemin relatif à l'API
  return `${apiBaseUrl}/uploads${normalizedPath}`;
};

/**
 * Gets the initials from a user's first and last name
 * @param {Object} user - The user object with firstName and lastName properties
 * @returns {string} - The user's initials
 */
export const getUserInitials = (user) => {
  if (!user) return '';
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
};

import { studentProfileService } from "../services/studentProfileService";

// Fonction pour synchroniser la mise à jour du portfolio dans l'application
export const synchronizePortfolioUpdate = (portfolioUrl) => {
  console.log("profileUtils: Synchronizing portfolio update:", portfolioUrl);
  
  // Dispatcher un événement personnalisé pour notifier tous les composants
  const event = new CustomEvent('portfolio-updated', {
    detail: { portfolioUrl }
  });
  
  window.dispatchEvent(event);
  
  // Également dispatcher un événement plus général de mise à jour de profil
  // pour compatibilité avec d'autres écouteurs
  const profileEvent = new CustomEvent('profile-updated', {
    detail: { 
      type: 'portfolio',
      portfolioUrl
    }
  });
  
  window.dispatchEvent(profileEvent);
  
  // Mettre à jour le stockage local
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData && typeof userData === 'object') {
        // Si le profil étudiant existe
        if (userData.studentProfile) {
          userData.studentProfile.portfolioUrl = portfolioUrl;
        } else if (!userData.studentProfile && userData.roles) {
          // Créer un profil étudiant si l'utilisateur est un étudiant
          const isStudent = Array.isArray(userData.roles) && userData.roles.some(role => 
            (typeof role === 'string' && role.includes('STUDENT')) || 
            (typeof role === 'object' && role.name && role.name.includes('STUDENT'))
          );
          
          if (isStudent) {
            userData.studentProfile = {
              portfolioUrl: portfolioUrl
            };
          }
        }
        
        // Mettre à jour le stockage local
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }
    
    // Faire la même chose pour le sessionStorage
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      const userData = JSON.parse(sessionUser);
      if (userData && typeof userData === 'object') {
        if (userData.studentProfile) {
          userData.studentProfile.portfolioUrl = portfolioUrl;
        } else if (!userData.studentProfile && userData.roles) {
          const isStudent = Array.isArray(userData.roles) && userData.roles.some(role => 
            (typeof role === 'string' && role.includes('STUDENT')) || 
            (typeof role === 'object' && role.name && role.name.includes('STUDENT'))
          );
          
          if (isStudent) {
            userData.studentProfile = {
              portfolioUrl: portfolioUrl
            };
          }
        }
        
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
    }
  } catch (error) {
    console.warn("profileUtils: Error updating local storage:", error);
  }
  
  // Forcer l'invalidation du cache du service
  studentProfileService.clearCache();
};

// Ajouter un gestionnaire d'écouteur pour les mises à jour de portfolio
export const addPortfolioUpdateListener = (callback) => {
  const handler = (event) => {
    if (event.detail && event.detail.portfolioUrl !== undefined) {
      callback(event.detail.portfolioUrl);
    }
  };
  
  window.addEventListener('portfolio-updated', handler);
  
  // Renvoyer une fonction de nettoyage pour React useEffect
  return () => {
    window.removeEventListener('portfolio-updated', handler);
  };
}; 