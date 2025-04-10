<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Psr\Log\LoggerInterface;

#[Route('/api/profile')]
class ProfileController extends AbstractController
{
    private $security;
    private $logger;
    private $userRepository;
    
    public function __construct(
        Security $security,
        LoggerInterface $logger,
        UserRepository $userRepository
    ) {
        $this->security = $security;
        $this->logger = $logger;
        $this->userRepository = $userRepository;
    }

    /**
     * Get the authenticated user
     */
    protected function getUser(): ?User
    {
        return $this->security->getUser();
    }

    /**
     * Create a standard error response
     */
    protected function createErrorResponse(string $message, int $status = 400): JsonResponse
    {
        return $this->json([
            'success' => false,
            'message' => $message
        ], $status);
    }

    /**
     * Create a standard success response
     */
    protected function createSuccessResponse(string $message, array $data = []): JsonResponse
    {
        return $this->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    #[Route('/users/{id}/public', name: 'get_public_profile', methods: ['GET'])]
    public function getPublicProfile(int $id): JsonResponse
    {
        $this->logger->info('Public profile request received', [
            'requested_user_id' => $id,
            'current_user_id' => $this->getUser()?->getId(),
            'current_user_roles' => $this->getUser()?->getRoles()
        ]);

        try {
            $user = $this->userRepository->findOneWithAllRelations($id);
            
            if (!$user) {
                $this->logger->warning('User not found', ['id' => $id]);
                return $this->json(['error' => 'Utilisateur non trouvé'], 404);
            }

            // Log the found user details
            $this->logger->info('User found', [
                'user_id' => $user->getId(),
                'user_roles' => $user->getRoles()
            ]);

            // Return basic user data instead of using serializer
            return $this->json([
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'roles' => $user->getRoles()
                ]
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error fetching public profile', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->json(['error' => 'Une erreur est survenue'], 500);
        }
    }
}
