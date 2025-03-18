<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\DocumentStorageFactory;
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
    
    public function __construct(
        Security $security
    ) {
        $this->security = $security;
    }
    
    /**
     * Upload a profile picture for the authenticated user
     */
    #[Route('/profile/picture', name: 'api_user_profile_picture_upload', methods: ['POST'])]
    public function uploadProfilePicture(
        Request $request,
        EntityManagerInterface $entityManager,
        DocumentStorageFactory $storageFactory
    ): JsonResponse {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        try {
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
            
            // Log file details for debugging
            $fileDetails = [
                'original_name' => $uploadedFile->getClientOriginalName(),
                'mime_type' => $uploadedFile->getMimeType(),
                'size' => $uploadedFile->getSize(),
                'error' => $uploadedFile->getError()
            ];
            
            // Validate file type
            $mimeType = $uploadedFile->getMimeType();
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            
            // Get file extension
            $originalFilename = $uploadedFile->getClientOriginalName();
            $extension = strtolower(pathinfo($originalFilename, PATHINFO_EXTENSION));
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            
            // Check if either MIME type or extension is valid
            $validMimeType = in_array($mimeType, $allowedTypes);
            $validExtension = in_array($extension, $allowedExtensions);
            
            if (!$validMimeType && !$validExtension) {
                return $this->json([
                    'success' => false,
                    'message' => 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WEBP',
                    'debug' => [
                        'provided_mime' => $mimeType,
                        'provided_extension' => $extension,
                        'allowed_mimes' => $allowedTypes,
                        'allowed_extensions' => $allowedExtensions,
                        'file_details' => $fileDetails
                    ]
                ], 400);
            }
            
            // Validate file size (max 5MB)
            $maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if ($uploadedFile->getSize() > $maxSize) {
                return $this->json([
                    'success' => false,
                    'message' => 'La taille du fichier dépasse la limite autorisée (5MB)',
                    'debug' => [
                        'provided_size' => $uploadedFile->getSize(),
                        'max_size' => $maxSize,
                        'file_details' => $fileDetails
                    ]
                ], 400);
            }
            
            // Delete old profile picture if exists
            $oldPicturePath = $user->getProfilePicturePath();
            if ($oldPicturePath) {
                $storageFactory->delete($oldPicturePath);
            }
            
            // Upload the new profile picture
            $result = $storageFactory->upload($uploadedFile, 'profile-pictures');
            
            if (!$result['success']) {
                return $this->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'upload: ' . ($result['error'] ?? 'Erreur inconnue'),
                    'debug' => [
                        'file_details' => $fileDetails,
                        'upload_result' => $result
                    ]
                ], 500);
            }
            
            // Update user profile picture path
            $user->setProfilePicturePath($result['key']);
            $user->setUpdatedAt(new \DateTimeImmutable());
            
            $entityManager->flush();
            
            // Get the URL to access the profile picture
            $pictureUrl = $storageFactory->getDocumentUrl($result['key']);
            
            return $this->json([
                'success' => true,
                'message' => 'Photo de profil mise à jour avec succès',
                'data' => [
                    'profile_picture_path' => $result['key'],
                    'profile_picture_url' => $pictureUrl
                ]
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'upload de la photo de profil: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete the profile picture of the authenticated user
     */
    #[Route('/profile/picture', name: 'api_user_profile_picture_delete', methods: ['DELETE'])]
    public function deleteProfilePicture(
        EntityManagerInterface $entityManager,
        DocumentStorageFactory $storageFactory,
        LoggerInterface $logger
    ): JsonResponse {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            $logger->error('Tentative de suppression de photo de profil sans authentification');
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        try {
            $picturePath = $user->getProfilePicturePath();
            $logger->info('Tentative de suppression de photo de profil', [
                'user_id' => $user->getId(),
                'picture_path' => $picturePath
            ]);
            
            if (!$picturePath) {
                $logger->warning('Tentative de suppression d\'une photo de profil inexistante', [
                    'user_id' => $user->getId()
                ]);
                return $this->json([
                    'success' => false,
                    'message' => 'Aucune photo de profil à supprimer'
                ], 400);
            }
            
            // Delete the profile picture
            try {
                $deleted = $storageFactory->delete($picturePath);
                
                if (!$deleted) {
                    $logger->error('Échec de la suppression du fichier', [
                        'user_id' => $user->getId(),
                        'picture_path' => $picturePath
                    ]);
                    
                    // Même si le fichier n'a pas pu être supprimé, on peut quand même
                    // mettre à jour la base de données pour éviter des problèmes futurs
                    $user->setProfilePicturePath(null);
                    $user->setUpdatedAt(new \DateTimeImmutable());
                    $entityManager->flush();
                    
                    return $this->json([
                        'success' => true,
                        'message' => 'Photo de profil supprimée de la base de données, mais le fichier n\'a pas pu être supprimé'
                    ]);
                }
            } catch (\Exception $e) {
                $logger->error('Exception lors de la suppression du fichier', [
                    'user_id' => $user->getId(),
                    'picture_path' => $picturePath,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                // Même en cas d'erreur, on met à jour la base de données
                $user->setProfilePicturePath(null);
                $user->setUpdatedAt(new \DateTimeImmutable());
                $entityManager->flush();
                
                return $this->json([
                    'success' => true,
                    'message' => 'Photo de profil supprimée de la base de données, mais le fichier n\'a pas pu être supprimé'
                ]);
            }
            
            // Update user
            $user->setProfilePicturePath(null);
            $user->setUpdatedAt(new \DateTimeImmutable());
            
            $entityManager->flush();
            
            $logger->info('Photo de profil supprimée avec succès', [
                'user_id' => $user->getId()
            ]);
            
            return $this->json([
                'success' => true,
                'message' => 'Photo de profil supprimée avec succès'
            ]);
            
        } catch (\Exception $e) {
            $logger->error('Exception non gérée lors de la suppression de la photo de profil', [
                'user_id' => $user->getId(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la photo de profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get the profile picture URL of the authenticated user
     */
    #[Route('/profile/picture', name: 'api_user_profile_picture_get', methods: ['GET'])]
    public function getProfilePicture(
        DocumentStorageFactory $storageFactory
    ): JsonResponse {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            error_log('[ProfilePicture] Error: User not authenticated');
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        try {
            $picturePath = $user->getProfilePicturePath();
            error_log('[ProfilePicture] User ID: ' . $user->getId() . ', Picture Path: ' . ($picturePath ?: 'null'));
            
            if (!$picturePath) {
                return $this->json([
                    'success' => true,
                    'data' => [
                        'has_profile_picture' => false,
                        'profile_picture_url' => null
                    ]
                ]);
            }
            
            // Get the URL to access the profile picture
            try {
                $pictureUrl = $storageFactory->getDocumentUrl($picturePath);
                error_log('[ProfilePicture] Generated URL: ' . $pictureUrl);
                
                return $this->json([
                    'success' => true,
                    'data' => [
                        'has_profile_picture' => true,
                        'profile_picture_path' => $picturePath,
                        'profile_picture_url' => $pictureUrl
                    ]
                ]);
            } catch (\Exception $urlError) {
                error_log('[ProfilePicture] URL Generation Error: ' . $urlError->getMessage());
                error_log('[ProfilePicture] Stack trace: ' . $urlError->getTraceAsString());
                throw $urlError;
            }
            
        } catch (\Exception $e) {
            error_log('[ProfilePicture] General Error: ' . $e->getMessage());
            error_log('[ProfilePicture] Stack trace: ' . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération de la photo de profil: ' . $e->getMessage()
            ], 500);
        }
    }
} 