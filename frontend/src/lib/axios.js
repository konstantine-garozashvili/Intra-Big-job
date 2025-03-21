import axios from 'axios';

// Cache the token in memory to avoid constantly reading from localStorage
let cachedToken = null;

// Function to get token that uses in-memory cache when possible
const getAuthToken = () => {
  if (!cachedToken) {
    cachedToken = localStorage.getItem('token');
  }
  return cachedToken;
};

// Reset cached token when token changes
window.addEventListener('storage', (event) => {
  if (event.key === 'token') {
    cachedToken = event.newValue;
  }
});

// Configuration de base
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000, // Reduced from 15 seconds to 10 seconds
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  // Désactiver les transformations de réponse qui pourraient perturber le flux
  transformResponse: [(data) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      return data;
    }
  }],
  // Important: empêcher les redirections automatiques qui peuvent 
  // causer des problèmes CORS ou des annulations
  maxRedirects: 0
});

// Configurer des intercepteurs pour les requêtes
axiosInstance.interceptors.request.use(request => {
  // Ajouter le token d'authentification à toutes les requêtes si disponible
  const token = getAuthToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  
  // Set Content-Type only for non-FormData requests
  if (request.data && !(request.data instanceof FormData)) {
    request.headers['Content-Type'] = 'application/json';
  }
  
  return request;
}, error => {
  return Promise.reject(error);
});

// Configure external API instance (for third-party APIs)
export const externalAxiosInstance = axios.create({
  timeout: 5000, // Reduced from 10000 to 5000
  headers: {
    'Accept': 'application/json'
  }
});

// Create API address service instance
export const addressApiInstance = axios.create({
  baseURL: 'https://api-adresse.data.gouv.fr',
  timeout: 3000, // Reduced from 5000 to 3000
  headers: {
    'Accept': 'application/json'
  }
});

export default axiosInstance; 