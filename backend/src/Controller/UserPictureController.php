<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\UserProfileService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Psr\Log\LoggerInterface;

#[Route('/api')]
class UserPictureController extends AbstractController
{
    private $security;
    private $userProfileService;
    
    public function __construct(
        Security $security,
        UserProfileService $userProfileService
    ) {
        $this->security = $security;
        $this->userProfileService = $userProfileService;
    }
    
    /**
     * Upload a profile picture for the authenticated user
     */
    #[Route('/profile/picture', name: 'api_user_profile_picture_upload', methods: ['POST'])]
    public function uploadProfilePicture(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $uploadedFile = $request->files->get('profile_picture');
        
        if (!$uploadedFile) {
            // Log the request details for debugging
            $files = $request->files->all();
            $fileKeys = array_keys($files);
            $postKeys = array_keys($request->request->all());
            
            return $this->json([
                'success' => false,
                'message' => 'Aucun fichier n\'a été envoyé',
                'debug' => [
                    'files_keys' => $fileKeys,
                    'post_keys' => $postKeys,
                    'content_type' => $request->headers->get('Content-Type')
                ]
            ], 400);
        }
        
        $result = $this->userProfileService->handleProfilePictureUpload($user, $uploadedFile);
        
        if (!$result['success']) {
            return $this->json($result, 400);
        }
        
        return $this->json($result);
    }
    
    /**
     * Delete the profile picture of the authenticated user
     */
    #[Route('/profile/picture', name: 'api_user_profile_picture_delete', methods: ['DELETE'])]
    public function deleteProfilePicture(
        LoggerInterface $logger
    ): JsonResponse {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $result = $this->userProfileService->deleteProfilePicture($user);
        
        if (!$result['success']) {
            $logger->warning('Failed to delete profile picture', [
                'user_id' => $user->getId(),
                'error' => $result['message']
            ]);
            return $this->json($result, 400);
        }
        
        return $this->json($result);
    }
    
    /**
     * Get the profile picture URL of the authenticated user
     */
    #[Route('/profile/picture', name: 'api_user_profile_picture_get', methods: ['GET'])]
    public function getProfilePicture(): JsonResponse {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $result = $this->userProfileService->getProfilePictureUrl($user);
        
        if (!$result['success']) {
            return $this->json($result, 404);
        }
        
        return $this->json($result);
    }
} 