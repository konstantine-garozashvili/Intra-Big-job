import apiService from './apiService';
import { getQueryClient } from './queryClient';
import { getSessionId } from './authService';

// Cache pour les données utilisateur
const userDataCache = {
  data: null,
  timestamp: 0,
  isLoading: false,
  loadingPromise: null,
  requestCount: 0,
  pendingRequests: new Map(),
  freshnessDuration: 2 * 60 * 1000,
  maxAgeDuration: 20 * 60 * 1000,
  consecutiveErrors: 0,
  errorThreshold: 3,
  lastCircuitBreak: 0,
  circuitBreakDuration: 15 * 1000,
  events: new EventTarget(),
  currentOperationId: null,
  operationDebounceTime: 100,
  lastOperationTime: 0,
  deduplicationMap: new Map(),
  invalidate() {
    this.data = null;
    this.timestamp = 0;
  }
};

export const USER_DATA_EVENTS = {
  LOADED: 'userData:loaded',
  LOADING: 'userData:loading',
  ERROR: 'userData:error',
  UPDATED: 'userData:updated',
  INVALIDATED: 'userData:invalidated',
  UPDATING: 'userData:updating'
};

const eventThrottleState = {
  lastEventTime: 0,
  pendingEvents: new Map(),
  throttleInterval: 1000
};

const requestRegistry = {
  activeRequests: new Map(),
  routeUsers: new Map(),
  processingRoutes: new Map(),
  requestDebounceTime: 3000,
  lastRequestTime: new Map(),
  requestCountPerRoute: new Map(),
  requestThreshold: 5,
  requestCountResetTime: 10000,

  registerRouteUser(route, componentId) {
    if (!this.routeUsers.has(route)) {
      this.routeUsers.set(route, new Set());
    }
    this.routeUsers.get(route).add(componentId);
  },

  unregisterRouteUser(route, componentId) {
    if (this.routeUsers.has(route)) {
      this.routeUsers.get(route).delete(componentId);
      if (this.routeUsers.get(route).size === 0) {
        this.routeUsers.delete(route);
      }
    }
  },

  isRouteShared(route) {
    return this.routeUsers.has(route) && this.routeUsers.get(route).size > 1;
  },

  markRouteAsProcessing(route) {
    if (this.processingRoutes.has(route)) {
      return false;
    }
    this.processingRoutes.set(route, Date.now());
    return true;
  },

  markRouteAsNotProcessing(route) {
    this.processingRoutes.delete(route);
  },

  isRouteProcessing(route) {
    if (!this.processingRoutes.has(route)) {
      return false;
    }
    const processingTime = Date.now() - this.processingRoutes.get(route);
    if (processingTime > 10000) {
      this.markRouteAsNotProcessing(route);
      return false;
    }
    return true;
  },

  shouldThrottleRequest(route) {
    if (route.includes('/api/me')) {
      return false;
    }
    const now = Date.now();
    if (route.includes('/profile') || route.includes('/user-roles') || route.includes('/user')) {
      if (route === '/profile/consolidated') {
        if (!this.requestCountPerRoute.has(route)) {
          this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
        } else {
          const routeInfo = this.requestCountPerRoute.get(route);
          if (now - routeInfo.timestamp > this.requestCountResetTime) {
            this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
          } else {
            routeInfo.count++;
            if (routeInfo.count > 3) {
              return true;
            }
          }
        }
        if (this.lastRequestTime.has(route)) {
          const lastTime = this.lastRequestTime.get(route);
          const timeSinceLastRequest = now - lastTime;
          if (timeSinceLastRequest < 2000) {
            return true;
          }
        }
        this.lastRequestTime.set(route, now);
        return false;
      }
      if (!this.requestCountPerRoute.has(route)) {
        this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
      } else {
        const routeInfo = this.requestCountPerRoute.get(route);
        if (now - routeInfo.timestamp > this.requestCountResetTime) {
          this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
        } else {
          routeInfo.count++;
        }
      }
      this.lastRequestTime.set(route, now);
      return false;
    }
    if (!this.requestCountPerRoute.has(route)) {
      this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
    } else {
      const routeInfo = this.requestCountPerRoute.get(route);
      if (now - routeInfo.timestamp > this.requestCountResetTime) {
        this.requestCountPerRoute.set(route, { count: 1, timestamp: now });
      } else {
        routeInfo.count++;
        if (routeInfo.count > this.requestThreshold) {
          return true;
        }
      }
    }
    if (!this.lastRequestTime.has(route)) {
      this.lastRequestTime.set(route, now);
      return false;
    }
    const timeSinceLastRequest = now - this.lastRequestTime.get(route);
    if (timeSinceLastRequest < this.requestDebounceTime) {
      return true;
    }
    this.lastRequestTime.set(route, now);
    return false;
  },

  registerActiveRequest(route, promise) {
    this.activeRequests.set(route, promise);
    promise.finally(() => {
      if (this.activeRequests.get(route) === promise) {
        this.activeRequests.delete(route);
      }
    });
    return promise;
  },

  getActiveRequest(route) {
    return this.activeRequests.get(route);
  },

  coordinateRequest(route, requestFn) {
    const activeRequest = this.getActiveRequest(route);
    if (activeRequest) {
      return activeRequest;
    }
    if (this.isRouteProcessing(route)) {
      return Promise.resolve(null);
    }
    this.markRouteAsProcessing(route);
    const request = requestFn().finally(() => {
      this.markRouteAsNotProcessing(route);
    });
    this.registerActiveRequest(route, request);
    return request;
  }
};

const userDataManager = {
  cache: userDataCache,
  requestRegistry,
  subscribers: {},
  stats: {
    requestCount: 0,
    invalidationCount: 0,
    updateCount: 0,
    errorCount: 0,
    lastUpdate: null
  },

  _debugCounters: {
    cacheHits: 0,
    apiCalls: 0,
    lastLogTime: 0,
    logInterval: 5000,
  },

  _log(message, level = 'info', forceLog = false) {
    // Logging removed
  },

  getCachedUserData() {
    if (userDataCache.data) {
      return userDataCache.data;
    }
    try {
      const cachedUserStr = localStorage.getItem('user');
      if (cachedUserStr) {
        const userData = JSON.parse(cachedUserStr);
        userDataCache.data = userData;
        userDataCache.timestamp = Date.now();
        return userData;
      }
    } catch (e) {
      // Logging removed
    }
    return null;
  },

  getUserData(options = {}) {
    const {
      forceRefresh = false,
      useCache = true,
      componentId = 'default',
      requestId = null,
      routeKey = '/api/profile',
      preventRecursion = false
    } = typeof options === 'object' ? options : { forceRefresh: !!options };

    if (!window._userDataRequestDepth) {
      window._userDataRequestDepth = 0;
    }
    if (window._userDataRequestDepth > 2) {
      const cachedData = this.getCachedUserData();
      if (cachedData) {
        return Promise.resolve(cachedData);
      }
    }
    window._userDataRequestDepth++;
    const cleanup = () => {
      window._userDataRequestDepth--;
    };
    try {
      if (forceRefresh) {
        return this._loadUserData(componentId, { preventRecursion, forceRefresh, routeKey }).finally(cleanup);
      }
      if (useCache) {
        const cachedData = userDataCache;
        const now = Date.now();
        if (cachedData && cachedData.data && cachedData.timestamp && now - cachedData.timestamp < 30000) {
          this._debugCounters.cacheHits++;
          cleanup();
          return Promise.resolve(cachedData.data);
        }
      }
      return this._loadUserData(componentId, { preventRecursion, routeKey }).finally(cleanup);
    } catch (error) {
      cleanup();
      return Promise.reject(error);
    }
  },

  async _loadUserData(componentId, options = {}) {
    const { preventRecursion = false, forceRefresh = false, routeKey = '/api/profile' } = options;
    const endpoint = routeKey;
    userDataCache.isLoading = true;
    if (!preventRecursion) {
      this._notifySubscribers(USER_DATA_EVENTS.LOADING);
    }
    const loadPromise = new Promise(async (resolve, reject) => {
      try {
        const apiOptions = {
          noCache: true,
          retries: 2,
          timeout: 12000,
        };
        // Logging removed
        const response = await apiService.get(endpoint, apiOptions);
        let userData = null;
        if (response?.data) {
          userData = response.data;
        } else if (response?.user) {
          userData = response.user;
        } else {
          userData = response;
        }
        if (Array.isArray(userData)) {
          userData = userData[0];
        }
        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid user data format');
        }
        userDataCache.data = userData;
        userDataCache.timestamp = Date.now();
        userDataCache.isLoading = false;
        userDataCache.consecutiveErrors = 0;
        if (!preventRecursion) {
          this._notifySubscribers(USER_DATA_EVENTS.LOADED, userData);
          this._notifySubscribers(USER_DATA_EVENTS.UPDATED, userData);
        }
        resolve(userData);
      } catch (error) {
        userDataCache.isLoading = false;
        userDataCache.consecutiveErrors++;
        if (userDataCache.consecutiveErrors >= userDataCache.errorThreshold) {
          userDataCache.lastCircuitBreak = Date.now();
        }
        this._notifySubscribers(USER_DATA_EVENTS.ERROR, error);
        if (userDataCache.data) {
          resolve(userDataCache.data);
        } else {
          try {
            const cachedUserStr = localStorage.getItem('user');
            if (cachedUserStr) {
              return JSON.parse(cachedUserStr);
            }
          } catch (e) {
            // Logging removed
          }
          reject(error);
        }
      } finally {
        setTimeout(() => {
          userDataCache.pendingRequests.delete(endpoint);
        }, 0);
      }
    });
    userDataCache.pendingRequests.set(endpoint, loadPromise);
    return loadPromise;
  },

  isLoading() {
    return userDataCache.isLoading;
  },

  invalidateCache(updateType = null, options = {}) {
    try {
      if (this.stats) {
        this.stats.invalidationCount = (this.stats.invalidationCount || 0) + 1;
        this.stats.lastUpdate = Date.now();
      }
      if (typeof userDataCache.invalidate === 'function') {
        userDataCache.invalidate();
      } else {
        userDataCache.data = null;
        userDataCache.timestamp = 0;
      }
      const queryClient = getQueryClient();
      if (queryClient) {
        try {
          queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
          if (updateType) {
            switch (updateType) {
              case 'profile_picture':
                queryClient.invalidateQueries({ queryKey: ['profilePicture'] });
                break;
              case 'address':
                queryClient.invalidateQueries({ queryKey: ['userAddress'] });
                break;
            }
          }
        } catch (queryError) {
          // Logging removed
        }
      }
      try {
        this._notifySubscribers(USER_DATA_EVENTS.INVALIDATED, updateType);
        this._notifySubscribers(USER_DATA_EVENTS.UPDATING, updateType);
      } catch (notifyError) {
        // Logging removed
      }
      if (options && options.skipRefresh) {
        // Logging removed
        try {
          this._notifySubscribers(USER_DATA_EVENTS.UPDATED, updateType, null, { isPartialUpdate: true });
        } catch (notifyError) {
          // Logging removed
        }
        return Promise.resolve(null);
      }
      return this._loadUserData('invalidateCache')
        .then(data => {
          try {
            this._notifySubscribers(USER_DATA_EVENTS.UPDATED, updateType, data);
          } catch (notifyError) {
            // Logging removed
          }
          return data;
        })
        .catch(error => {
          try {
            this._notifySubscribers(USER_DATA_EVENTS.ERROR, error);
          } catch (notifyError) {
            // Logging removed
          }
          throw error;
        });
    } catch (error) {
      // Logging removed
      return Promise.resolve(null);
    }
  },

  _notifySubscribers(eventName, ...args) {
    if (!this.subscribers) {
      this.subscribers = {};
      return;
    }
    if (!this._recentNotifications) {
      this._recentNotifications = {};
    }
    const now = Date.now();
    const dataHash = args[0] ? JSON.stringify(args[0]).substring(0, 50) : 'no-data';
    const notificationId = `${eventName}_${dataHash}`;
    if (this._recentNotifications[notificationId] &&
        now - this._recentNotifications[notificationId] < 500) {
      // Logging removed
      return;
    }
    this._recentNotifications[notificationId] = now;
    Object.keys(this._recentNotifications).forEach(key => {
      if (now - this._recentNotifications[key] > 5000) {
        delete this._recentNotifications[key];
      }
    });
    setTimeout(() => {
      if (this.subscribers[eventName]) {
        const subscribers = [...this.subscribers[eventName]];
        subscribers.forEach(callback => {
          try {
            callback(...args);
          } catch (error) {
            // Logging removed
          }
        });
      }
    }, 0);
  },

  subscribe(eventName, callback) {
    if (!Object.values(USER_DATA_EVENTS).includes(eventName)) {
      return () => {};
    }
    if (!this.subscribers) {
      this.subscribers = {};
    }
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = [];
    }
    this.subscribers[eventName].push(callback);
    return () => {
      const index = this.subscribers[eventName].indexOf(callback);
      if (index !== -1) {
        this.subscribers[eventName].splice(index, 1);
      }
    };
  },

  getStats() {
    const now = Date.now();
    return {
      requestCount: userDataCache.requestCount,
      lastUpdated: userDataCache.timestamp ? new Date(userDataCache.timestamp).toISOString() : null,
      dataAge: userDataCache.timestamp ? now - userDataCache.timestamp : null,
      consecutiveErrors: userDataCache.consecutiveErrors,
      pendingRequests: Array.from(userDataCache.pendingRequests.keys()),
      isCircuitBreakerActive: userDataCache.consecutiveErrors >= userDataCache.errorThreshold &&
        (now - userDataCache.lastCircuitBreak < userDataCache.circuitBreakDuration),
      deduplicationMapSize: userDataCache.deduplicationMap.size,
      deduplicationEntries: Array.from(userDataCache.deduplicationMap.entries()).map(([key, entry]) => ({
        key,
        age: now - entry.timestamp
      })),
      cacheStatus: userDataCache.data ? (
        now - userDataCache.timestamp < userDataCache.freshnessDuration 
          ? 'fresh' 
          : now - userDataCache.timestamp < userDataCache.maxAgeDuration
            ? 'stale'
            : 'expired'
      ) : 'empty',
      hasCachedData: !!userDataCache.data,
      isLoading: userDataCache.isLoading
    };
  },

  coordinateRequest(route, componentId, requestFn) {
    this.requestRegistry.registerRouteUser(route, componentId);
    if (route.includes('/api/me')) {
      const now = Date.now();
      const cachedData = this.getCachedUserData();
      if (cachedData && userDataCache.timestamp && (now - userDataCache.timestamp < 30000)) {
        this._debugCounters.cacheHits++;
        return Promise.resolve(cachedData);
      }
      const activeRequest = this.requestRegistry.getActiveRequest(route);
      if (activeRequest) {
        return activeRequest;
      }
      this._debugCounters.apiCalls++;
      const request = requestFn().then(response => {
        userDataCache.data = response;
        userDataCache.timestamp = Date.now();
        try {
          localStorage.setItem('user', JSON.stringify(response));
        } catch (e) {
          // Logging removed
        }
        return response;
      });
      this.requestRegistry.registerActiveRequest(route, request);
      return request;
    }
    const isCriticalRoute = route.includes('/profile') || 
                           route.includes('/user-roles') || 
                           route.includes('/user');
    if (isCriticalRoute) {
      const activeRequest = this.requestRegistry.getActiveRequest(route);
      if (activeRequest) {
        return activeRequest;
      }
      const request = requestFn();
      this.requestRegistry.registerActiveRequest(route, request);
      return request;
    }
    if (this.requestRegistry.shouldThrottleRequest(route)) {
      const activeRequest = this.requestRegistry.getActiveRequest(route);
      if (activeRequest) {
        return activeRequest;
      }
      return Promise.resolve(null);
    }
    return this.requestRegistry.coordinateRequest(route, requestFn);
  }
};

export default userDataManager;
