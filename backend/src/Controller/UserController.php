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
    
    #[Route('/register', name: 'app_register', methods: ['POST'])]
    public function register(
        Request $request,
        RegistrationService $registrationService,
        ValidatorInterface $validator,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            // Récupérer les données
            $data = json_decode($request->getContent(), true);

            // Valider les données basiques
            if (!isset($data['email']) || !isset($data['password'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Données incomplètes. Email et mot de passe requis.'
                ], 400);
            }

            // Vérifier si l'email est déjà utilisé
            $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
            if ($existingUser) {
                return $this->json([
                    'success' => false,
                    'message' => 'Cet email est déjà utilisé.'
                ], 400);
            }

            // Enregistrer l'utilisateur via le service
            $user = $registrationService->registerUser($data);

            return $this->json([
                'success' => true,
                'message' => 'Inscription réussie !',
                'user' => [
                    'id' => $user->getId(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'email' => $user->getEmail()
                ]
            ], 201);
        } catch (\InvalidArgumentException $e) {
            // Erreurs de validation
            return $this->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => json_decode($e->getMessage(), true)
            ], 400);
        } catch (\Exception $e) {
            // Log l'erreur pour débogage
            error_log($e->getMessage());

            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue: ' . $e->getMessage()
            ], 500);
        }
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
            
            // Find all users except the current user
            $users = $this->userRepository->findAllExcept($currentUser->getId());
            
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

    #[Route('/users/all', name: 'api_users_all', methods: ['GET'])]
    public function getAllUsers(): JsonResponse
    {
        try {
            // Get current user
            $currentUser = $this->getUser();
            if (!$currentUser) {
                return $this->json(['message' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
            }
            
            // Get current user's roles
            $currentRoles = $currentUser->getRoles();
            $isAdmin = in_array('ROLE_ADMIN', $currentRoles) || in_array('ROLE_SUPER_ADMIN', $currentRoles);
            
            // Find all users with their relations
            $qb = $this->userRepository->createQueryBuilder('u')
                ->select('u', 'n', 't', 'ur', 'r', 's')
                ->leftJoin('u.nationality', 'n')
                ->leftJoin('u.theme', 't')
                ->leftJoin('u.userRoles', 'ur')
                ->leftJoin('ur.role', 'r')
                ->leftJoin('u.specialization', 's');
            
            // Filter out admin users if current user is not admin
            if (!$isAdmin) {
                $qb->andWhere('r.name NOT IN (:adminRoles)')
                   ->setParameter('adminRoles', ['ADMIN', 'SUPERADMIN']);
            }
            
            // Execute query
            $users = $qb->getQuery()->getResult();
            // Find all users with their relations
            $users = $this->userRepository->findAllUsers();
            
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
}