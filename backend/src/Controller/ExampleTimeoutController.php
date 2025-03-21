<?php

namespace App\Controller;

use App\Service\HttpClientFactory;
use App\Service\TimeoutService;
use Psr\Cache\CacheItemPoolInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Contrôleur d'exemple pour démontrer l'utilisation du timeout adaptatif
 */
class ExampleTimeoutController extends AbstractController
{
    private HttpClientFactory $httpClientFactory;
    private TimeoutService $timeoutService;
    private CacheItemPoolInterface $cache;
    
    public function __construct(
        HttpClientFactory $httpClientFactory,
        TimeoutService $timeoutService,
        CacheItemPoolInterface $cache
    ) {
        $this->httpClientFactory = $httpClientFactory;
        $this->timeoutService = $timeoutService;
        $this->cache = $cache;
    }
    
    /**
     * Point de terminaison de test pour vérifier le système de timeout adaptatif
     */
    #[Route('/api/test/timeout', name: 'api_test_timeout', methods: ['GET'])]
    public function testTimeout(Request $request): JsonResponse
    {
        // Récupération de l'information si nous sommes en environnement de basse performance
        $isLowPerformance = $this->timeoutService->isLowPerformanceEnvironment();
        
        // Récupération du timeout appliqué à la requête actuelle
        $currentTimeout = $request->attributes->get('_timeout', 'Non défini');
        
        // Récupération des informations système (utilisées pour déterminer la performance)
        $cacheItem = $this->cache->getItem('system_performance_metrics');
        $systemMetrics = $cacheItem->isHit() ? $cacheItem->get()['metrics'] ?? [] : [];
        
        // Construction de la réponse avec toutes les informations sur le timeout
        $response = [
            'success' => true,
            'message' => 'Informations sur le timeout adaptatif',
            'is_low_performance' => $isLowPerformance,
            'current_request_timeout' => $currentTimeout,
            'default_timeout' => $this->timeoutService->getTimeout(false),
            'profile_request_timeout' => $this->timeoutService->getTimeout(true),
            'system_metrics' => $systemMetrics,
            'php_max_execution_time' => ini_get('max_execution_time'),
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Inconnu',
            'server_os' => PHP_OS,
        ];
        
        return new JsonResponse($response);
    }
    
    /**
     * Effectue une requête HTTP externe avec un timeout adaptatif
     */
    #[Route('/api/test/external-request', name: 'api_test_external_request', methods: ['GET'])]
    public function testExternalRequest(Request $request): JsonResponse
    {
        $targetUrl = $request->query->get('url', 'https://jsonplaceholder.typicode.com/todos/1');
        
        try {
            // Utilisation du HttpClientFactory pour créer un client avec timeout adaptatif
            $httpClient = $this->httpClientFactory->create();
            
            // Enregistrement du temps de début
            $startTime = microtime(true);
            
            // Exécution de la requête
            $response = $httpClient->request('GET', $targetUrl);
            $content = $response->toArray();
            
            // Temps d'exécution
            $executionTime = round((microtime(true) - $startTime) * 1000); // en millisecondes
            
            // Construction de la réponse
            return new JsonResponse([
                'success' => true,
                'message' => 'Requête externe effectuée avec succès',
                'execution_time_ms' => $executionTime,
                'timeout_applied' => $request->attributes->get('_timeout'),
                'response' => $content,
            ]);
        } catch (\Exception $e) {
            // En cas d'erreur (notamment de timeout)
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur lors de la requête externe',
                'error' => $e->getMessage(),
                'timeout_applied' => $request->attributes->get('_timeout'),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Simule une requête de profil avec un timeout spécifique
     */
    #[Route('/api/test/profile-request', name: 'api_test_profile_request', methods: ['GET'])]
    public function testProfileRequest(): JsonResponse
    {
        try {
            // Utilisation du client HTTP optimisé pour les requêtes de profil
            $httpClient = $this->httpClientFactory->createForProfile();
            
            // Enregistrement du temps de début
            $startTime = microtime(true);
            
            // Simulation d'un traitement
            $executionTime = round((microtime(true) - $startTime) * 1000);
            
            // Construction de la réponse
            return new JsonResponse([
                'success' => true,
                'message' => 'Requête de profil simulée avec succès',
                'execution_time_ms' => $executionTime,
                'profile_timeout_applied' => $this->timeoutService->getTimeout(true),
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur lors de la simulation de requête de profil',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 