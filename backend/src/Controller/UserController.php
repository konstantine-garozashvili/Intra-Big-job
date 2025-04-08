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
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api')]
class UserController extends AbstractController
{
    private $security;
    private $serializer;
    private $userRepository;
    private $validationService;
    private $httpClient;
    private $recaptchaSecret;
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        UserRepository $userRepository,
        ValidationService $validationService,
        HttpClientInterface $httpClient,
        string $recaptchaSecret = null
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->userRepository = $userRepository;
        $this->validationService = $validationService;
        $this->httpClient = $httpClient;
        $this->recaptchaSecret = $recaptchaSecret ?: $_ENV['RECAPTCHA_SECRET_KEY'] ?? '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';
    }
    
    /**
     * Méthode pour vérifier un token reCAPTCHA
     */
    private function verifyRecaptchaToken(?string $token): bool
    {
        // Si pas de token, retourner false
        if (!$token) {
            return false;
        }
        
        try {
            // Appeler l'API Google reCAPTCHA pour vérifier le token
            $response = $this->httpClient->request('POST', 'https://www.google.com/recaptcha/api/siteverify', [
                'body' => [
                    'secret' => $this->recaptchaSecret,
                    'response' => $token
                ]
            ]);
            
            // Décoder la réponse JSON
            $result = $response->toArray();
            
            // Journaliser la réponse en développement
            if ($_ENV['APP_ENV'] === 'dev') {
                error_log('Réponse de vérification reCAPTCHA: ' . json_encode($result));
            }
            
            // Vérifier si la validation a réussi
            return $result['success'] === true;
            
        } catch (\Exception $e) {
            // Journaliser l'erreur
            error_log('Erreur lors de la vérification du reCAPTCHA: ' . $e->getMessage());
            return false;
        }
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
            
            // Vérifier le token reCAPTCHA
            $recaptchaToken = $data['recaptcha_token'] ?? null;
            if (!$this->verifyRecaptchaToken($recaptchaToken)) {
                return $this->json([
                    'success' => false,
                    'message' => 'Vérification reCAPTCHA échouée. Veuillez réessayer.'
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