import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    credentials: 'include'
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
    config => {
        console.log('Requête envoyée:', config);
        return config;
    },
    error => {
        console.error('Erreur de requête:', error);
        return Promise.reject(error);
    }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
    response => {
        console.log('Réponse reçue:', response);
        return response;
    },
    error => {
        console.error('Erreur de réponse:', error);
        return Promise.reject(error);
    }
);

export default api; 