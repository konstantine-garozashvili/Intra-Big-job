# Gestionnaire d'État Utilisateur Centralisé

Ce document décrit le fonctionnement et l'utilisation du gestionnaire d'état utilisateur centralisé mis en place pour améliorer les performances et réduire les requêtes redondantes vers l'API.

## Problème résolu

Avant cette mise en place, l'application souffrait de plusieurs problèmes :

1. **Requêtes multiples et redondantes** : Plusieurs composants effectuaient des appels indépendants pour récupérer les mêmes données utilisateur (`/api/me`, `/profile/me`, `/profile/consolidated`).
2. **Annulations et échecs de requêtes** : Des requêtes étaient annulées ou échouaient lorsque trop de requêtes étaient effectuées en parallèle.
3. **Temps de chargement excessif** : Sur les appareils moins performants, le temps de chargement initial pouvait atteindre 50 secondes.
4. **Absence de stratégie de cache cohérente** : Chaque service avait sa propre logique de mise en cache.

## Solution mise en place

Le gestionnaire d'état utilisateur centralisé (`userDataManager`) offre une solution unique pour tous les composants qui ont besoin de données utilisateur :

1. **Point d'accès unique** : Toutes les requêtes pour les données utilisateur passent par ce gestionnaire.
2. **Cache intelligent** : Les données sont mises en cache pendant une durée configurable et rechargées en arrière-plan si nécessaires.
3. **Évitement des requêtes parallèles** : Une requête en cours est réutilisée plutôt que d'en lancer une nouvelle.
4. **Circuit breaker** : Prévient les cycles de requêtes échouées en bloquant temporairement les nouvelles requêtes après plusieurs échecs consécutifs.
5. **Intégration avec React Query** : Maintient le cache React Query à jour pour garantir la cohérence entre les composants.

## Architecture

```
┌─────────────────┐
│    Composants   │
│  React (hooks)  │
└────────┬────────┘
         │
         ▼
┌────────────────┐        ┌─────────────────┐
│  useUserData   │───────▶│  userDataManager │
└────────────────┘        └────────┬─────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │    apiService   │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │      API        │
                          └─────────────────┘
```

## Comment utiliser le gestionnaire

### Utilisation dans les composants React

Dans tous les composants qui ont besoin des données utilisateur, utilisez le hook `useUserData` :

```jsx
import { useUserData } from '@/hooks';

function MonComposant() {
  const { 
    user,            // Données utilisateur 
    isLoading,       // Indicateur de chargement
    isStudent,       // Vrai si l'utilisateur est un étudiant
    isTeacher,       // Vrai si l'utilisateur est un formateur
    isAdmin,         // Vrai si l'utilisateur est un administrateur
    forceRefresh     // Fonction pour forcer un rechargement des données
  } = useUserData();

  // Utilisation des données utilisateur
  return (
    <div>
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <p>Bonjour, {user.firstName} {user.lastName}</p>
      )}
    </div>
  );
}
```

#### Options disponibles

Le hook `useUserData` accepte plusieurs options :

```jsx
const { user } = useUserData({
  preferComprehensiveData: true, // Utilise '/profile/consolidated' au lieu de '/api/me'
  enabled: true,                 // Active ou désactive la requête
  onSuccess: (data) => {},       // Callback appelé en cas de succès
  onError: (error) => {}         // Callback appelé en cas d'erreur
});
```

### Utilisation dans les services

Dans les services, vous pouvez utiliser directement `userDataManager` :

```js
import userDataManager from '@/lib/services/userDataManager';

async function maFonction() {
  try {
    const userData = await userDataManager.getUserData({
      forceRefresh: true,       // Force une nouvelle requête même si les données sont fraîches
      routeKey: '/api/me',      // Route API à utiliser ('/api/me' ou '/profile/consolidated')
      maxAge: 5 * 60 * 1000,    // Âge maximal des données en ms (5 minutes)
      useCache: true            // Utilise les données en cache si disponibles
    });
    
    // Utilisation des données
    return userData;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    throw error;
  }
}
```

### Événements et abonnements

Vous pouvez vous abonner aux événements du gestionnaire de données :

```js
import userDataManager, { USER_DATA_EVENTS } from '@/lib/services/userDataManager';

// S'abonner à l'événement de mise à jour des données
const unsubscribe = userDataManager.subscribe(USER_DATA_EVENTS.UPDATED, (userData) => {
  console.log('Données utilisateur mises à jour:', userData);
});

// Se désabonner quand c'est nécessaire
unsubscribe();
```

## Migration des composants existants

Pour migrer les composants existants vers cette nouvelle architecture :

1. Remplacez les appels directs à `authService.getCurrentUser()` par `useUserData()`
2. Remplacez les appels à `profileService.getAllProfileData()` par `useUserData({ preferComprehensiveData: true })`
3. Remplacez les appels directs à `apiService.get('/api/me')` par `userDataManager.getUserData()`

## Avantages

- **Réduction des requêtes** : De 50+ requêtes à seulement 3-4 requêtes pour charger l'application
- **Prévention des requêtes redondantes** : Évite les requêtes parallèles pour les mêmes données
- **Meilleure gestion des erreurs** : Circuit breaker pour éviter les cycles d'échecs
- **Performance améliorée** : Temps de chargement réduit, particulièrement sur les appareils moins performants
- **Cohérence des données** : Une seule source de vérité pour les données utilisateur
- **Rechargement intelligent** : Actualisation en arrière-plan sans bloquer l'interface utilisateur

## À éviter

- N'utilisez pas directement `apiService.get('/api/me')` ou `apiService.get('/profile/consolidated')` dans les nouveaux composants
- Ne créez pas de nouveaux hooks qui dupliquent la fonctionnalité de `useUserData`
- Ne modifiez pas directement les données utilisateur sans passer par `userDataManager.invalidateCache()` 