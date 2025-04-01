<?php

namespace App\Controller;

use App\Service\PasswordService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Psr\Log\LoggerInterface;

#[Route('/api')]
class PasswordController extends AbstractController
{
    private PasswordService $passwordService;
    private LoggerInterface $logger;

    public function __construct(
        PasswordService $passwordService,
        LoggerInterface $logger
    ) {
        $this->passwordService = $passwordService;
        $this->logger = $logger;
    }

    /**
     * Route pour changer le mot de passe de l'utilisateur connecté
     */
    #[Route('/change-password', name: 'api_change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $this->logger->info('Demande de changement de mot de passe reçue');
            
            // Vérifier que l'utilisateur est connecté
            $user = $this->getUser();
            if (!$user) {
                throw new AccessDeniedException('Vous devez être connecté pour changer votre mot de passe');
            }
            
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
            
            // Vérifier que les champs requis sont présents
            if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
                $this->logger->error('Données manquantes pour le changement de mot de passe');
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Le mot de passe actuel et le nouveau mot de passe sont requis'
                ], 400);
            }
            
            // Valider et changer le mot de passe
            $result = $this->passwordService->changePassword(
                $user,
                $data['currentPassword'],
                $data['newPassword']
            );
            
            if (!$result['success']) {
                $this->logger->warning('Échec du changement de mot de passe: ' . $result['message']);
                return new JsonResponse([
                    'success' => false,
                    'message' => $result['message']
                ], 400);
            }
            
            $this->logger->info('Mot de passe changé avec succès pour l\'utilisateur: ' . $user->getEmail());
            return new JsonResponse([
                'success' => true,
                'message' => 'Votre mot de passe a été modifié avec succès'
            ]);
        } catch (AccessDeniedException $e) {
            $this->logger->error('Accès refusé: ' . $e->getMessage());
            return new JsonResponse([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du changement de mot de passe: ' . $e->getMessage());
            $this->logger->error('Trace: ' . $e->getTraceAsString());
            return new JsonResponse([
                'success' => false,
                'message' => 'Une erreur est survenue lors du changement de mot de passe'
            ], 500);
        }
    }
} 