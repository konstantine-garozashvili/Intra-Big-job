<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DiagnosticController extends AbstractController
{
    #[Route('/api/test-route', name: 'api_test_route', methods: ['GET'])]
    public function testRoute(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok',
            'message' => 'API test route is working',
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/api/diagnostic', name: 'api_diagnostic', methods: ['GET'])]
    public function diagnostic(Request $request): JsonResponse
    {
        // Basic information only to avoid errors
        $env = [
            'php_version' => phpversion(),
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s'),
            'request_info' => [
                'path' => $request->getPathInfo(),
                'method' => $request->getMethod(),
                'host' => $request->getHost(),
            ]
        ];

        return new JsonResponse([
            'status' => 'ok',
            'message' => 'Simplified diagnostic information',
            'environment' => $env,
        ]);
    }

    #[Route('/api/test-post', name: 'api_test_post', methods: ['POST'])]
    public function testPost(Request $request): JsonResponse
    {
        // Get the request content
        $content = $request->getContent();
        $data = [];
        
        // Try to parse JSON
        if (!empty($content)) {
            try {
                $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException $e) {
                $data = ['error' => 'Invalid JSON: ' . $e->getMessage()];
            }
        }

        return new JsonResponse([
            'status' => 'ok',
            'message' => 'POST request received',
            'received_data' => $data,
            'headers' => $request->headers->all(),
        ]);
    }
} 