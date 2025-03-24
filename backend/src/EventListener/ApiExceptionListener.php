<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\JWTDecodeFailureException;

class ApiExceptionListener
{
    /**
     * Handle all exceptions thrown in API routes
     */
    public function onKernelException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();
        
        // Only handle API routes
        if (strpos($request->getPathInfo(), '/api') !== 0) {
            return;
        }
        
        $exception = $event->getThrowable();
        $response = null;
        
        // Handle specific exceptions
        if ($exception instanceof AuthenticationException) {
            $response = $this->handleAuthenticationException($exception);
        } elseif ($exception instanceof JWTDecodeFailureException) {
            $response = $this->handleJwtException($exception);
        } elseif ($exception instanceof HttpExceptionInterface) {
            $response = $this->handleHttpException($exception);
        } else {
            // Gérer les autres exceptions
            $response = $this->handleGenericException($exception);
        }
        
        // Set the response
        $event->setResponse($response);
    }
    
    private function handleAuthenticationException(AuthenticationException $exception): JsonResponse
    {
        $message = $exception->getMessage();
        $statusCode = Response::HTTP_UNAUTHORIZED;
        $code = 'AUTHENTICATION_ERROR';
        
        // Déterminer le code d'erreur spécifique
        if (strpos($message, 'Veuillez vérifier votre adresse email') !== false) {
            $code = 'EMAIL_NOT_VERIFIED';
        }
        
        return new JsonResponse([
            'success' => false,
            'message' => $message,
            'code' => $code
        ], $statusCode);
    }
    
    private function handleJwtException(JWTDecodeFailureException $exception): JsonResponse
    {
        return new JsonResponse([
            'success' => false,
            'message' => 'Session invalide ou expirée',
            'code' => 'INVALID_TOKEN'
        ], Response::HTTP_UNAUTHORIZED);
    }
    
    private function handleHttpException(HttpExceptionInterface $exception): JsonResponse
    {
        return new JsonResponse([
            'success' => false,
            'message' => $exception->getMessage(),
            'code' => 'HTTP_ERROR'
        ], $exception->getStatusCode());
    }
    
    private function handleGenericException(\Throwable $exception): JsonResponse
    {
        // En production, ne pas exposer les détails de l'erreur
        $env = $_ENV['APP_ENV'] ?? 'prod';
        $message = $env === 'dev' ? $exception->getMessage() : 'Une erreur interne est survenue';
        
        return new JsonResponse([
            'success' => false,
            'message' => $message,
            'code' => 'SERVER_ERROR'
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
} 