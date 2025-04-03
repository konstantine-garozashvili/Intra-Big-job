<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Service to centralize common user profile operations
 */
class UserProfileService
{
    private $entityManager;
    private $userRepository;
    private $serializer;
    private $documentStorageFactory;
    
    public function __construct(
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        SerializerInterface $serializer,
        DocumentStorageFactory $documentStorageFactory
    ) {
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->serializer = $serializer;
        $this->documentStorageFactory = $documentStorageFactory;
    }
    
    /**
     * Get comprehensive user profile data with all relations
     */
    public function getUserProfileData(User $user): array
    {
        // Récupérer l'utilisateur avec toutes ses relations chargées
        $user = $this->userRepository->findOneWithAllRelations($user->getId());
        
        if (!$user) {
            throw new \Exception('Utilisateur non trouvé');
        }
        
        // Données de base de l'utilisateur
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
            'roles' => array_map(function($role) {
                return is_string($role) ? $role : $role->getName();
            }, $user->getRoles()),
        ];
        
        // Ajouter les adresses
        $userData['addresses'] = array_map(function($address) {
            return [
                'id' => $address->getId(),
                'name' => $address->getName(),
                'complement' => $address->getComplement(),
                'city' => $address->getCity() ? [
                    'id' => $address->getCity()->getId(),
                    'name' => $address->getCity()->getName()
                ] : null,
                'postalCode' => $address->getPostalCode() ? [
                    'id' => $address->getPostalCode()->getId(),
                    'code' => $address->getPostalCode()->getCode()
                ] : null
            ];
        }, $user->getAddresses()->toArray());
        
        // Ajouter la nationalité
        $userData['nationality'] = $user->getNationality() ? [
            'id' => $user->getNationality()->getId(),
            'name' => $user->getNationality()->getName(),
        ] : null;
        
        // Ajouter le thème
        $userData['theme'] = $user->getTheme() ? [
            'id' => $user->getTheme()->getId(),
            'name' => $user->getTheme()->getName(),
        ] : null;
        
        // Ajouter le profil étudiant s'il existe
        if ($user->getStudentProfile()) {
            $studentProfile = $user->getStudentProfile();
            $userData['studentProfile'] = [
                'id' => $studentProfile->getId(),
                'isSeekingInternship' => $studentProfile->isSeekingInternship(),
                'isSeekingApprenticeship' => $studentProfile->isSeekingApprenticeship(),
                'portfolioUrl' => $studentProfile->getPortfolioUrl(),
                'createdAt' => $studentProfile->getCreatedAt() ? $studentProfile->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updatedAt' => $studentProfile->getUpdatedAt() ? $studentProfile->getUpdatedAt()->format('Y-m-d H:i:s') : null,
            ];
        } else {
            $userData['studentProfile'] = null;
        }
        
        // Ajouter la spécialisation
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
        
        // Ajouter la ville par défaut (basée sur la première adresse)
        $userData['city'] = 'Non renseignée';
        if (!empty($userData['addresses'])) {
            $firstAddress = $userData['addresses'][0];
            if (isset($firstAddress['city']['name'])) {
                $userData['city'] = $firstAddress['city']['name'];
            }
        }
        
        // Ajouter les documents
        $userData['documents'] = []; // À implémenter si nécessaire
        
        // Ajouter les statistiques de profil
        $userData['stats'] = [
            'profile' => [], // À implémenter si nécessaire
        ];
        
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
} 