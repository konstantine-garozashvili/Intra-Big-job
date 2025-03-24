import axios from 'axios';

// Configuration de base
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 15000, // 15 secondes
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
  const token = localStorage.getItem('token');
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
  timeout: 10000,
  headers: {
    'Accept': 'application/json'
  }
});

// Create API address service instance
export const addressApiInstance = axios.create({
  baseURL: 'https://api-adresse.data.gouv.fr',
  timeout: 5000,
  headers: {
    'Accept': 'application/json'
  }
});

export default axiosInstance; 