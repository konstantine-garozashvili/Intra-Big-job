import axios from "axios";
import apiService from "./apiService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Service pour l'authentification et la gestion des utilisateurs
 */
export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async register(userData) {
    try {
      console.log("[authService] Début de l'inscription:", {
        ...userData,
        password: "***",
      });
      const response = await apiService.post("/register", userData);

      console.log("[authService] Inscription réussie:", response);

      // Si la réponse contient un token (certaines API peuvent fournir un token immédiatement)
      if (response && response.token) {
        localStorage.setItem("token", response.token);
      }

      // Retourner une réponse formatée avec un status 201 si l'API ne renvoie pas de statut
      return {
        status: response.status || 201,
        data: response,
      };
    } catch (error) {
      console.error("[authService] Erreur lors de l'inscription:", error);
      console.error(
        "[authService] Détails:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Connexion d'un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} - Réponse de l'API avec token JWT
   */
  async login(email, password) {
    try {
      // Obtenir l'identifiant d'appareil et les infos
      const deviceId = getOrCreateDeviceId();
      const { deviceName, deviceType } = getDeviceInfo();

      // Préparer les données pour la route standard JWT (/login_check)
      const loginData = {
        username: email, // Noter le champ 'username' au lieu de 'email' pour le standard JWT
        password,
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType,
      };

      // Utiliser directement la route standard JWT
      const response = await apiService.post("/login_check", loginData);

      // Stocker le token JWT dans le localStorage
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // Stocker le refresh token s'il est présent
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token);
      }

      // Stocker les informations de l'utilisateur si présentes
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      console.error(
        "Détails de l'erreur:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Rafraîchir le token JWT
   * @returns {Promise<Object>} - Nouveau token JWT
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const deviceId = localStorage.getItem("device_id");
      const { deviceName, deviceType } = getDeviceInfo();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const refreshData = {
        refresh_token: refreshToken,
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType,
      };

      const response = await apiService.post("/token/refresh", refreshData);

      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token);
      }

      return response;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      console.error(
        "Détails de l'erreur de rafraîchissement:",
        error.response?.data || error.message
      );
      // Si le refresh token est invalide, déconnecter l'utilisateur
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        this.logout();
      }
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const deviceId = localStorage.getItem("device_id");

      // Révoquer le refresh token côté serveur
      if (refreshToken) {
        const revokeData = {
          refresh_token: refreshToken,
          device_id: deviceId,
        };

        await apiService.post("/token/revoke", revokeData).catch((error) => {
          // Ignorer les erreurs lors de la révocation
          console.warn("Échec de révocation du refresh token:", error.message);
        });
      }
    } catch (error) {
      console.warn("Erreur pendant la déconnexion:", error);
    } finally {
      // Nettoyer le localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      // Ne pas supprimer device_id pour maintenir l'identification de l'appareil
    }
  },

  /**
   * Déconnexion de tous les appareils
   */
  async logoutAllDevices() {
    try {
      await apiService.post("/token/revoke-all");

      // Nettoyer le localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      // Ne pas supprimer device_id pour maintenir l'identification de l'appareil
    } catch (error) {
      console.error(
        "Erreur lors de la déconnexion de tous les appareils:",
        error
      );
      console.error("Détails:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Récupérer la liste des appareils connectés
   */
  async getDevices() {
    try {
      const devices = await apiService.get("/token/devices");
      return devices;
    } catch (error) {
      console.error("Erreur lors de la récupération des appareils:", error);
      console.error("Détails:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Récupère le token JWT stocké
   * @returns {string|null} - Token JWT ou null
   */
  getToken() {
    return localStorage.getItem("token");
  },

  /**
   * Récupère les informations de l'utilisateur connecté
   * @returns {Object|null} - Informations de l'utilisateur ou null
   */
  getUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {boolean} - True si connecté
   */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * Récupère les informations complètes de l'utilisateur connecté depuis l'API
   * et les normalise dans un format standard
   * @returns {Promise<Object>} - Données normalisées de l'utilisateur
   */
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) {
      throw new Error("Aucun token d'authentification trouvé");
    }

    try {
      const response = await apiService.get("/me", apiService.withAuth());

      // Normaliser les données quel que soit le format de réponse
      const rawUserData = response.user || response;

      // Structure normalisée avec des valeurs par défaut
      const normalizedUserData = {
        id: rawUserData.id || rawUserData.userId || null,
        firstName: rawUserData.firstName || rawUserData.first_name || "",
        lastName: rawUserData.lastName || rawUserData.last_name || "",
        email: rawUserData.email || "",
        roles: Array.isArray(rawUserData.roles)
          ? rawUserData.roles
          : rawUserData.role
          ? [rawUserData.role]
          : [],
        // Ajouter d'autres propriétés importantes selon votre modèle de données
      };

      return normalizedUserData;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données utilisateur:",
        error
      );
      console.error("Détails:", error.response?.data || error.message);
      throw error;
    }
  },
};

// Générer ou récupérer un identifiant unique pour l'appareil
function getOrCreateDeviceId() {
  // Vérifier si un deviceId existe déjà dans le localStorage
  let deviceId = localStorage.getItem("device_id");

  // Si non, en créer un nouveau
  if (!deviceId) {
    // Générer un identifiant unique (UUID v4)
    deviceId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
    localStorage.setItem("device_id", deviceId);
  }

  return deviceId;
}

// Obtenir des informations de base sur l'appareil
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let deviceType = "unknown";
  let deviceName = "Browser";

  // Détection simple du type d'appareil
  if (/Android/i.test(userAgent)) {
    deviceType = "mobile";
    deviceName = "Android Device";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    deviceType = "mobile";
    deviceName = "iOS Device";
  } else if (/Windows/i.test(userAgent)) {
    deviceType = "desktop";
    deviceName = "Windows PC";
  } else if (/Macintosh/i.test(userAgent)) {
    deviceType = "desktop";
    deviceName = "Mac";
  } else if (/Linux/i.test(userAgent)) {
    deviceType = "desktop";
    deviceName = "Linux";
  }

  return {
    deviceType,
    deviceName,
  };
}

export default authService;
