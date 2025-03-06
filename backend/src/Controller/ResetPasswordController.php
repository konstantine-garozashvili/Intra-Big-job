<?php

namespace App\Controller;

use App\Service\ResetPasswordService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/reset-password')]
class ResetPasswordController extends AbstractController
{
    private ResetPasswordService $resetPasswordService;
    private ValidatorInterface $validator;

    public function __construct(
        ResetPasswordService $resetPasswordService,
        ValidatorInterface $validator
    ) {
        $this->resetPasswordService = $resetPasswordService;
        $this->validator = $validator;
    }

    /**
     * Route pour demander une réinitialisation de mot de passe
     */
    #[Route('/request', name: 'api_reset_password_request', methods: ['POST'])]
    public function requestReset(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            // Vérifier que l'email est présent
            if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                return $this->json([
                    'success' => false,
                    'message' => 'Adresse email invalide'
                ], 400);
            }
            
            // Limiter le nombre de demandes (protection contre les attaques)
            // Ici, on pourrait implémenter une limitation basée sur l'IP ou d'autres critères
            
            // Traiter la demande via le service
            $this->resetPasswordService->requestReset($data['email']);
            
            // Toujours retourner un succès pour ne pas révéler si l'email existe
            return $this->json([
                'success' => true,
                'message' => 'Si votre email est enregistré dans notre système, vous recevrez un lien de réinitialisation'
            ]);
        } catch (\Exception $e) {
            // Log l'erreur pour débogage
            // Mais ne pas la renvoyer à l'utilisateur pour des raisons de sécurité
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue, veuillez réessayer plus tard'
            ], 500);
        }
    }
    
    /**
     * Route pour vérifier la validité d'un token
     */
    #[Route('/verify/{token}', name: 'api_reset_password_verify', methods: ['GET'])]
    public function verifyToken(string $token): JsonResponse
    {
        try {
            // Vérifier le token
            $user = $this->resetPasswordService->validateToken($token);
            
            if (!$user) {
                return $this->json([
                    'success' => false,
                    'message' => 'Ce lien de réinitialisation est invalide ou a expiré'
                ], 400);
            }
            
            return $this->json([
                'success' => true,
                'message' => 'Token valide',
                'data' => [
                    'email' => $user->getEmail()
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue, veuillez réessayer plus tard'
            ], 500);
        }
    }
    
    /**
     * Route pour réinitialiser le mot de passe
     */
    #[Route('/reset/{token}', name: 'api_reset_password_reset', methods: ['POST'])]
    public function resetPassword(Request $request, string $token): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            // Vérifier que le mot de passe est présent et confirmé
            if (!isset($data['password']) || !isset($data['confirmPassword'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Mot de passe ou confirmation manquant'
                ], 400);
            }
            
            // Vérifier que les mots de passe correspondent
            if ($data['password'] !== $data['confirmPassword']) {
                return $this->json([
                    'success' => false,
                    'message' => 'Les mots de passe ne correspondent pas'
                ], 400);
            }
            
            // Vérifier la complexité du mot de passe
            if (strlen($data['password']) < 8) {
                return $this->json([
                    'success' => false,
                    'message' => 'Le mot de passe doit contenir au moins 8 caractères'
                ], 400);
            }
            
            // Réinitialiser le mot de passe
            $success = $this->resetPasswordService->resetPassword($token, $data['password']);
            
            if (!$success) {
                return $this->json([
                    'success' => false,
                    'message' => 'Ce lien de réinitialisation est invalide ou a expiré'
                ], 400);
            }
            
            return $this->json([
                'success' => true,
                'message' => 'Votre mot de passe a été réinitialisé avec succès'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue, veuillez réessayer plus tard'
            ], 500);
        }
    }
}
