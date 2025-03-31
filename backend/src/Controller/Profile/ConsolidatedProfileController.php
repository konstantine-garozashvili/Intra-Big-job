<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Service\UserProfileService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;

#[Route('/api/profile')]
class ConsolidatedProfileController extends ProfileController
{
    private $userProfileService;
    
    public function __construct(
        UserProfileService $userProfileService,
        Security $security
    ) {
        parent::__construct($security);
        $this->userProfileService = $userProfileService;
    }
    
    /**
     * Get consolidated profile information
     */
    #[Route('/consolidated', name: 'api_profil_consolidated', methods: ['GET'])]
    public function getConsolidatedProfile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            // Retourner les informations de base pour les utilisateurs invités
            return $this->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'firstName' => 'Guest',
                        'lastName' => 'User',
                        'email' => 'guest@bigproject.com',
                        'city' => 'Non renseignée',
                        'isGuest' => true
                    ],
                    'studentProfile' => null,
                    'diplomas' => [],
                    'addresses' => [],
                    'documents' => [],
                    'stats' => ['profile' => []]
                ]
            ]);
        }
        
        try {
            $userData = $this->userProfileService->getUserProfileData($user);
            
            // Récupérer la première adresse de l'utilisateur pour la ville
            $city = 'Non renseignée';
            if (!empty($userData['addresses'])) {
                $firstAddress = $userData['addresses'][0];
                if (isset($firstAddress['city']['name'])) {
                    $city = $firstAddress['city']['name'];
                }
            }
            
            // Ajouter la ville aux données utilisateur
            $userData['city'] = $city;
            
            return $this->json([
                'success' => true,
                'data' => $userData
            ]);
        } catch (\Exception $e) {
            return $this->createErrorResponse(
                'Erreur lors de la récupération des données du profil: ' . $e->getMessage(),
                500
            );
        }
    }
}