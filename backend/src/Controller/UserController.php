<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\RegistrationService;
use App\Service\ValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api')]
class UserController extends AbstractController
{
    private $security;
    private $serializer;
    private $userRepository;
    private $validationService;
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        UserRepository $userRepository,
        ValidationService $validationService
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->userRepository = $userRepository;
        $this->validationService = $validationService;
    }
    
    /**
     * Endpoint pour l'inscription d'un nouvel utilisateur
     * CETTE ROUTE EST DÉSACTIVÉE - Utiliser RegistrationController à la place
     */
    // #[Route('/register', name: 'app_register', methods: ['POST'])]
    private function register(
        Request $request,
        RegistrationService $registrationService,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager
    ): JsonResponse 
    {
        throw new \RuntimeException('Cette route est désactivée - Utilisez /api/register à la place.');
    }

    #[Route('/test', name: 'app_test', methods: ['GET'])]
    public function test(): JsonResponse
    {
        return $this->json([
            'success' => true,
            'message' => 'API Symfony fonctionnelle !'
        ]);
    }
    
    /**
     * Endpoint to list users for chat functionality
     */
    #[Route('/users/list', name: 'api_users_list', methods: ['GET'])]
    public function listUsers(): JsonResponse
    {
        try {
            // Get current user
            $currentUser = $this->getUser();
            if (!$currentUser) {
                return $this->json(['message' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
            }
            
            // Récupérer l'ID de l'utilisateur courant
            // Utilisation de l'interface UserInterface
            $currentUserId = null;
            if ($currentUser instanceof User) {
                $currentUserId = $currentUser->getId();
            } else {
                // Fallback sur l'identifiant utilisateur
                $currentUserId = $currentUser->getUserIdentifier();
            }
            
            // Find all users except the current user
            $users = $this->userRepository->findAllExcept($currentUserId);
            
            // Serialize with user roles included
            $serializedUsers = $this->serializer->serialize(
                $users, 
                'json', 
                ['groups' => ['user:read', 'message:read']]
            );
            
            return new JsonResponse($serializedUsers, JsonResponse::HTTP_OK, [], true);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Error fetching users: ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function getCurrentUser(): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return $this->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], JsonResponse::HTTP_UNAUTHORIZED);
            }

            // Serialize user data with necessary groups
            $userData = $this->serializer->serialize(
                $user,
                'json',
                ['groups' => ['user:read']]
            );

            return new JsonResponse($userData, JsonResponse::HTTP_OK, [], true);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Error fetching user data: ' . $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}