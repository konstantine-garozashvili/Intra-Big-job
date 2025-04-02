<?php

namespace App\Controller\Settings;

use App\Entity\User;
use App\Entity\Theme;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/settings')]
class UserSettingsController extends AbstractController
{
    private $security;
    private $entityManager;
    
    public function __construct(
        Security $security,
        EntityManagerInterface $entityManager
    ) {
        $this->security = $security;
        $this->entityManager = $entityManager;
    }
    
    /**
     * Récupère les paramètres de l'utilisateur connecté
     */
    #[Route('/me', name: 'api_settings_me', methods: ['GET'])]
    public function getSettings(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Retourner les paramètres de l'utilisateur
        $settings = [
            'theme' => $user->getTheme() ? [
                'id' => $user->getTheme()->getId(),
                'name' => $user->getTheme()->getName(),
            ] : null,
            // Paramètres de base
            'user' => [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'phoneNumber' => $user->getPhoneNumber(),
                'isEmailVerified' => $user->isEmailVerified()
            ]
        ];
        
        return $this->json([
            'success' => true,
            'data' => $settings
        ]);
    }
    
    /**
     * Met à jour les paramètres de l'utilisateur connecté
     */
    #[Route('/me', name: 'api_settings_me_update', methods: ['PUT'])]
    public function updateSettings(Request $request, ValidatorInterface $validator): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides'
            ], 400);
        }
        
        try {
            // Mise à jour du thème
            if (isset($data['theme']) && is_array($data['theme']) && isset($data['theme']['id'])) {
                $themeRepo = $this->entityManager->getRepository(Theme::class);
                $theme = $themeRepo->find($data['theme']['id']);
                
                if ($theme) {
                    $user->setTheme($theme);
                } else {
                    return $this->json([
                        'success' => false,
                        'message' => 'Thème invalide'
                    ], 400);
                }
            }
            
            // Mettre à jour la date de modification
            if (method_exists($user, 'setUpdatedAt')) {
                $user->setUpdatedAt(new \DateTimeImmutable());
            }
            
            // Valider l'entité
            $errors = $validator->validate($user);
            
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                
                return $this->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $errorMessages
                ], 400);
            }
            
            // Persister les changements
            $this->entityManager->flush();
            
            // Retourner les paramètres mis à jour
            $settings = [
                'theme' => $user->getTheme() ? [
                    'id' => $user->getTheme()->getId(),
                    'name' => $user->getTheme()->getName(),
                ] : null,
                'user' => [
                    'id' => $user->getId(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'email' => $user->getEmail(),
                    'phoneNumber' => $user->getPhoneNumber(),
                    'isEmailVerified' => $user->isEmailVerified()
                ]
            ];
            
            return $this->json([
                'success' => true,
                'message' => 'Paramètres mis à jour avec succès',
                'data' => $settings
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des paramètres: ' . $e->getMessage()
            ], 500);
        }
    }
} 