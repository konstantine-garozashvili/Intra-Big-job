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

    #[Route('/api/jwt-diagnostic', name: 'api_jwt_diagnostic', methods: ['GET'])]
    public function jwtDiagnostic(): JsonResponse
    {
        $projectDir = $this->getParameter('kernel.project_dir');
        $privateKeyPath = $projectDir . '/config/jwt/private.pem';
        $publicKeyPath = $projectDir . '/config/jwt/public.pem';
        
        $result = [
            'private_key_exists' => file_exists($privateKeyPath),
            'public_key_exists' => file_exists($publicKeyPath),
            'private_key_readable' => is_readable($privateKeyPath),
            'public_key_readable' => is_readable($publicKeyPath),
            'jwt_env_vars' => [
                'jwt_secret_key' => getenv('JWT_SECRET_KEY') ?: 'not set',
                'jwt_public_key' => getenv('JWT_PUBLIC_KEY') ?: 'not set',
                'jwt_passphrase' => !empty(getenv('JWT_PASSPHRASE')) ? 'is set' : 'not set',
                'jwt_ttl' => getenv('JWT_TTL') ?: 'not set'
            ]
        ];
        
        // Check if we can actually read the files
        if ($result['private_key_readable']) {
            try {
                $privateKeyContent = file_get_contents($privateKeyPath);
                $result['private_key_valid'] = !empty($privateKeyContent) && strpos($privateKeyContent, 'BEGIN') !== false;
            } catch (\Exception $e) {
                $result['private_key_error'] = $e->getMessage();
            }
        }
        
        if ($result['public_key_readable']) {
            try {
                $publicKeyContent = file_get_contents($publicKeyPath);
                $result['public_key_valid'] = !empty($publicKeyContent) && strpos($publicKeyContent, 'BEGIN') !== false;
            } catch (\Exception $e) {
                $result['public_key_error'] = $e->getMessage();
            }
        }
        
        return new JsonResponse([
            'status' => 'ok',
            'message' => 'JWT diagnostic information',
            'jwt_configuration' => $result
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