<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;

class AuthenticationFailureHandler implements AuthenticationFailureHandlerInterface
{
    /**
     * @param Request $request
     * @param AuthenticationException $exception
     * @return JsonResponse
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): JsonResponse
    {
        $errorMessage = $exception->getMessage();
        
        // Messages spécifiques liés à la vérification d'email
        if (strpos($errorMessage, 'Veuillez vérifier votre adresse email') !== false) {
            return new JsonResponse([
                'success' => false,
                'message' => $errorMessage,
                'code' => 'EMAIL_NOT_VERIFIED'
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }
        
        // Message générique pour les autres erreurs
        return new JsonResponse([
            'success' => false,
            'message' => 'Email ou mot de passe incorrect',
            'code' => 'INVALID_CREDENTIALS'
        ], JsonResponse::HTTP_UNAUTHORIZED);
    }
} 