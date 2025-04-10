<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\DocumentStorageFactory;
use App\Service\RegistrationService;
use App\Service\ValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Annotation\IsGranted;
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
    private $documentStorageFactory;
    private $recaptchaSecret;
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        UserRepository $userRepository,
        ValidationService $validationService,
        DocumentStorageFactory $documentStorageFactory,
        string $recaptchaSecret = null
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->userRepository = $userRepository;
        $this->validationService = $validationService;
        $this->documentStorageFactory = $documentStorageFactory;
        $this->recaptchaSecret = $recaptchaSecret ?: $_ENV['RECAPTCHA_SECRET_KEY'] ?? '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';
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
    #[IsGranted('ROLE_STUDENT')]
    public function listUsers(Request $request): JsonResponse
    {
        try {
            $currentUser = $this->getUser();
            if (!$currentUser) {
                return $this->json(['message' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
            }
            
            // Get includeRoles parameter
            $includeRoles = $request->query->getBoolean('includeRoles', false);
            
            // Find all users except the current user
            $users = $this->userRepository->findAllExcept($currentUser->getId(), $includeRoles);
            
            // Format users with profile picture URLs
            $formattedUsers = [];
            foreach ($users as $user) {
                $userData = [
                    'id' => $user->getId(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'email' => $user->getEmail(),
                    'profilePicturePath' => $user->getProfilePicturePath(),
                    'profilePictureUrl' => null,
                    'city' => $user->getAddresses()->first()?->getCity()?->getName() ?? "Non renseignée"
                ];
                
                // Add profile picture URL if available
                if ($user->getProfilePicturePath()) {
                    try {
                        // Get the S3 URL directly
                        $userData['profilePictureUrl'] = $this->documentStorageFactory->getDocumentUrl($user->getProfilePicturePath());
                    } catch (\Exception $e) {
                        // Continue without URL in case of error
                    }
                }
                
                // Add roles if requested
                if ($includeRoles) {
                    $userData['userRoles'] = array_map(function($userRole) {
                        return [
                            'id' => $userRole->getId(),
                            'role' => [
                                'id' => $userRole->getRole()->getId(),
                                'name' => $userRole->getRole()->getName()
                            ]
                        ];
                    }, $user->getUserRoles()->toArray());
                }
                
                $formattedUsers[] = $userData;
            }
            
            return $this->json([
                'success' => true,
                'data' => $formattedUsers
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Error fetching users: ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint to view a user's public profile
     */
    #[Route('/profile/view/{id}', name: 'api_profile_view', methods: ['GET'])]
    #[IsGranted('ROLE_STUDENT')]
    public function viewProfile(Request $request, $id): JsonResponse
    {
        try {
            $currentUser = $this->getUser();
            if (!$currentUser) {
                return $this->json(['message' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
            }

            $user = $this->userRepository->find($id);
            if (!$user) {
                return $this->json(['message' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
            }

            // Check if the user can view this profile based on roles
            $currentUserRoles = $currentUser->getUserRoles()->map(function($role) {
                return $role->getRole()->getName();
            })->toArray();

            $targetUserRoles = $user->getUserRoles()->map(function($role) {
                return $role->getRole()->getName();
            })->toArray();

            // Admins and Super Admins can view all profiles
            if (in_array('ADMIN', $currentUserRoles) || in_array('SUPER_ADMIN', $currentUserRoles)) {
                return $this->json([
                    'success' => true,
                    'data' => $this->formatUserProfile($user)
                ]);
            }

            // Students can only view TEACHER, STUDENT, RECRUITER, and HR profiles
            if (in_array('STUDENT', $currentUserRoles)) {
                if (array_intersect(['TEACHER', 'STUDENT', 'RECRUITER', 'HR'], $targetUserRoles)) {
                    return $this->json([
                        'success' => true,
                        'data' => $this->formatUserProfile($user)
                    ]);
                }
            }

            // HR can only view TEACHER, STUDENT, and RECRUITER profiles
            if (in_array('HR', $currentUserRoles)) {
                if (array_intersect(['TEACHER', 'STUDENT', 'RECRUITER'], $targetUserRoles)) {
                    return $this->json([
                        'success' => true,
                        'data' => $this->formatUserProfile($user)
                    ]);
                }
            }

            // Recruiters can only view TEACHER and STUDENT profiles
            if (in_array('RECRUITER', $currentUserRoles)) {
                if (array_intersect(['TEACHER', 'STUDENT'], $targetUserRoles)) {
                    return $this->json([
                        'success' => true,
                        'data' => $this->formatUserProfile($user)
                    ]);
                }
            }

            // Teachers can only view STUDENT and HR profiles
            if (in_array('TEACHER', $currentUserRoles)) {
                if (array_intersect(['STUDENT', 'HR'], $targetUserRoles)) {
                    return $this->json([
                        'success' => true,
                        'data' => $this->formatUserProfile($user)
                    ]);
                }
            }

            // Guests can only view RECRUITER profiles
            if (in_array('GUEST', $currentUserRoles)) {
                if (in_array('RECRUITER', $targetUserRoles)) {
                    return $this->json([
                        'success' => true,
                        'data' => $this->formatUserProfile($user)
                    ]);
                }
            }

            return $this->json([
                'success' => false,
                'message' => 'You do not have permission to view this profile'
            ], JsonResponse::HTTP_FORBIDDEN);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Error fetching profile: ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function formatUserProfile($user)
    {
        return [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'profilePicturePath' => $user->getProfilePicturePath(),
            'profilePictureUrl' => $user->getProfilePicturePath() ? $this->documentStorageFactory->getDocumentUrl($user->getProfilePicturePath()) : null,
            'city' => $user->getCity() ? [
                'id' => $user->getCity()->getId(),
                'name' => $user->getCity()->getName()
            ] : null,
            'userRoles' => array_map(function($userRole) {
                return [
                    'id' => $userRole->getId(),
                    'role' => [
                        'id' => $userRole->getRole()->getId(),
                        'name' => $userRole->getRole()->getName()
                    ]
                ];
            }, $user->getUserRoles()->toArray())
        ];
    }
}