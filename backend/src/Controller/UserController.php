<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserRole;
use App\Entity\Role;
use App\Repository\UserRepository;
use App\Service\RegistrationService;
use App\Service\DocumentStorageFactory;
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
use Psr\Log\LoggerInterface;

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
     * Récupère le profil complet de l'utilisateur connecté
     */
    #[Route('/profile', name: 'api_user_profile', methods: ['GET'])]
    public function getUserProfile(DocumentStorageFactory $storageFactory): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
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
            $userData['specialization'] = null; // Si l'utilisateur n'a pas de spécialisation
        }
        
        
        // Ajouter l'URL de la photo de profil si elle existe
        if ($user->getProfilePicturePath()) {
            $userData['profilePicture'] = [
                'path' => $user->getProfilePicturePath(),
                'url' => $storageFactory->getDocumentUrl($user->getProfilePicturePath())
            ];
        }
        
        // Ajouter les rôles
        $roles = [];
        foreach ($user->getUserRoles() as $userRole) {
            $roles[] = [
                'id' => $userRole->getRole()->getId(),
                'name' => $userRole->getRole()->getName(),
            ];
        }
        $userData['roles'] = $roles;
        
        // Ajouter les diplômes
        $diplomas = [];
        foreach ($user->getDiplomas() as $diploma) {
            $diplomas[] = [
                'id' => $diploma->getId(),
                'name' => $diploma->getName(),
                'obtainedAt' => $diploma->obtainedAt ? $diploma->obtainedAt->format('Y-m-d') : null,
            ];
        }
        $userData['diplomas'] = $diplomas;
        
        // Ajouter les adresses
        $addresses = [];
        foreach ($user->getAddresses() as $address) {
            $addresses[] = [
                'id' => $address->getId(),
                'name' => $address->getName(),
                'complement' => $address->getComplement(),
                'postalCode' => $address->getPostalCode() ? [
                    'id' => $address->getPostalCode()->getId(),
                    'code' => $address->getPostalCode()->getCode(),
                ] : null,
                'city' => $address->getCity() ? [
                    'id' => $address->getCity()->getId(),
                    'name' => $address->getCity()->getName(),
                ] : null,
            ];
        }
        $userData['addresses'] = $addresses;
        
        return $this->json([
            'success' => true,
            'data' => $userData
        ]);
    }
    
    /**
     * Met à jour le profil de l'utilisateur connecté
     */
    #[Route('/profile', name: 'api_user_profile_update', methods: ['PUT'])]
    public function updateUserProfile(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
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
            $data = json_decode($request->getContent(), true);
            
            // Mise à jour des champs simples
            if (isset($data['firstName'])) {
                $user->setFirstName($data['firstName']);
            }
            
            if (isset($data['lastName'])) {
                $user->setLastName($data['lastName']);
            }
            
            if (isset($data['phoneNumber'])) {
                $user->setPhoneNumber($data['phoneNumber']);
            }
            
            if (isset($data['birthDate'])) {
                $user->setBirthDate(new \DateTime($data['birthDate']));
            }

            
            if (isset($data['linkedinUrl'])) {
                if (!$this->validationService->isValidLinkedInUrl($data['linkedinUrl'])) {
                    return $this->json([
                        'success' => false,
                        'message' => 'URL LinkedIn invalide. L\'URL doit commencer par https://www.linkedin.com/in/'
                    ], 400);
                }
                $user->setLinkedinUrl($data['linkedinUrl']);
            }

            if(isset($data['profilePicturePath'])) {
                $user->setProfilePicturePath($data['profilePicturePath']);
            }
            
            // Mise à jour des relations
            if (isset($data['nationality']) && is_numeric($data['nationality'])) {
                $nationality = $entityManager->getRepository('App:Nationality')->find($data['nationality']);
                if ($nationality) {
                    $user->setNationality($nationality);
                }
            }
            
            // Mise à jour du thème
            if (isset($data['theme']) && is_numeric($data['theme'])) {
                $theme = $entityManager->getRepository('App:Theme')->find($data['theme']);
                if ($theme) {
                    $user->setTheme($theme);
                }
            }

            // Mise à jour du profil étudiant
            if ($user->getStudentProfile()) {
                $studentProfile = $user->getStudentProfile();
                if (isset($data['isSeekingInternship'])) {
                    $studentProfile->setIsSeekingInternship($data['isSeekingInternship']);
                }
                if (isset($data['isSeekingApprenticeship'])) {
                    $studentProfile->setIsSeekingApprenticeship($data['isSeekingApprenticeship']);
                }
            }
            
            // Marquer la date de mise à jour
            $user->setUpdatedAt(new \DateTimeImmutable());
            
            // Valider les données
            $errors = $validator->validate($user);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }
                
                return $this->json([
                    'success' => false,
                    'message' => 'Erreurs de validation',
                    'errors' => $errorMessages
                ], 400);
            }
            
            // Sauvegarder les modifications
            $entityManager->flush();
            
            // Récupérer l'utilisateur mis à jour avec toutes ses relations
            $updatedUser = $this->userRepository->findOneWithAllRelations($user->getId());
            
            $responseData = [
                'id' => $updatedUser->getId(),
                'firstName' => $updatedUser->getFirstName(),
                'lastName' => $updatedUser->getLastName(),
                'email' => $updatedUser->getEmail(),
                'phoneNumber' => $updatedUser->getPhoneNumber(),
                'birthDate' => $updatedUser->getBirthDate() ? $updatedUser->getBirthDate()->format('Y-m-d') : null,
                'updatedAt' => $updatedUser->getUpdatedAt() ? $updatedUser->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'profilePicture' => null
            ];
            
            // Ajouter l'URL de la photo de profil si elle existe
            if ($updatedUser->getProfilePicturePath()) {
                $responseData['profilePicture'] = [
                    'path' => $updatedUser->getProfilePicturePath(),
                    'url' => $storageFactory->getDocumentUrl($updatedUser->getProfilePicturePath())
                ];
            }
            
            return $this->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => $responseData
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour du profil: ' . $e->getMessage()
            ], 500);
        }
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
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        try {
            $picturePath = $user->getProfilePicturePath();
            
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
            $pictureUrl = $storageFactory->getDocumentUrl($picturePath);
            
            return $this->json([
                'success' => true,
                'data' => [
                    'has_profile_picture' => true,
                    'profile_picture_path' => $picturePath,
                    'profile_picture_url' => $pictureUrl
                ]
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération de la photo de profil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère tous les utilisateurs avec leurs relations
     * Endpoint utilisé par le tableau de bord administrateur
     */
    #[Route('/users', name: 'api_get_all_users', methods: ['GET'])]
    public function getAllUsers(): JsonResponse
    {
        try {
            $users = $this->userRepository->findAllWithRoles();
            
            return $this->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération des utilisateurs: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update a specific user by ID
     */
    #[Route('/users/{id}', name: 'api_update_user', methods: ['PUT'])]
    public function updateUser(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        try {
            $user = $entityManager->getRepository(User::class)->find($id);

            if (!$user) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            $data = json_decode($request->getContent(), true);

            if (isset($data['firstName'])) {
                $user->setFirstName($data['firstName']);
            }

            if (isset($data['lastName'])) {
                $user->setLastName($data['lastName']);
            }

            if (isset($data['email'])) {
                $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
                if ($existingUser && $existingUser->getId() !== $user->getId()) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Cet email est déjà utilisé par un autre utilisateur.'
                    ], 400);
                }
                $user->setEmail($data['email']);
            }

            if (isset($data['phoneNumber'])) {
                $user->setPhoneNumber($data['phoneNumber']);
            }

            if (isset($data['birthDate'])) {
                $user->setBirthDate(new \DateTime($data['birthDate']));
            }

            if (isset($data['nationality']) && is_numeric($data['nationality'])) {
                $nationality = $entityManager->getRepository('App\Entity\Nationality')->find($data['nationality']);
                if ($nationality) {
                    $user->setNationality($nationality);
                }
            }

            if (isset($data['roles']) && is_array($data['roles'])) {
                foreach ($user->getUserRoles() as $userRole) {
                    $entityManager->remove($userRole);
                }

                $roleRepository = $entityManager->getRepository('App\Entity\Role');
                foreach ($data['roles'] as $roleId) {
                    $role = $roleRepository->find($roleId);
                    if ($role) {
                        $userRole = new \App\Entity\UserRole();
                        $userRole->setUser($user);
                        $userRole->setRole($role);
                        $entityManager->persist($userRole);
                    }
                }
            }

            $user->setUpdatedAt(new \DateTimeImmutable());

            $errors = $validator->validate($user);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }

                return $this->json([
                    'success' => false,
                    'message' => 'Erreurs de validation',
                    'errors' => $errorMessages
                ], 400);
            }

            $entityManager->flush();

            $roles = [];
            foreach ($user->getUserRoles() as $userRole) {
                $roles[] = [
                    'id' => $userRole->getRole()->getId(),
                    'name' => $userRole->getRole()->getName(),
                ];
            }

            return $this->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'email' => $user->getEmail(),
                    'roles' => $roles
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Delete a specific user by ID
     */
    #[Route('/users/{id}', name: 'api_delete_user', methods: ['DELETE'])]
    public function deleteUser(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $user = $entityManager->getRepository(User::class)->find($id);

            if (!$user) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            $entityManager->remove($user);
            $entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }
}