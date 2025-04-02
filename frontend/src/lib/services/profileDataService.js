import apiService from './apiService';

// Définir un cache simple avec une durée de validité
const profileCache = {
  data: null,
  timestamp: 0,
  fetchPromise: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Vérifier si le cache est valide
  isValid() {
    return (
      this.data !== null && 
      Date.now() - this.timestamp < this.CACHE_DURATION
    );
  },
  
  // Mettre à jour le cache
  update(data) {
    console.log('Updating profile cache with:', {
      id: data?.id,
      hasAddresses: Array.isArray(data?.addresses) && data.addresses.length > 0,
      hasCity: !!data?.city,
      source: data?._source || 'unknown'
    });
    
    this.data = data;
    this.timestamp = Date.now();
    
    // Stocker également dans localStorage pour persistance
    try {
      localStorage.setItem('userProfile', JSON.stringify({
        ...data,
        _cachedAt: this.timestamp
      }));
    } catch (e) {
      console.warn('Failed to store profile in localStorage', e);
    }
  },
  
  // Invalider le cache
  invalidate() {
    console.log('Invalidating profile cache');
    this.data = null;
    this.timestamp = 0;
    this.fetchPromise = null;
    localStorage.removeItem('userProfile');
  }
};

/**
 * Service central pour gérer les données de profil avec spécialisation des routes
 */
class ProfileDataService {
  constructor() {
    this.cache = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes en millisecondes
    this.lastFetchTime = 0;
    this.subscribers = [];
    this.isFetching = false;
    
    // Structure pour stocker les données par source
    this.sourceData = {
      me: null,           // Données de base de l'utilisateur (/api/me)
      profile: null,      // Données de profil simples (/api/profile)
      consolidated: null, // Données consolidées (/api/profile/consolidated)
      custom: {}          // Autres sources de données
    };
    
    // Initialisation du cache depuis le localStorage
    this._initializeFromLocalStorage();
  }
  
  /**
   * Initialise le cache depuis le localStorage
   * @private
   */
  _initializeFromLocalStorage() {
    try {
      const storedCache = localStorage.getItem('profileDataCache');
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache);
        
        // Vérifier si le cache est encore valide
        const now = Date.now();
        if (parsedCache.timestamp && (now - parsedCache.timestamp < this.cacheDuration)) {
          console.log('Initializing profile cache from localStorage', {
            age: Math.round((now - parsedCache.timestamp) / 1000) + ' seconds',
            sources: Object.keys(parsedCache.sourceData || {})
          });
          
          this.cache = parsedCache.data;
          this.lastFetchTime = parsedCache.timestamp;
          this.sourceData = parsedCache.sourceData || this.sourceData;
        }
      }
    } catch (error) {
      console.error('Error initializing profile cache from localStorage:', error);
    }
  }
  
  /**
   * Met à jour le cache dans le localStorage
   * @private
   */
  _updateLocalStorageCache() {
    try {
      localStorage.setItem('profileDataCache', JSON.stringify({
        data: this.cache,
        timestamp: this.lastFetchTime,
        sourceData: this.sourceData
      }));
    } catch (error) {
      console.error('Error updating profile cache in localStorage:', error);
    }
  }
  
  /**
   * Normaliser les données de profil pour garantir une structure cohérente
   * @private
   * @param {Object} data - Données brutes
   * @param {string} source - Source des données (me, consolidated, etc.)
   * @returns {Object} - Données normalisées
   */
  _normalizeProfileData(data, source) {
    if (!data) return null;
    
    console.log(`Normalizing profile data from ${source}:`, {
      id: data?.id,
      format: data?.data ? 'data wrapper' : (data?.user ? 'user wrapper' : 'direct')
    });
    
    // Extraire les données principales selon la source
    let mainData = data;
    if (data.data) {
      mainData = data.data;
    } else if (data.user) {
      mainData = data.user;
    }
    
    // Rechercher l'URL LinkedIn dans différents endroits possibles
    const linkedinUrl = mainData.linkedinUrl || 
                       mainData.user?.linkedinUrl ||
                       mainData.data?.linkedinUrl ||
                       mainData.profile?.linkedinUrl ||
                       mainData.personal?.linkedinUrl ||
                       (mainData.studentProfile && mainData.studentProfile.linkedinUrl) ||
                       null;
    
    // Récupérer les rôles de manière prioritaire de /api/me
    const roles = source === 'me' ? 
                  (mainData.roles || []) : 
                  (this.sourceData.me?.roles || mainData.roles || []);
    
    console.log(`Roles for ${source}:`, {
      'source': source,
      'mainData.roles': mainData.roles,
      'this.sourceData.me?.roles': this.sourceData.me?.roles,
      'finalRoles': roles
    });
    
    // S'assurer que tous les champs nécessaires existent
    const normalized = {
      // Informations de base
      id: mainData.id,
      firstName: mainData.firstName || '',
      lastName: mainData.lastName || '',
      email: mainData.email || '',
      phoneNumber: mainData.phoneNumber || '',
      
      // Informations additionnelles
      roles: roles,
      specialization: mainData.specialization || null,
      linkedinUrl: linkedinUrl,
      profilePictureUrl: mainData.profilePictureUrl || null,
      
      // Adresses et ville
      addresses: Array.isArray(mainData.addresses) ? mainData.addresses : [],
      
      // Données spécifiques étudiant
      studentProfile: mainData.studentProfile || null,
      
      // Métadonnées
      _source: source,
      _timestamp: Date.now()
    };
    
    // Si nous avons trouvé une URL LinkedIn, la propager dans les sous-objets
    if (linkedinUrl) {
      if (!normalized.studentProfile) {
        normalized.studentProfile = {};
      }
      normalized.studentProfile.linkedinUrl = linkedinUrl;
      
      if (!normalized.personal) {
        normalized.personal = {};
      }
      normalized.personal.linkedinUrl = linkedinUrl;
    }
    
    // Extraire la ville des adresses si elle n'est pas définie
    if (!mainData.city && normalized.addresses.length > 0) {
      const firstAddress = normalized.addresses[0];
      normalized.city = firstAddress.city?.name || firstAddress.city || 'Non renseignée';
    } else {
      normalized.city = mainData.city || 'Non renseignée';
    }
    
    return normalized;
  }
  
  /**
   * Fusionne des données de profil nouvelles avec les données existantes
   * @private
   * @param {Object} current - Données actuelles
   * @param {Object} fresh - Nouvelles données
   * @returns {Object} - Données fusionnées
   */
  _mergeProfileData(current, fresh, options = {}) {
    if (!current) return fresh;
    if (!fresh) return current;
    
    const { source = 'unknown', preferCurrent = false } = options;
    
    console.log(`Merging profile data (source: ${source}, preferCurrent: ${preferCurrent}):`, {
      currentSource: current._source,
      freshSource: fresh._source,
      hasCurrentRoles: Array.isArray(current.roles) ? current.roles.length : 0,
      hasFreshRoles: Array.isArray(fresh.roles) ? fresh.roles.length : 0
    });
    
    // Créer un nouvel objet pour éviter de modifier les objets d'origine
    const merged = { ...current };
    
    // PRIORITÉ SPÉCIALE: Toujours préserver les rôles venant de /api/me
    if (this.sourceData.me && Array.isArray(this.sourceData.me.roles) && this.sourceData.me.roles.length > 0) {
      merged.roles = this.sourceData.me.roles;
      console.log('Preserving roles from /api/me:', merged.roles);
    } 
    // Sinon, préserver les rôles si disponibles dans les nouvelles données
    else if (fresh.roles && fresh.roles.length > 0) {
      merged.roles = fresh.roles;
    }
    
    // Préserver les données d'adresse si elles sont disponibles dans les nouvelles données
    if (fresh.addresses && fresh.addresses.length > 0) {
      merged.addresses = fresh.addresses;
      
      // Mise à jour de la ville si elle est disponible dans les adresses
      if (fresh.addresses[0].city) {
        merged.city = fresh.addresses[0].city.name || fresh.addresses[0].city;
      }
    }
    
    // Préserver la ville explicite si elle existe
    if (fresh.city && fresh.city !== 'Non renseignée') {
      merged.city = fresh.city;
    }
    
    // Préserver l'URL LinkedIn si elle existe dans les nouvelles données
    if (fresh.linkedinUrl) {
      merged.linkedinUrl = fresh.linkedinUrl;
      // Propager l'URL LinkedIn dans les sous-objets
      if (!merged.studentProfile) {
        merged.studentProfile = {};
      }
      merged.studentProfile.linkedinUrl = fresh.linkedinUrl;
      
      if (!merged.personal) {
        merged.personal = {};
      }
      merged.personal.linkedinUrl = fresh.linkedinUrl;
    }
    
    // Fusionner les autres champs sélectivement
    Object.keys(fresh).forEach(key => {
      // Ne pas écraser les champs critiques déjà traités
      if (['addresses', 'city', 'roles', 'linkedinUrl', '_source', '_timestamp'].includes(key)) {
        return;
      }
      
      // Ne pas écraser avec des valeurs null ou undefined
      if (fresh[key] !== null && fresh[key] !== undefined) {
        // Si préférence pour les données actuelles et la valeur existe déjà, ne pas écraser
        if (preferCurrent && merged[key] !== null && merged[key] !== undefined) {
          return;
        }
        merged[key] = fresh[key];
      }
    });
    
    // Mettre à jour les métadonnées
    merged._source = `merged:${current._source}+${fresh._source}`;
    merged._timestamp = Date.now();
    
    return merged;
  }
  
  /**
   * Récupérer les données de profil
   * @param {Object} options - Options pour la requête
   * @returns {Promise<Object>} - Données de profil
   */
  async getProfileData(options = {}) {
    console.log('ProfileDataService.getProfileData', { options });
    
    const { forceRefresh = false } = options;
    
    // Utiliser le cache si valide et qu'on ne force pas le rafraîchissement
    if (this.cache && !forceRefresh && (Date.now() - this.lastFetchTime < this.cacheDuration)) {
      console.log('Using valid cache data');
      return this.cache;
    }
    
    // Empêcher plusieurs requêtes simultanées
    if (this.isFetching) {
      console.log('Fetch already in progress, waiting...');
      
      // Attendre la fin de la requête en cours
      return new Promise((resolve) => {
        const checkCache = () => {
          if (!this.isFetching) {
            resolve(this.cache);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        
        checkCache();
      });
    }
    
    this.isFetching = true;
    
    try {
      // Charger les données de manière séquentielle pour éviter les conflits
      await this._fetchAndStoreDataFromSourceIfNeeded('me', forceRefresh);
      await this._fetchAndStoreDataFromSourceIfNeeded('consolidated', forceRefresh);
      
      // Construire les données combinées
      await this._buildCombinedProfileData();
      
      return this.cache;
    } catch (error) {
      console.error('Error fetching profile data:', error);
      throw error;
    } finally {
      this.isFetching = false;
    }
  }
  
  /**
   * Récupère et stocke les données d'une source spécifique si nécessaire
   * @private
   * @param {string} source - Source des données (me, consolidated, etc.)
   * @param {boolean} forceRefresh - Force le rafraîchissement même si le cache est valide
   */
  async _fetchAndStoreDataFromSourceIfNeeded(source, forceRefresh = false) {
    // Vérifier si le cache est valide
    const sourceData = this.sourceData[source];
    const now = Date.now();
    const isValid = sourceData && sourceData._timestamp && (now - sourceData._timestamp < this.cacheDuration);
    
    if (isValid && !forceRefresh) {
      console.log(`Using valid cache for ${source}`);
      return;
    }
    
    console.log(`Fetching fresh data from ${source}...`);
    
    try {
      let data;
      
      // Récupérer les données selon la source
      switch (source) {
        case 'me':
          // Utiliser apiService directement pour éviter les conflits
          const response = await fetch('/api/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error fetching /api/me: ${response.status}`);
          }
          
          data = await response.json();
          break;
        
        case 'consolidated':
          // Utiliser apiService directement pour éviter les conflits
          const consolidatedResponse = await fetch('/api/profile/consolidated', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!consolidatedResponse.ok) {
            throw new Error(`Error fetching /api/profile/consolidated: ${consolidatedResponse.status}`);
          }
          
          data = await consolidatedResponse.json();
          break;
        
        default:
          throw new Error(`Unknown source: ${source}`);
      }
      
      // Normaliser et stocker les données
      const normalizedData = this._normalizeProfileData(data, source);
      this.sourceData[source] = normalizedData;
      this._updateLocalStorageCache();
      
      console.log(`Data fetched and stored for ${source}:`, {
        hasRoles: normalizedData.roles?.length || 0,
        roles: normalizedData.roles
      });
    } catch (error) {
      console.error(`Error fetching data from ${source}:`, error);
      throw error;
    }
  }
  
  /**
   * Construit les données de profil combinées à partir des sources
   * @private
   */
  async _buildCombinedProfileData() {
    // Commencer avec les données de base de l'utilisateur
    let combinedData = this.sourceData.me;
    
    // Fusionner avec les données consolidées si disponibles
    if (this.sourceData.consolidated) {
      combinedData = this._mergeProfileData(
        combinedData,
        this.sourceData.consolidated,
        { source: 'consolidated', preferCurrent: false }
      );
    }
    
    // Vérifier et forcer les rôles depuis /api/me
    if (this.sourceData.me && Array.isArray(this.sourceData.me.roles) && this.sourceData.me.roles.length > 0) {
      combinedData.roles = this.sourceData.me.roles;
      console.log('Final combined data: Enforcing roles from /api/me:', combinedData.roles);
    }
    
    // Mettre à jour le cache
    this.cache = combinedData;
    this.lastFetchTime = Date.now();
    this._updateLocalStorageCache();
    
    // Notifier les abonnés
    this._notifySubscribers();
    
    return combinedData;
  }
  
  /**
   * Mettre à jour les données de profil
   * @param {Object} data - Nouvelles données
   * @returns {Promise<Object>} - Données mises à jour
   */
  async updateProfile(data) {
    try {
      // Mettre à jour le profil via l'API
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Error updating profile: ${response.status}`);
      }
      
      // Forcer le rafraîchissement des données
      await this.getProfileData({ forceRefresh: true });
      
      return this.cache;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
  
  /**
   * S'abonner aux modifications du profil
   * @param {Function} callback - Fonction à appeler lorsque le profil est mis à jour
   * @returns {Function} - Fonction pour se désabonner
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.error('Invalid callback provided to subscribe');
      return () => {};
    }
    
    this.subscribers.push(callback);
    
    // Appeler immédiatement le callback avec les données actuelles si disponibles
    if (this.cache) {
      callback(this.cache);
    }
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notifier tous les abonnés
   * @private
   */
  _notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.cache);
      } catch (error) {
        console.error('Error in profile data subscriber:', error);
      }
    });
  }
  
  /**
   * Invalider le cache
   */
  invalidateCache() {
    this.cache = null;
    this.lastFetchTime = 0;
    this.sourceData = {
      me: null,
      profile: null,
      consolidated: null,
      custom: {}
    };
    
    // Supprimer le cache du localStorage
    try {
      localStorage.removeItem('profileDataCache');
    } catch (error) {
      console.error('Error removing profile cache from localStorage:', error);
    }
  }
}

// Créer une instance unique pour toute l'application
const profileDataService = new ProfileDataService();

export default profileDataService;