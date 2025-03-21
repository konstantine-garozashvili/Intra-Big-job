<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Contrôleur de base pour les endpoints API partagés
 */
#[Route('/api', name: 'api_')]
class ApiController extends AbstractController
{
    /**
     * Point d'entrée API pour vérifier l'état du serveur
     */
    #[Route('/status', name: 'status', methods: ['GET'])]
    public function status(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok',
            'version' => '1.0.0',
            'environment' => $_ENV['APP_ENV'] ?? 'unknown',
            'timestamp' => time(),
        ]);
    }
    
    /**
     * Informations sur la configuration système
     */
    #[Route('/info', name: 'info', methods: ['GET'])]
    public function info(): JsonResponse
    {
        return new JsonResponse([
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'symfony_environment' => $_ENV['APP_ENV'] ?? 'unknown',
            'server_time' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]);
    }
} 