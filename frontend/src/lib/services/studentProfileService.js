import apiService from "./apiService";
import { synchronizePortfolioUpdate } from "../utils/profileUtils";

// Constantes pour les URL de l'API
const API_URLS = {
  PROFILE: "/api/student/profile",
  JOB_SEEKING_STATUS: "/api/student/profile/job-seeking-status",
  TOGGLE_INTERNSHIP: "/api/student/profile/toggle-internship-seeking",
  TOGGLE_APPRENTICESHIP: "/api/student/profile/toggle-apprenticeship-seeking",
  PORTFOLIO_URL: "/api/student/profile/portfolio-url"
};

/**
 * Normalise les réponses du service en fonction de leur structure
 * @param {*} response La réponse à normaliser
 * @returns {Object} La réponse normalisée avec une structure cohérente
 */
const normalizeResponse = (response) => {
  if (!response) return null;
  
  // Si la réponse est déjà au format {success, data}
  if (response.success !== undefined && response.data !== undefined) {
    return response;
  }
  
  // Si la réponse est un objet direct
  if (typeof response === 'object' && response !== null) {
    // Si l'objet contient un champ 'data', on considère qu'il s'agit déjà d'une structure de réponse
    if (response.data !== undefined) {
      return {
        success: true,
        data: response.data
      };
    }
    
    // Sinon, on considère l'objet entier comme les données
    return {
      success: true,
      data: response
    };
  }
  
  // Cas par défaut, on retourne la réponse telle quelle
  return {
    success: false,
    data: response
  };
};

// Cache pour stocker temporairement les profils (éviter les appels multiples)
let profileCache = null;
let profileCacheTimestamp = 0;
// Réduire la durée du cache pour assurer des données plus fraîches
const CACHE_EXPIRY_MS = 5000; // 5 secondes au lieu de 10

// Vérifie si la page vient d'être rechargée
const isPageReload = () => {
  // Utiliser performance.navigation pour détecter un rechargement de page
  if (window.performance && window.performance.navigation) {
    return window.performance.navigation.type === 1; // 1 = rechargement
  }
  
  // Méthode alternative pour les navigateurs plus récents
  return window.performance && 
         window.performance.getEntriesByType && 
         window.performance.getEntriesByType("navigation")[0]?.type === "reload";
};

/**
 * Service pour la gestion des profils étudiants
 */
export const studentProfileService = {
  /**
   * Réinitialise le cache du profil
   */
  clearCache: () => {
    profileCache = null;
    profileCacheTimestamp = 0;
    console.log("StudentProfileService: Cache cleared");
  },
  
  /**
   * Récupère le profil étudiant de l'utilisateur connecté
   * @param {boolean} forceRefresh Force le rafraîchissement du cache
   * @returns {Promise<Object>} Les données du profil étudiant
   */
  getMyProfile: async (forceRefresh = false) => {
    try {
      // Force le rafraîchissement si la page a été rechargée
      const shouldForceRefresh = forceRefresh || isPageReload();
      
      // Vérifier si on peut utiliser le cache
      const now = Date.now();
      if (!shouldForceRefresh && profileCache && now - profileCacheTimestamp < CACHE_EXPIRY_MS) {
        console.log("StudentProfileService: Using cached profile data");
        return profileCache;
      }
      
      console.log("StudentProfileService: Fetching student profile...");
      const response = await apiService.get(API_URLS.PROFILE);
      console.log("StudentProfileService: Raw student profile response:", response);
      
      // Normalisation de la réponse
      const normalizedResponse = normalizeResponse(response);
      console.log("StudentProfileService: Normalized student profile response:", normalizedResponse);
      
      // Mettre à jour le cache
      profileCache = normalizedResponse;
      profileCacheTimestamp = now;
      
      return normalizedResponse;
    } catch (error) {
      console.error("StudentProfileService: Error fetching student profile:", error);
      throw error;
    }
  },
  
  /**
   * Met à jour le statut de recherche d'emploi
   * @param {Object} statusData Les données de statut à mettre à jour
   * @returns {Promise<Object>} Les données mises à jour
   */
  updateJobSeekingStatus: async (statusData) => {
    try {
      // Valider les données d'entrée
      const validStatusData = {};
      
      if (statusData && typeof statusData === 'object') {
        if (typeof statusData.isSeekingInternship === 'boolean') {
          validStatusData.isSeekingInternship = statusData.isSeekingInternship;
        }
        
        if (typeof statusData.isSeekingApprenticeship === 'boolean') {
          validStatusData.isSeekingApprenticeship = statusData.isSeekingApprenticeship;
        }
      }
      
      // Vérifier qu'il y a au moins une propriété valide
      if (Object.keys(validStatusData).length === 0) {
        throw new Error("Invalid status data: at least one valid status property is required");
      }
      
      console.log("StudentProfileService: Updating job seeking status with data:", validStatusData);
      const response = await apiService.put(API_URLS.JOB_SEEKING_STATUS, validStatusData);
      console.log("StudentProfileService: Job seeking status update response:", response);
      
      // Normalisation de la réponse
      const normalizedResponse = normalizeResponse(response);
      console.log("StudentProfileService: Normalized job seeking status response:", normalizedResponse);
      
      // Mettre à jour le cache avec les nouvelles données
      if (normalizedResponse.success && normalizedResponse.data) {
        // Mettre à jour le cache s'il existe
        if (profileCache) {
          profileCache = {
            ...profileCache,
            data: {
              ...profileCache.data,
              ...normalizedResponse.data
            }
          };
          profileCacheTimestamp = Date.now();
        }
        
        // Déclencher un événement personnalisé pour notifier tous les composants de la mise à jour
        window.dispatchEvent(new CustomEvent('job-status-updated', {
          detail: { 
            type: 'both',
            data: normalizedResponse.data,
            isSeekingInternship: validStatusData.isSeekingInternship,
            isSeekingApprenticeship: validStatusData.isSeekingApprenticeship
          }
        }));
      } else {
        // Si la réponse n'est pas normalisée, on invalide le cache
        studentProfileService.clearCache();
      }
      
      return normalizedResponse;
    } catch (error) {
      console.error("StudentProfileService: Error updating job seeking status:", error);
      // Invalider le cache en cas d'erreur pour forcer un rafraîchissement
      studentProfileService.clearCache();
      throw error;
    }
  },
  
  /**
   * Bascule le statut de recherche de stage
   * @param {boolean} newStatus Nouveau statut de recherche de stage (optionnel)
   * @returns {Promise<Object>} Les données mises à jour
   */
  toggleInternshipSeeking: async (newStatus) => {
    try {
      console.log("StudentProfileService: Toggling internship seeking status to:", newStatus);
      
      // Si un statut spécifique est fourni, utiliser updateJobSeekingStatus
      if (typeof newStatus === 'boolean') {
        const response = await studentProfileService.updateJobSeekingStatus({
          isSeekingInternship: newStatus
        });
        
        // Déclencher un événement personnalisé pour notifier les composants de la mise à jour
        window.dispatchEvent(new CustomEvent('job-status-updated', {
          detail: { type: 'internship', status: newStatus }
        }));
        
        return response;
      }
      
      // Sinon, utiliser l'endpoint de basculement qui gère le toggle côté serveur
      console.log("StudentProfileService: Using toggle endpoint for internship status");
      const response = await apiService.put(API_URLS.TOGGLE_INTERNSHIP);
      
      const normalizedResponse = normalizeResponse(response);
      
      // Récupérer le nouveau statut depuis la réponse
      let updatedStatus = false;
      if (normalizedResponse.success && normalizedResponse.data) {
        if (normalizedResponse.data.isSeekingInternship !== undefined) {
          updatedStatus = normalizedResponse.data.isSeekingInternship;
        } else if (normalizedResponse.data.profile && normalizedResponse.data.profile.isSeekingInternship !== undefined) {
          updatedStatus = normalizedResponse.data.profile.isSeekingInternship;
        }
      }
      
      // Mettre à jour le cache
      if (profileCache && profileCache.data) {
        if (profileCache.data.isSeekingInternship !== undefined) {
          profileCache.data.isSeekingInternship = updatedStatus;
        }
        profileCacheTimestamp = Date.now();
      }
      
      // Déclencher un événement personnalisé pour notifier les composants de la mise à jour
      window.dispatchEvent(new CustomEvent('job-status-updated', {
        detail: { type: 'internship', status: updatedStatus }
      }));
      
      console.log("StudentProfileService: Internship toggle response:", normalizedResponse);
      return normalizedResponse;
    } catch (error) {
      console.error("StudentProfileService: Error toggling internship seeking status:", error);
      // Invalider le cache en cas d'erreur
      studentProfileService.clearCache();
      throw error;
    }
  },
  
  /**
   * Bascule le statut de recherche d'alternance
   * @param {boolean} newStatus Nouveau statut de recherche d'alternance (optionnel)
   * @returns {Promise<Object>} Les données mises à jour
   */
  toggleApprenticeshipSeeking: async (newStatus) => {
    try {
      console.log("StudentProfileService: Toggling apprenticeship seeking status to:", newStatus);
      
      // Si un statut spécifique est fourni, utiliser updateJobSeekingStatus
      if (typeof newStatus === 'boolean') {
        const response = await studentProfileService.updateJobSeekingStatus({
          isSeekingApprenticeship: newStatus
        });
        
        // Déclencher un événement personnalisé pour notifier les composants de la mise à jour
        window.dispatchEvent(new CustomEvent('job-status-updated', {
          detail: { type: 'apprenticeship', status: newStatus }
        }));
        
        return response;
      }
      
      // Sinon, utiliser l'endpoint de basculement qui gère le toggle côté serveur
      console.log("StudentProfileService: Using toggle endpoint for apprenticeship status");
      const response = await apiService.put(API_URLS.TOGGLE_APPRENTICESHIP);
      
      const normalizedResponse = normalizeResponse(response);
      
      // Récupérer le nouveau statut depuis la réponse
      let updatedStatus = false;
      if (normalizedResponse.success && normalizedResponse.data) {
        if (normalizedResponse.data.isSeekingApprenticeship !== undefined) {
          updatedStatus = normalizedResponse.data.isSeekingApprenticeship;
        } else if (normalizedResponse.data.profile && normalizedResponse.data.profile.isSeekingApprenticeship !== undefined) {
          updatedStatus = normalizedResponse.data.profile.isSeekingApprenticeship;
        }
      }
      
      // Mettre à jour le cache
      if (profileCache && profileCache.data) {
        if (profileCache.data.isSeekingApprenticeship !== undefined) {
          profileCache.data.isSeekingApprenticeship = updatedStatus;
        }
        profileCacheTimestamp = Date.now();
      }
      
      // Déclencher un événement personnalisé pour notifier les composants de la mise à jour
      window.dispatchEvent(new CustomEvent('job-status-updated', {
        detail: { type: 'apprenticeship', status: updatedStatus }
      }));
      
      console.log("StudentProfileService: Apprenticeship toggle response:", normalizedResponse);
      return normalizedResponse;
    } catch (error) {
      console.error("StudentProfileService: Error toggling apprenticeship seeking status:", error);
      // Invalider le cache en cas d'erreur
      studentProfileService.clearCache();
      throw error;
    }
  },
  
  /**
   * Met à jour l'URL du portfolio de l'étudiant
   * @param {string} portfolioUrl Nouvelle URL du portfolio
   * @returns {Promise<Object>} Les données mises à jour
   */
  updatePortfolioUrl: async (portfolioUrl) => {
    try {
      console.log("StudentProfileService: Updating portfolio URL to:", portfolioUrl);
      
      // Vérifier que l'URL est valide
      if (portfolioUrl && !portfolioUrl.startsWith('https://')) {
        throw new Error("L'URL du portfolio doit commencer par https://");
      }
      
      const response = await apiService.put(API_URLS.PORTFOLIO_URL, { portfolioUrl });
      
      // Normalisation de la réponse
      const normalizedResponse = normalizeResponse(response);
      console.log("StudentProfileService: Portfolio URL update response:", normalizedResponse);
      
      // Après une mise à jour du portfolio, toujours invalider le cache
      studentProfileService.clearCache();
      
      // Mettre à jour le local storage aussi
      try {
        // Tenter de mettre à jour le stockage local si disponible
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.studentProfile) {
            userData.studentProfile.portfolioUrl = portfolioUrl;
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch (storageError) {
        console.warn("Couldn't update user in localStorage:", storageError);
      }
      
      // Utiliser l'utilitaire centralisé pour notifier tous les composants
      synchronizePortfolioUpdate(portfolioUrl);
      
      return normalizedResponse;
    } catch (error) {
      console.error("StudentProfileService: Error updating portfolio URL:", error);
      // Invalider le cache en cas d'erreur
      studentProfileService.clearCache();
      throw error;
    }
  }
};

export default studentProfileService; 
