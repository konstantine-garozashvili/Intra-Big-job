import axios from 'axios';

// Configuration de l'instance Axios avec la base URL pour l'API
const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur pour les requêtes - ajoute le token d'authentification
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses - gestion des erreurs et du rafraîchissement du token
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Gérer les erreurs 401 (non authentifié)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient; 