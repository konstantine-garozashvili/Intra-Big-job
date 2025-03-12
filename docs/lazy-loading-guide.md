# Guide d'Implémentation du Lazy Loading

## Introduction

Ce guide explique comment implémenter le lazy loading (chargement paresseux) dans le frontend de notre application. Le lazy loading est une technique qui permet de n'effectuer les requêtes API et de charger les données seulement lorsque c'est nécessaire, et non pas systématiquement au montage des composants.

## Avantages du Lazy Loading

- **Performance améliorée** : Réduit le nombre d'appels API inutiles
- **Expérience utilisateur optimisée** : Les composants s'affichent plus rapidement
- **Économie de ressources** : Moins de données sont transférées entre le client et le serveur
- **Réduction de la charge serveur** : Moins de requêtes simultanées vers l'API

## Hooks Disponibles

Nous avons implémenté trois hooks personnalisés pour faciliter l'implémentation du lazy loading :

### 1. useDataFetching

Ce hook permet un contrôle manuel sur le moment où les données sont chargées.

```jsx
import { useDataFetching } from '@/hooks/useDataFetching';

const { 
  data,           // Données récupérées
  loading,        // État de chargement
  error,          // Erreur éventuelle
  fetchData,      // Fonction pour déclencher le chargement
  reset,          // Fonction pour réinitialiser l'état
  hasLoaded       // Indique si les données ont déjà été chargées
} = useDataFetching(fetchFunction, {
  loadOnMount: false,           // Charger au montage du composant ?
  dependencies: [],             // Dépendances pour déclencher un rechargement
  keepPreviousData: true        // Conserver les données précédentes pendant le chargement
});
```

### 2. useVisibilityFetch

Ce hook déclenche le chargement des données lorsqu'un composant devient visible dans le viewport.

```jsx
import { useVisibilityFetch } from '@/hooks/useDataFetching';

const { 
  data,           // Données récupérées
  loading,        // État de chargement
  error,          // Erreur éventuelle
  elementRef,     // Référence à attacher à l'élément à observer
  isVisible,      // Indique si l'élément est visible
  hasLoaded,      // Indique si les données ont déjà été chargées
  fetchData       // Fonction pour forcer le chargement
} = useVisibilityFetch(fetchFunction, {
  triggerOnce: true,            // Ne déclencher qu'une seule fois ?
  threshold: 0.1,               // Seuil de visibilité (0-1)
  dependencies: []              // Dépendances pour réinitialiser l'observateur
});
```

### 3. useInteractionFetch

Ce hook charge les données uniquement après une interaction spécifique de l'utilisateur.

```jsx
import { useInteractionFetch } from '@/hooks/useDataFetching';

const { 
  data,           // Données récupérées
  loading,        // État de chargement
  error,          // Erreur éventuelle
  fetchData,      // Fonction pour déclencher le chargement
  hasLoaded,      // Indique si les données ont déjà été chargées
  reset           // Fonction pour réinitialiser l'état
} = useInteractionFetch(fetchFunction);
```

## Quand Utiliser Chaque Hook

- **useDataFetching** : Pour les données critiques qui doivent être chargées sous certaines conditions
- **useVisibilityFetch** : Pour les sections plus bas dans la page qui ne sont pas immédiatement visibles
- **useInteractionFetch** : Pour les données qui ne sont nécessaires qu'après une action utilisateur

## Implémentation Dans Les Composants Existants

### Avant/Après : Exemple de Refactorisation

#### Avant (Chargement au montage)

```jsx
import React, { useState, useEffect } from 'react';
import { someService } from '@/services/someService';

const ExampleComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await someService.getData();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Rendu du composant...
};
```

#### Après (Lazy Loading avec useVisibilityFetch)

```jsx
import React from 'react';
import { useVisibilityFetch } from '@/hooks/useDataFetching';
import { someService } from '@/services/someService';

const ExampleComponent = () => {
  const { 
    data, 
    loading, 
    error, 
    elementRef 
  } = useVisibilityFetch(someService.getData);

  return (
    <div ref={elementRef}>
      {/* Rendu du composant... */}
    </div>
  );
};
```

## Guide d'Implémentation Étape par Étape

### 1. Identifier les Composants à Refactoriser

Analysez les composants qui effectuent des appels API au montage et déterminez s'ils peuvent bénéficier du lazy loading. Les candidats idéaux sont :

- Les sections de la page qui ne sont pas immédiatement visibles
- Les composants affichant des données non critiques
- Les fonctionnalités accessibles uniquement après une interaction utilisateur

### 2. Choisir le Hook Approprié

Selon le cas d'utilisation, choisissez le hook le plus adapté :

- **useDataFetching** : Pour un contrôle manuel, ou chargement conditionnel
- **useVisibilityFetch** : Pour les sections plus bas dans la page
- **useInteractionFetch** : Pour les données liées à une action utilisateur

### 3. Implémenter le Hook

Remplacez la logique existante de chargement de données par le hook choisi.

### 4. Tester l'Implémentation

Vérifiez que :
- Les données se chargent correctement au moment approprié
- Les états de chargement et d'erreur sont correctement gérés
- L'expérience utilisateur est fluide

## Bonnes Pratiques

1. **Ne pas tout charger paresseusement** : Les données critiques nécessaires au rendu initial devraient toujours être chargées immédiatement.

2. **Prévoir des états de chargement appropriés** : Utilisez des placeholders, des skeletons ou des loaders pour indiquer que les données sont en cours de chargement.

3. **Gestion des erreurs** : Implémentez une gestion robuste des erreurs pour chaque chargement paresseux.

4. **Prévenir les chargements en cascade** : Évitez les situations où un chargement paresseux déclenche un autre chargement paresseux, créant une cascade de requêtes.

5. **Mise en cache des données** : Pour les données fréquemment accédées, envisagez d'implémenter une stratégie de mise en cache côté client.

## Exemples Concrets

### 1. Lazy Loading pour un Tableau de Données

```jsx
import React from 'react';
import { useVisibilityFetch } from '@/hooks/useDataFetching';
import { dataService } from '@/services/dataService';
import DataTable from '@/components/DataTable';
import { Skeleton } from '@/components/ui/skeleton';

const DataSection = () => {
  const { 
    data, 
    loading, 
    error, 
    elementRef 
  } = useVisibilityFetch(dataService.getTableData);

  return (
    <section ref={elementRef} className="data-section my-8">
      <h2 className="text-2xl font-bold mb-4">Données Statistiques</h2>
      
      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          Une erreur est survenue lors du chargement des données
        </div>
      )}
      
      {data && <DataTable data={data} />}
    </section>
  );
};
```

### 2. Lazy Loading pour un Dashboard Analytics

```jsx
import React from 'react';
import { useInteractionFetch } from '@/hooks/useDataFetching';
import { analyticsService } from '@/services/analyticsService';
import { Button } from '@/components/ui/button';
import AnalyticsChart from '@/components/AnalyticsChart';

const AnalyticsDashboard = () => {
  const { 
    data, 
    loading, 
    error, 
    fetchData,
    hasLoaded
  } = useInteractionFetch(analyticsService.getDetailedStats);

  return (
    <div className="analytics-section p-6 border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Statistiques Détaillées</h2>
        
        {!hasLoaded && (
          <Button 
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Charger les statistiques'}
          </Button>
        )}
      </div>
      
      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error.message || 'Erreur lors du chargement des statistiques'}
        </div>
      )}
      
      {data && <AnalyticsChart data={data} />}
    </div>
  );
};
```

## Conclusion

L'implémentation du lazy loading dans notre application frontend a pour objectif d'améliorer considérablement les performances et l'expérience utilisateur. En ne chargeant les données que lorsqu'elles sont réellement nécessaires, nous réduisons la charge sur le serveur et accélérons le rendu initial des pages.

Utilisez les hooks fournis et suivez les bonnes pratiques pour implémenter efficacement cette stratégie dans les composants existants et nouveaux. 