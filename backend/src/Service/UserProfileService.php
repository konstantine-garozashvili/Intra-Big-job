<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use App\Repository\UserStatusRepository;
use App\Repository\UserStatusHistoryRepository;

/**
 * Service to centralize common user profile operations
 */
class UserProfileService
{
    private $entityManager;
    private $userRepository;
    private $serializer;
    private $documentStorageFactory;
    private $userStatusRepository;
    private $userStatusHistoryRepository;
    
    public function __construct(
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        SerializerInterface $serializer,
        DocumentStorageFactory $documentStorageFactory,
        UserStatusRepository $userStatusRepository = null,
        UserStatusHistoryRepository $userStatusHistoryRepository = null
    ) {
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->serializer = $serializer;
        $this->documentStorageFactory = $documentStorageFactory;
        $this->userStatusRepository = $userStatusRepository;
        $this->userStatusHistoryRepository = $userStatusHistoryRepository;
    }
    
    /**
     * Get user profile data with all relations
     */
    public function getUserProfileData(User $user): array
    {
        // Récupérer l'utilisateur avec toutes ses relations chargées
        $user = $this->userRepository->findOneWithAllRelations($user->getId());
        
        // Récupérer les données utilisateur avec les relations
        $userData = [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'phoneNumber' => $user->getPhoneNumber(),
            'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null,
            'isEmailVerified' => $user->isEmailVerified(),
            'linkedinUrl' => $user->getLinkedinUrl(),
            'pictureProfilePath' => $user->getProfilePicturePath(),
            'nationality' => $user->getNationality() ? [
                'id' => $user->getNationality()->getId(),
                'name' => $user->getNationality()->getName(),
            ] : null,
            'theme' => $user->getTheme() ? [
                'id' => $user->getTheme()->getId(),
                'name' => $user->getTheme()->getName(),
            ] : null,
            'profilePicture' => null,
        ];

        // Ajouter le profile étudiant
        if ($user->getStudentProfile()) {
            $studentProfile = $user->getStudentProfile();
            $userData['studentProfile'] = [
                'id' => $studentProfile->getId(),
                'isSeekingInternship' => $studentProfile->isSeekingInternship(),
                'isSeekingApprenticeship' => $studentProfile->isSeekingApprenticeship(),
            ];
        } else {
            $userData['studentProfile'] = null;
        }

        // Ajouter les spécialisations
        $specialization = $user->getSpecialization();
        if ($specialization) {
            $userData['specialization'] = [
                'id' => $specialization->getId(),
                'name' => $specialization->getName(),
                'domain' => $specialization->getDomain() ? [
                    'id' => $specialization->getDomain()->getId(),
                    'name' => $specialization->getDomain()->getName(),
                ] : null,
            ];
        } else {
            $userData['specialization'] = null;
        }
        
        return $userData;
    }
    
    /**
     * Handle profile picture upload
     */
    public function handleProfilePictureUpload(User $user, UploadedFile $uploadedFile): array
    {
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
            return [
                'success' => false,
                'message' => 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WEBP',
                'debug' => [
                    'provided_mime' => $mimeType,
                    'provided_extension' => $extension,
                    'allowed_mimes' => $allowedTypes,
                    'allowed_extensions' => $allowedExtensions,
                ]
            ];
        }
        
        // Validate file size (max 5MB)
        $maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if ($uploadedFile->getSize() > $maxSize) {
            return [
                'success' => false,
                'message' => 'La taille du fichier dépasse la limite autorisée (5MB)',
            ];
        }
        
        try {
            // Get storage adapter
            $storage = $this->documentStorageFactory->createStorage();
            
            // Generate unique filename
            $newFilename = 'profile_' . $user->getId() . '_' . uniqid() . '.' . $extension;
            $storagePath = 'profile_pictures/' . $newFilename;
            
            // Store the file
            $storage->store($uploadedFile, $storagePath);
            
            // Update user profile picture path
            $oldPicturePath = $user->getProfilePicturePath();
            $user->setProfilePicturePath($storagePath);
            $this->entityManager->persist($user);
            $this->entityManager->flush();
            
            // Delete old picture if exists
            if ($oldPicturePath) {
                try {
                    $storage->delete($oldPicturePath);
                } catch (\Exception $e) {
                    // Log error but continue
                }
            }
            
            return [
                'success' => true,
                'message' => 'Photo de profil mise à jour avec succès',
                'profilePicturePath' => $storagePath
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors du téléchargement de la photo de profil: ' . $e->getMessage(),
            ];
        }
    }
    
    /**
     * Delete user profile picture
     */
    public function deleteProfilePicture(User $user): array
    {
        $picturePath = $user->getProfilePicturePath();
        
        if (!$picturePath) {
            return [
                'success' => false,
                'message' => 'Aucune photo de profil à supprimer'
            ];
        }
        
        try {
            // Get storage adapter
            $storage = $this->documentStorageFactory->createStorage();
            
            // Delete the file
            $storage->delete($picturePath);
            
            // Update user
            $user->setProfilePicturePath(null);
            $this->entityManager->persist($user);
            $this->entityManager->flush();
            
            return [
                'success' => true,
                'message' => 'Photo de profil supprimée avec succès'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la suppression de la photo de profil: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get profile picture URL
     */
    public function getProfilePictureUrl(User $user): array
    {
        $picturePath = $user->getProfilePicturePath();
        
        if (!$picturePath) {
            return [
                'success' => false,
                'message' => 'Aucune photo de profil disponible'
            ];
        }
        
        try {
            // Get storage adapter
            $storage = $this->documentStorageFactory->createStorage();
            
            // Get URL
            $url = $storage->getUrl($picturePath);
            
            return [
                'success' => true,
                'url' => $url,
                'path' => $picturePath
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la récupération de la photo de profil: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Désactive un compte utilisateur en le marquant comme "Archivé"
     * Cette fonction ne s'applique qu'aux utilisateurs ayant le rôle Guest/Invité
     * @param User $user L'utilisateur à désactiver
     * @return array Résultat de l'opération
     */
    public function deactivateAccount(User $user): array
    {
        try {
            // Vérifier si les repositories nécessaires sont injectés
            if (!$this->userStatusRepository || !$this->userStatusHistoryRepository) {
                return [
                    'success' => false,
                    'message' => 'Services requis non disponibles pour la désactivation du compte.'
                ];
            }
            
            // Vérifier si l'utilisateur a le rôle GUEST/Invité
            $hasGuestRole = false;
            foreach ($user->getUserRoles() as $userRole) {
                $roleName = $userRole->getRole()->getName();
                if (strpos(strtoupper($roleName), 'GUEST') !== false || strpos(strtoupper($roleName), 'INVITE') !== false) {
                    $hasGuestRole = true;
                    break;
                }
            }
            
            if (!$hasGuestRole) {
                return [
                    'success' => false,
                    'message' => 'Seuls les utilisateurs avec le rôle Invité peuvent désactiver leur compte.'
                ];
            }
            
            // Rechercher le statut "Archivé"
            $archivedStatus = $this->userStatusRepository->findByName('Archivé');
            
            if (!$archivedStatus) {
                return [
                    'success' => false,
                    'message' => 'Le statut "Archivé" n\'existe pas dans le système.'
                ];
            }
            
            // Rechercher l'entrée de statut actuelle de l'utilisateur
            $currentStatusHistory = $this->userStatusHistoryRepository->findCurrentByUser($user->getId());
            
            // Si l'utilisateur a déjà un statut actif, le terminer
            if ($currentStatusHistory) {
                $currentStatusHistory->setEndDate(new \DateTime());
                $this->entityManager->persist($currentStatusHistory);
            }
            
            // Créer une nouvelle entrée d'historique de statut
            $newStatusHistory = new \App\Entity\UserStatusHistory();
            $newStatusHistory->setUser($user);
            $newStatusHistory->setStatus($archivedStatus);
            $newStatusHistory->setStartDate(new \DateTime());
            
            $this->entityManager->persist($newStatusHistory);
            $this->entityManager->flush();
            
            return [
                'success' => true,
                'message' => 'Votre compte a été désactivé avec succès. Vous serez déconnecté lors de votre prochaine connexion.'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Une erreur est survenue lors de la désactivation de votre compte: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Récupère le statut actuel d'un utilisateur
     * @param User $user L'utilisateur
     * @return array Informations sur le statut actuel
     */
    public function getCurrentUserStatus(User $user): array
    {
        try {
            // Vérifier si les repositories nécessaires sont injectés
            if (!$this->userStatusHistoryRepository) {
                return [
                    'success' => false,
                    'message' => 'Services requis non disponibles pour récupérer le statut.'
                ];
            }
            
            $currentStatusHistory = $this->userStatusHistoryRepository->findCurrentByUser($user->getId());
            
            if (!$currentStatusHistory) {
                return [
                    'success' => false,
                    'message' => 'Aucun statut n\'est actuellement attribué à votre compte.'
                ];
            }
            
            return [
                'success' => true,
                'status' => $currentStatusHistory->getStatus()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération du statut: ' . $e->getMessage()
            ];
        }
    }
} 