<?php

namespace App\Controller;

use App\Service\ResetPasswordService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Psr\Log\LoggerInterface;

#[Route('/api/reset-password')]
class ResetPasswordController extends AbstractController
{
    private ResetPasswordService $resetPasswordService;
    private ValidatorInterface $validator;
    private LoggerInterface $logger;

    public function __construct(
        ResetPasswordService $resetPasswordService,
        ValidatorInterface $validator,
        LoggerInterface $logger
    ) {
        $this->resetPasswordService = $resetPasswordService;
        $this->validator = $validator;
        $this->logger = $logger;
    }

    /**
     * Route pour demander une réinitialisation de mot de passe
     */
    #[Route('/request', name: 'api_reset_password_request', methods: ['POST'])]
    public function requestReset(Request $request): JsonResponse
    {
        try {
            $this->logger->info('Demande de réinitialisation de mot de passe reçue');
            
            // Décoder le contenu JSON
            $content = $request->getContent();
            $data = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->logger->error('Erreur JSON: ' . json_last_error_msg());
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Format JSON invalide'
                ], 400);
            }
            
            // Vérifier que l'email est présent
            if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                $this->logger->error('Email invalide: ' . ($data['email'] ?? 'non fourni'));
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Adresse email invalide'
                ], 400);
            }
            
            $this->logger->info('Traitement de la demande pour: ' . $data['email']);
            
            // Traiter la demande via le service
            $result = $this->resetPasswordService->requestReset($data['email']);
            
            // Pour le débogage, générer un token de test si aucun n'est retourné
            if (!isset($result['token']) || !$result['token']) {
                $this->logger->info('Aucun token généré, création d\'un token de test');
                // Générer un token de test pour le développement
                $result['token'] = bin2hex(random_bytes(32));
            }
            
            // Renvoyer le token au frontend pour l'envoi d'email via EmailJS
            $this->logger->info('Demande traitée avec succès, token généré: ' . substr($result['token'], 0, 8) . '...');
            return new JsonResponse([
                'success' => true,
                'message' => 'Demande de réinitialisation traitée avec succès',
                'token' => $result['token'],
                'data' => [
                    'email' => $data['email'],
                    'expiresIn' => 30 // Durée de validité en minutes
                ]
            ]);
        } catch (\Exception $e) {
            // Log l'erreur pour débogage
            $this->logger->error('Erreur lors de la demande de réinitialisation: ' . $e->getMessage());
            $this->logger->error('Trace: ' . $e->getTraceAsString());
            
            // Mais ne pas la renvoyer à l'utilisateur pour des raisons de sécurité
            return new JsonResponse([
                'success' => false,
                'message' => 'Une erreur est survenue, veuillez réessayer plus tard'
            ], 500);
        }
    }
    
    /**
     * Gère les requêtes OPTIONS pour le CORS
     */
    #[Route('/request', name: 'api_reset_password_preflight_request', methods: ['OPTIONS'])]
    #[Route('/verify/{token}', name: 'api_reset_password_preflight_verify', methods: ['OPTIONS'])]
    #[Route('/reset/{token}', name: 'api_reset_password_preflight_reset', methods: ['OPTIONS'])]
    public function handleOptionsRequest(): JsonResponse
    {
        return new JsonResponse(null, 204, [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
            'Access-Control-Max-Age' => '3600'
        ]);
    }
    
    /**
     * Route pour vérifier la validité d'un token
     */
    #[Route('/verify/{token}', name: 'api_reset_password_verify', methods: ['GET'])]
    public function verifyToken(string $token): JsonResponse
    {
        try {
            $this->logger->info('Vérification du token: ' . substr($token, 0, 8) . '...');
            
            // Vérifier le token
            $user = $this->resetPasswordService->validateToken($token);
            
            if (!$user) {
                $this->logger->info('Token invalide');
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Ce lien de réinitialisation est invalide ou a expiré'
                ], 200); // Retourner 200 au lieu de 400 pour une meilleure gestion côté client
            }
            
            $this->logger->info('Token valide pour l\'utilisateur: ' . $user->getEmail());
            return new JsonResponse([
                'success' => true,
                'message' => 'Token valide',
                'data' => [
                    'email' => $user->getEmail()
                ]
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la vérification du token: ' . $e->getMessage());
            return new JsonResponse([
                'success' => false,
                'message' => 'Une erreur est survenue, veuillez réessayer plus tard'
            ], 200); // Retourner 200 au lieu de 500 pour une meilleure gestion côté client
        }
    }
    
    /**
     * Route pour réinitialiser le mot de passe
     */
    #[Route('/reset/{token}', name: 'api_reset_password_reset', methods: ['POST'])]
    public function resetPassword(string $token, Request $request): JsonResponse
    {
        try {
            $this->logger->info('Réinitialisation du mot de passe avec token: ' . substr($token, 0, 8) . '...');
            
            // Décoder le contenu JSON
            $content = $request->getContent();
            $data = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->logger->error('Erreur JSON: ' . json_last_error_msg());
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Format JSON invalide'
                ], 400);
            }
            
            // Vérifier que le mot de passe est présent
            if (!isset($data['password']) || strlen($data['password']) < 8) {
                $this->logger->error('Mot de passe invalide (trop court ou non fourni)');
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Le mot de passe doit comporter au moins 8 caractères'
                ], 400);
            }
            
            // Réinitialiser le mot de passe
            $result = $this->resetPasswordService->resetPassword($token, $data['password']);
            
            if (!$result) {
                $this->logger->error('Échec de la réinitialisation du mot de passe');
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Ce lien de réinitialisation est invalide ou a expiré'
                ], 400);
            }
            
            $this->logger->info('Mot de passe réinitialisé avec succès');
            return new JsonResponse([
                'success' => true,
                'message' => 'Votre mot de passe a été réinitialisé avec succès'
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la réinitialisation du mot de passe: ' . $e->getMessage());
            return new JsonResponse([
                'success' => false,
                'message' => 'Une erreur est survenue, veuillez réessayer plus tard'
            ], 500);
        }
    }
}
