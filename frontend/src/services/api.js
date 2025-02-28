import axios from 'axios';

// Déterminer l'URL de base en fonction de l'environnement
// En développement, on utilise l'URL du backend Docker
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://votre-domaine-de-production.com' 
  : 'http://localhost:8000';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // Désactiver withCredentials pour éviter les problèmes CORS
    withCredentials: false
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
        if (error.response) {
            // La requête a été faite et le serveur a répondu avec un code d'état
            // qui n'est pas dans la plage 2xx
            console.error('Erreur de réponse:', {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            // La requête a été faite mais aucune réponse n'a été reçue
            console.error('Erreur de réseau:', error.request);
        } else {
            // Une erreur s'est produite lors de la configuration de la requête
            console.error('Erreur de configuration:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api; 