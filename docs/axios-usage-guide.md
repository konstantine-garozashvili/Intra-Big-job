# Guide d'utilisation d'Axios dans le projet

Ce document explique comment utiliser Axios de manière standardisée dans tout le projet.

## 🌐 Configuration centralisée

Nous utilisons une configuration centralisée pour Axios, définie dans `frontend/src/lib/axios.js`. Cette configuration fournit plusieurs instances préconfigurées pour différents cas d'utilisation.

### Instances disponibles

```javascript
// Import standard pour les API du backend
import axiosInstance from '@/lib/axios';

// Import spécifique pour les API externes
import { externalAxiosInstance, addressApiInstance } from '@/lib/axios';
```

## 📋 Instances disponibles

1. **axiosInstance** - Instance principale pour communiquer avec notre API backend
   - Pré-configurée avec l'URL de base depuis les variables d'environnement
   - Ajoute automatiquement le token d'authentification à chaque requête
   - Gère correctement les requêtes FormData

2. **addressApiInstance** - Instance pour l'API d'adresses du gouvernement français
   - Pré-configurée avec l'URL `https://api-adresse.data.gouv.fr`
   - Optimisée pour les requêtes de géocodage

3. **externalAxiosInstance** - Instance pour les API tierces
   - Configurée avec des paramètres plus génériques
   - À utiliser pour toute API externe autre que l'API d'adresses

## 🔧 Utilisation de base

Voici comment utiliser l'instance Axios principale pour communiquer avec l'API backend :

```javascript
import axiosInstance from '@/lib/axios';

// Exemple de requête GET
async function fetchData() {
  try {
    const response = await axiosInstance.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Exemple de requête POST avec des données JSON
async function createResource(data) {
  try {
    const response = await axiosInstance.post('/endpoint', data);
    return response.data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
}

// Exemple avec FormData
async function uploadFile(formData) {
  try {
    // Pas besoin de définir le Content-Type pour FormData
    // axiosInstance le gère automatiquement
    const response = await axiosInstance.post('/upload', formData);
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
```

## 🔀 Utilisation avec l'API d'adresses

```javascript
import { addressApiInstance } from '@/lib/axios';

async function searchAddress(query) {
  try {
    const response = await addressApiInstance.get('/search', {
      params: {
        q: query,
        limit: 5
      }
    });
    return response.data.features;
  } catch (error) {
    console.error('Error searching address:', error);
    return [];
  }
}
```

## 🔰 Bonnes pratiques

1. **Toujours utiliser les instances centralisées** - N'importez jamais Axios directement dans vos composants ou services
2. **Utiliser apiService pour les fonctionnalités avancées** - Pour des besoins comme la mise en cache, le retry automatique, utilisez `apiService` qui est construit sur notre instance Axios
3. **Gestion des erreurs** - Toujours inclure un bloc try/catch et capturer les erreurs de manière spécifique
4. **Chemins relatifs** - Utilisez des chemins relatifs (e.g., `/endpoint` au lieu de `http://localhost:8000/api/endpoint`)
5. **Données de retour** - Utilisez `response.data` pour accéder aux données retournées

## 🧩 Intégration avec React Query

Pour une intégration optimale avec React Query, utilisez les instances Axios dans vos fonctions de requête :

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

// Fonction de requête utilisant axiosInstance
const fetchPosts = async () => {
  const response = await axiosInstance.get('/posts');
  return response.data;
};

// Hook React Query
export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });
}

// Mutation avec axios
export function useCreatePost() {
  return useMutation({
    mutationFn: async (newPost) => {
      const response = await axiosInstance.post('/posts', newPost);
      return response.data;
    }
  });
}
```

## 🚫 Pratiques à éviter

1. Ne pas importer Axios directement :
   ```javascript
   // ❌ À éviter
   import axios from 'axios';
   
   // ✅ Utiliser à la place
   import axiosInstance from '@/lib/axios';
   ```

2. Ne pas définir des URL en dur :
   ```javascript
   // ❌ À éviter
   axios.get('http://localhost:8000/api/endpoint');
   
   // ✅ Utiliser à la place
   axiosInstance.get('/endpoint');
   ```

3. Ne pas créer de nouvelles instances Axios :
   ```javascript
   // ❌ À éviter
   const newAxiosInstance = axios.create({ /* ... */ });
   
   // ✅ Utiliser les instances existantes
   import { axiosInstance, externalAxiosInstance } from '@/lib/axios';
   ``` 