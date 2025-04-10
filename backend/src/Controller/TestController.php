<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/test-controller')]
class TestController extends AbstractController
{
    #[Route('/hello', name: 'app_test_hello', methods: ['GET'])]
    public function hello(): JsonResponse
    {
        return $this->json([
            'message' => 'Hello from TestController!',
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/info', name: 'app_test_info', methods: ['GET'])]
    public function info(): JsonResponse
    {
        return $this->json([
            'message' => 'System info',
            'php_version' => phpversion(),
            'environment' => $_SERVER['APP_ENV'] ?? 'unknown',
            'debug' => $_SERVER['APP_DEBUG'] ?? 'unknown',
            'server' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        ]);
    }
} 