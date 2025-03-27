<?php

namespace App\Controller\Profile;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;

#[Route('/api/profile')]
class ProfileController extends AbstractController
{
    private $security;
    
    public function __construct(
        Security $security
    ) {
        $this->security = $security;
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
}
