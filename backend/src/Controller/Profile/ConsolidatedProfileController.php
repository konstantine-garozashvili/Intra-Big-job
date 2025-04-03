<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Service\User\UserProfileAggregator;
use App\Service\UserProfileService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api/profile')]
class ConsolidatedProfileController extends AbstractController
{
    private $userProfileService;
    private $security;
    private $userProfileAggregator;
    
    public function __construct(
        UserProfileService $userProfileService,
        Security $security,
        UserProfileAggregator $userProfileAggregator
    ) {
        $this->userProfileService = $userProfileService;
        $this->security = $security;
        $this->userProfileAggregator = $userProfileAggregator;
    }
    
    /**
     * Get consolidated profile information including all necessary user data
     * @deprecated Cet endpoint est déprécié, utilisez /api/user/profile à la place.
     */
    #[Route('/consolidated', name: 'api_profil_consolidated', methods: ['GET'])]
    public function getConsolidatedProfile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => true,
                'data' => [
                    'id' => null,
                    'firstName' => 'Guest',
                    'lastName' => 'User',
                    'email' => 'guest@bigproject.com',
                    'roles' => ['ROLE_GUEST'],
                    'isEmailVerified' => false,
                    'theme' => [
                        'id' => 1,
                        'name' => 'light'
                    ],
                    'studentProfile' => null,
                    'specialization' => null,
                    'city' => 'Non renseignée',
                    'addresses' => [],
                    'documents' => [],
                    'stats' => ['profile' => []],
                    'isGuest' => true
                ],
                'deprecated' => 'Cet endpoint est déprécié, utilisez /api/user/profile à la place.'
            ]);
        }
        
        try {
            // Utiliser le nouvel agrégateur pour la compatibilité
            $userData = $this->getUserDataFromAggregator($user);
            
            // Ajouter le flag isGuest
            $userData['isGuest'] = false;
            
            // Ajouter les statistiques si nécessaire
            if (!isset($userData['stats'])) {
                $userData['stats'] = ['profile' => []];
            }
            
            return $this->json([
                'success' => true,
                'data' => $userData,
                'deprecated' => 'Cet endpoint est déprécié, utilisez /api/user/profile à la place.'
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données du profil: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupère les données utilisateur à partir du nouvel agrégateur et les formate 
     * pour maintenir la compatibilité avec l'ancienne structure
     */
    private function getUserDataFromAggregator(User $user): array
    {
        // Utiliser l'agrégateur pour récupérer les données
        $sections = ['basic', 'profile', 'diplomas'];
        
        // Ajouter des sections spécifiques selon le rôle
        if (in_array('ROLE_STUDENT', $user->getRoles())) {
            $sections[] = 'portfolio';
        }
        if (in_array('ROLE_TEACHER', $user->getRoles())) {
            $sections[] = 'teaching_data';
        }
        if (in_array('ROLE_HR', $user->getRoles())) {
            $sections[] = 'hr_data';
        }
        if (in_array('ROLE_ADMIN', $user->getRoles()) || in_array('ROLE_SUPER_ADMIN', $user->getRoles())) {
            $sections[] = 'admin_data';
        }
        
        $aggregatedData = $this->userProfileAggregator->getUserData($user, $sections);
        
        // Transformer les données agrégées au format attendu par les clients
        $userData = [];
        
        // Informations de base
        if (isset($aggregatedData['basic'])) {
            $userData['id'] = $aggregatedData['basic']['id'] ?? null;
            $userData['firstName'] = $aggregatedData['basic']['first_name'] ?? null;
            $userData['lastName'] = $aggregatedData['basic']['last_name'] ?? null;
            $userData['email'] = $aggregatedData['basic']['email'] ?? null;
            $userData['roles'] = $aggregatedData['basic']['roles'] ?? [];
        }
        
        // Profil
        if (isset($aggregatedData['profile'])) {
            // Fusion des données de profil
            $userData = array_merge($userData, $aggregatedData['profile']);
        }
        
        // Autres sections
        foreach (['diplomas', 'portfolio', 'teaching_data', 'hr_data', 'admin_data'] as $section) {
            if (isset($aggregatedData[$section])) {
                $userData[$section] = $aggregatedData[$section];
            }
        }
        
        return $userData;
    }
} 