# Système de Timeout Adaptatif

Ce document décrit le système de timeout adaptatif mis en place dans l'application. Ce système permet d'ajuster automatiquement les valeurs de timeout en fonction des capacités de la machine hôte.

## Objectifs

- Optimiser les performances de l'application en adaptant les timeouts
- Éviter les timeouts trop courts sur des machines à faibles ressources
- Éviter les timeouts trop longs sur des machines performantes
- Appliquer différentes stratégies de timeout selon le type de requête

## Architecture

Le système de timeout adaptatif est composé des éléments suivants :

1. **TimeoutService** : Service principal qui détecte les capacités de la machine et calcule les timeouts adaptés
2. **HttpTimeoutListener** : Écouteur d'événements qui applique automatiquement les timeouts aux requêtes entrantes
3. **HttpClientFactory** : Factory qui crée des instances de HttpClient avec les timeouts adaptés

### Détection des performances

Le service `TimeoutService` analyse plusieurs métriques du système pour déterminer si l'environnement est à "basse performance" :

- Nombre de cœurs CPU (seuil : moins de 4 cœurs)
- Quantité de mémoire disponible (seuil : moins de 4 Go)
- Charge système (seuil : charge moyenne supérieure à 2.0 par cœur)

Le résultat de cette analyse est mis en cache pour éviter des vérifications répétées et coûteuses.

### Calcul des timeouts

En fonction du type de l'environnement et du type de requête, différentes valeurs de timeout sont appliquées :

| Type d'environnement | Requête standard | Requête de profil |
|----------------------|------------------|-------------------|
| Performance normale  | 30 secondes      | 20 secondes       |
| Basse performance    | 45 secondes      | 30 secondes       |

### Mise en œuvre automatique

Le `HttpTimeoutListener` intercepte chaque requête entrante, détermine sa nature (standard ou profil) et définit un attribut `_timeout` avec la valeur appropriée. Il ajuste également la limite d'exécution PHP (`max_execution_time`).

## Utilisation

### Dans les contrôleurs

Pour utiliser le service de timeout dans un contrôleur :

```php
// Injection des dépendances
private TimeoutService $timeoutService;

public function __construct(TimeoutService $timeoutService)
{
    $this->timeoutService = $timeoutService;
}

// Utilisation
$timeout = $this->timeoutService->getTimeout($isProfileRequest);
```

### Pour les requêtes HTTP

La factory `HttpClientFactory` simplifie la création de clients HTTP avec des timeouts adaptés :

```php
// Injection des dépendances
private HttpClientFactory $httpClientFactory;

public function __construct(HttpClientFactory $httpClientFactory)
{
    $this->httpClientFactory = $httpClientFactory;
}

// Création d'un client standard
$client = $this->httpClientFactory->create();

// Création d'un client pour les requêtes de profil
$profileClient = $this->httpClientFactory->createForProfile();

// Création d'un client pour les transferts volumineux
$largeDataClient = $this->httpClientFactory->createForLargeData();
```

## Points de terminaison de test

Le contrôleur `ExampleTimeoutController` expose plusieurs points de terminaison pour tester le système :

- `/api/test/timeout` : Affiche les informations sur le système de timeout adaptatif
- `/api/test/external-request` : Effectue une requête HTTP externe avec le timeout adapté
- `/api/test/profile-request` : Simule une requête de profil avec le timeout spécifique

## Compatibilité

Le système est conçu pour fonctionner sur :
- Linux/Unix
- Windows
- Conteneurs Docker

Sur les systèmes où certaines métriques ne sont pas disponibles, des valeurs par défaut raisonnables sont utilisées.

## Performances et fiabilité

- Les résultats de détection sont mis en cache pendant 1 heure (configurable)
- L'impact sur les performances est minimal (évaluation faite une seule fois)
- Le système est robuste face aux erreurs (gestion des exceptions, valeurs par défaut)

## Extensions futures

Possibilités d'extension du système :
- Ajout de métriques supplémentaires (utilisation du réseau, etc.)
- Réglage dynamique en fonction de la charge actuelle
- Intégration avec des services de monitoring externes
- Configuration fine par type d'opération 