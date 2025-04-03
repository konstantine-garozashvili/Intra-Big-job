<?php

namespace App\Controller\Api;

use App\Service\User\UserProfileAggregator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class UnifiedUserController extends AbstractController
{
    public function __construct(
        private readonly UserProfileAggregator $userProfileAggregator
    ) {
    }

    /**
     * Endpoint unifié pour récupérer les données utilisateur
     * 
     * @param Request $request
     * @return JsonResponse
     */
    #[Route('/user/profile', name: 'api_user_profile_unified', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getUserProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }
        
        // Récupérer les sections demandées depuis la requête
        $requestedSections = $request->query->all('sections');
        
        // Si le paramètre sections est fourni mais vide, utilisez un tableau vide
        if ($request->query->has('sections') && empty($requestedSections)) {
            $requestedSections = [];
        }
        
        // Récupérer les données utilisateur en utilisant l'agrégateur
        $data = $this->userProfileAggregator->getUserData($user, $requestedSections);
        
        return $this->json($data);
    }
    
    /**
     * Endpoint /api/me pour la compatibilité avec le code existant
     * @deprecated Utilisez /api/user/profile à la place
     */
    #[Route('/me', name: 'api_me', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getMe(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non authentifié'], 401);
        }
        
        // Récupérer uniquement les données de base pour l'endpoint /me
        $data = $this->userProfileAggregator->getUserData($user, ['basic']);
        
        // Adapter le format de réponse pour maintenir la compatibilité
        $meData = [
            'id' => $data['basic']['id'] ?? null,
            'email' => $data['basic']['email'] ?? null,
            'roles' => $data['basic']['roles'] ?? [],
            'firstName' => $data['basic']['first_name'] ?? null,
            'lastName' => $data['basic']['last_name'] ?? null,
        ];
        
        return $this->json([
            'success' => true,
            'data' => $meData,
            'deprecated' => 'Cet endpoint est déprécié, utilisez /api/user/profile à la place.'
        ]);
    }
} 