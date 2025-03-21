# Synchronisation des Timeouts Adaptatifs

Ce document explique comment les timeouts adaptatifs sont synchronisés entre le backend et le frontend de l'application.

## Architecture globale

L'architecture de synchronisation des timeouts adaptatifs comprend :

1. **Backend (Symfony)** : Détecte les capacités matérielles du serveur et calcule les timeouts appropriés
2. **API de configuration** : Expose les paramètres de timeout aux clients via une API REST
3. **Frontend (React)** : Consomme l'API et applique les timeouts aux requêtes HTTP

## Flux de synchronisation

1. Au démarrage de l'application frontend, celle-ci effectue une requête à l'API `/api/timeout-config` du backend
2. Le backend renvoie la configuration actuelle (timeouts et mode de performance)
3. Le frontend met à jour ses valeurs de timeout et son mode de performance en fonction de la réponse
4. Les requêtes HTTP ultérieures utilisent ces valeurs de timeout

## Composants backend

### TimeoutService

Service Symfony qui détecte les capacités du serveur et détermine les valeurs de timeout appropriées :

```php
// backend/src/Service/TimeoutService.php
class TimeoutService
{
    // Constantes définissant les valeurs de timeout (en secondes)
    private const DEFAULT_TIMEOUT = 30;          // Timeout standard
    private const LOW_PERF_TIMEOUT = 45;         // Timeout standard en mode basse performance
    private const PROFILE_REQUEST_TIMEOUT = 20;  // Timeout pour requêtes de profil
    private const LOW_PERF_PROFILE_REQUEST_TIMEOUT = 30; // Timeout profil en mode basse perf.
    
    // ...
    
    public function getTimeout(bool $isProfileRequest = false): int
    {
        $isLowPerformance = $this->isLowPerformanceEnvironment();
        
        if ($isProfileRequest) {
            return $isLowPerformance ? self::LOW_PERF_PROFILE_REQUEST_TIMEOUT : self::PROFILE_REQUEST_TIMEOUT;
        }
        
        return $isLowPerformance ? self::LOW_PERF_TIMEOUT : self::DEFAULT_TIMEOUT;
    }
    
    // ...
}
```

### TimeoutApiController

Contrôleur Symfony qui expose la configuration de timeout via une API REST :

```php
// backend/src/Controller/TimeoutApiController.php
class TimeoutApiController extends AbstractController
{
    // ...
    
    #[Route('/api/timeout-config', name: 'config', methods: ['GET'])]
    public function getTimeoutConfig(Request $request): JsonResponse
    {
        $isLowPerformance = $this->timeoutService->isLowPerformanceEnvironment();
        
        // Get timeout values
        $defaultTimeout = $this->timeoutService->getTimeout(false);
        $profileTimeout = $this->timeoutService->getTimeout(true);
        
        return new JsonResponse([
            'isLowPerformance' => $isLowPerformance,
            'timeouts' => [
                'default' => $defaultTimeout * 1000, // Convert to milliseconds for frontend
                'profile' => $profileTimeout * 1000,
                'large' => $defaultTimeout * 2 * 1000, // Double timeout for large requests
            ],
            'serverTimestamp' => time(),
            'serverPerformanceMode' => $isLowPerformance ? 'low' : 'normal',
        ]);
    }
}
```

## Composants frontend

### LoadingUtils

Utilitaires pour la gestion des timeouts côté frontend :

```javascript
// frontend/src/lib/utils/loadingUtils.js
import axios from 'axios';

// Configuration des timeouts
let timeoutConfig = {
  default: 30000,  // 30 secondes par défaut
  profile: 20000,  // 20 secondes pour les requêtes de profil
  large: 60000     // 60 secondes pour les transferts volumineux
};

// Fonction de synchronisation avec le serveur
export const syncWithServerPerformanceMode = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const response = await axios.get(`${apiUrl}/timeout-config`, {
      timeout: 5000, // Timeout court pour cette requête
    });
    
    if (response.data && typeof response.data.isLowPerformance === 'boolean') {
      // Mise à jour du mode performance
      setLowPerformanceMode(response.data.isLowPerformance);
      
      // Mise à jour des timeouts
      if (response.data.timeouts) {
        timeoutConfig = {
          default: response.data.timeouts.default || timeoutConfig.default,
          profile: response.data.timeouts.profile || timeoutConfig.profile,
          large: response.data.timeouts.large || timeoutConfig.large
        };
      }
      
      return response.data.isLowPerformance;
    }
  } catch (error) {
    console.warn('Failed to sync with server performance mode:', error.message);
  }
  
  // Fallback sur la détection côté client
  return detectLowPerformanceMode();
};

// Fonction pour récupérer les valeurs de timeout
export const getTimeoutConfig = (type = 'default') => {
  return timeoutConfig[type] || timeoutConfig.default;
};

// ...
```

### ApiService

Service qui applique les timeouts aux requêtes HTTP :

```javascript
// frontend/src/lib/services/apiService.js
import axios from 'axios';
import { isLowPerformanceModeEnabled, getTimeoutConfig } from '../utils/loadingUtils';

// Fonction pour obtenir le timeout approprié
const getDefaultTimeout = (isProfileRequest = false) => {
  if (isProfileRequest) {
    return getTimeoutConfig('profile');
  }
  
  return getTimeoutConfig('default');
};

// Intercepteur de requêtes pour appliquer les timeouts
axios.interceptors.request.use(request => {
  // ...
  
  // Application du timeout adaptatif
  if (!request.timeout) {
    const isProfileRequest = request.url && (request.url.includes('/profile/') || request.url.includes('/me'));
    request.timeout = getDefaultTimeout(isProfileRequest);
  }
  
  // ...
  
  return request;
}, error => {
  console.error('Erreur lors de la préparation de la requête:', error);
  return Promise.reject(error);
});

// ...
```

## Interface utilisateur

L'application comprend un composant `PerformanceSettings` qui permet de visualiser les paramètres de performance et de forcer un mode de performance spécifique. Ce composant :

1. Affiche le mode de performance actuel (normal ou réduite)
2. Montre les valeurs de timeout actuelles
3. Affiche les métriques système détectées par le backend
4. Permet de basculer manuellement entre les modes de performance
5. Permet de se synchroniser avec le serveur

## Mécanismes de fallback

Si la synchronisation avec le serveur échoue :

1. Le frontend utilise sa propre détection de performance basée sur :
   - Les préférences stockées dans localStorage
   - La détection de matériel (nombre de cœurs CPU)
   - L'agent utilisateur (détection d'appareils mobiles ou anciens)

2. Le backend utilise des valeurs par défaut raisonnables si les métriques système ne sont pas disponibles.

## Considérations de performance

- Les résultats de détection sont mis en cache (côté serveur et client) pour minimiser l'impact
- La synchronisation a lieu principalement au chargement initial de l'application
- Les timeouts sont ajustés en fonction du type de requête pour optimiser l'expérience utilisateur 