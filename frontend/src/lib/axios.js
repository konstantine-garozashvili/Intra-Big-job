import axios from 'axios';

// Constante pour la longueur maximale du mot de passe
const MAX_PASSWORD_LENGTH = 50;

// Configuration de base
const axiosInstance = axios.create({
  baseURL: 'http://localhost/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  transformResponse: [data => {
    // Retourner les données directement si elles sont déjà un objet
    if (typeof data !== 'string') return data;
    
    // Sinon, essayer de parser en JSON seulement si c'est une chaîne
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }],
  // Important: empêcher les redirections automatiques qui peuvent 
  // causer des problèmes CORS ou des annulations
  maxRedirects: 0
});

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  config => {
    // Vérifier si c'est une requête d'inscription
    if (config.url?.includes('/register') && config.method === 'post' && config.data) {
      // Vérifier si un mot de passe est présent
      if (config.data.password && typeof config.data.password === 'string') {
        // Mesurer la longueur exacte du mot de passe en caractères
        const passwordLength = config.data.password.length;
        
        // Blocage strict et systématique si le mot de passe dépasse la limite
        if (passwordLength > MAX_PASSWORD_LENGTH) {
          console.error(`[axios interceptor] BLOCAGE CRITIQUE: Mot de passe trop long (${passwordLength} caractères). La requête a été bloquée.`);
          
          // Tronquer le mot de passe dans les données (défense en profondeur)
          // Ne pas modifier l'objet original en cas d'erreur
          const modifiedData = { ...config.data };
          modifiedData.password = modifiedData.password.substring(0, MAX_PASSWORD_LENGTH);
          config.data = modifiedData;
          
          // Créer une erreur et rejeter la requête
          const error = new Error(`Le mot de passe ne doit pas dépasser ${MAX_PASSWORD_LENGTH} caractères`);
          error.name = 'PasswordTooLongError';
          error.code = 'PASSWORD_TOO_LONG';
          error.config = config;
          error.request = { status: 400 };
          error.response = {
            status: 400,
            data: {
              success: false,
              message: `Le mot de passe ne doit pas dépasser ${MAX_PASSWORD_LENGTH} caractères`,
              errors: {
                password: 'Longueur maximale dépassée'
              }
            }
          };
          
          return Promise.reject(error);
        }
      }
    }
    
    // Récupérer le token depuis le localStorage si disponible
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Set Content-Type only for non-FormData requests
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  error => {
    console.error('[axios interceptor] Erreur de requête:', error);
    return Promise.reject(error);
  }
);

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