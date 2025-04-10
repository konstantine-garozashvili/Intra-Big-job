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
        // Environment information
        $env = [
            'php_version' => phpversion(),
            'symfony_env' => $_SERVER['APP_ENV'] ?? getenv('APP_ENV') ?? 'unknown',
            'debug' => $_SERVER['APP_DEBUG'] ?? getenv('APP_DEBUG') ?? 'unknown',
            'project_dir' => $this->getParameter('kernel.project_dir'),
            'request_info' => [
                'path' => $request->getPathInfo(),
                'method' => $request->getMethod(),
                'host' => $request->getHost(),
                'scheme' => $request->getScheme(),
                'client_ip' => $request->getClientIp(),
            ]
        ];

        // JWT Configuration
        $jwt = [
            'secret_key_path' => getenv('JWT_SECRET_KEY'),
            'public_key_path' => getenv('JWT_PUBLIC_KEY'),
            'passphrase_set' => !empty(getenv('JWT_PASSPHRASE')),
            'token_ttl' => getenv('JWT_TTL') ?? '28800 (default)',
        ];

        // Try to check if files exist, but catch any exceptions to prevent errors
        try {
            $privateKeyPath = $this->getParameter('kernel.project_dir') . '/config/jwt/private.pem';
            $publicKeyPath = $this->getParameter('kernel.project_dir') . '/config/jwt/public.pem';
            $jwt['private_key_exists'] = file_exists($privateKeyPath);
            $jwt['public_key_exists'] = file_exists($publicKeyPath);
        } catch (\Exception $e) {
            $jwt['file_check_error'] = $e->getMessage();
        }

        // Get route information
        $routes = [];
        try {
            $router = $this->container->get('router');
            $routeCollection = $router->getRouteCollection();
            
            foreach ($routeCollection->all() as $name => $route) {
                $routes[] = [
                    'name' => $name,
                    'path' => $route->getPath(),
                    'methods' => $route->getMethods(),
                ];
            }
        } catch (\Exception $e) {
            $routes['error'] = $e->getMessage();
        }

        return new JsonResponse([
            'status' => 'ok',
            'message' => 'Diagnostic information',
            'environment' => $env,
            'jwt_configuration' => $jwt,
            'routes' => $routes,
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