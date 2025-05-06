<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\DiplomaRepository;
use App\Service\UserDiplomaService;
use App\Service\DocumentStorageFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;

class ProfileDataController extends AbstractController
{
    private $security;
    private $serializer;
    private $entityManager;
    private $userRepository;
    private $diplomaRepository;
    private $userDiplomaService;
    private $documentStorageFactory;
    private $documentRepository;
    private $documentTypeRepository;
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        DiplomaRepository $diplomaRepository,
        UserDiplomaService $userDiplomaService,
        DocumentStorageFactory $documentStorageFactory,
        \App\Domains\Global\Document\Repository\DocumentRepository $documentRepository,
        \App\Domains\Global\Document\Repository\DocumentTypeRepository $documentTypeRepository
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->diplomaRepository = $diplomaRepository;
        $this->userDiplomaService = $userDiplomaService;
        $this->documentStorageFactory = $documentStorageFactory;
        $this->documentRepository = $documentRepository;
        $this->documentTypeRepository = $documentTypeRepository;
    }

    /**
     * Récupère toutes les données utilisateur pour le profil
     */
    #[Route('/user-data', name: 'api_profile_user_data', methods: ['GET'])]
    public function getUserProfileData(): JsonResponse
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
        
        // Formatter les adresses
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
        
        // Formatter les diplômes
        $diplomas = [];
        foreach ($user->getDiplomas() as $diploma) {
            $diplomas[] = [
                'id' => $diploma->getId(),
                'name' => $diploma->getName(),
                'obtainedAt' => $diploma->getObtainedAt() ? $diploma->getObtainedAt()->format('Y-m-d') : null,
                'institution' => $diploma->getInstitution() ? $diploma->getInstitution()->getName() : null,
                'location' => $diploma->getLocation(),
            ];
        }
        
        // Récupérer les données utilisateur avec les relations
        $userData = [
            'user' => [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'phoneNumber' => $user->getPhoneNumber(),
                'linkedinUrl' => $user->getLinkedinUrl(),
                'profilePicturePath' => $user->getProfilePicturePath(),
                'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
                'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'isEmailVerified' => $user->isEmailVerified(),
                'nationality' => $user->getNationality() ? [
                    'id' => $user->getNationality()->getId(),
                    'name' => $user->getNationality()->getName(),
                ] : null,
                'hasCvDocument' => !empty($this->documentRepository->findBy([
                    'user' => $user,
                    'documentType' => $this->documentTypeRepository->findOneBy(['code' => 'CV'])
                ])),
                'theme' => $user->getTheme() ? [
                    'id' => $user->getTheme()->getId(),
                    'name' => $user->getTheme()->getName(),
                ] : null,
                'roles' => $this->getUserRolesAsArray($user),
                'specialization' => $user->getSpecialization() ? [
                    'id' => $user->getSpecialization()->getId(),
                    'name' => $user->getSpecialization()->getName(),
                    'domain' => $user->getSpecialization()->getDomain() ? [
                        'id' => $user->getSpecialization()->getDomain()->getId(),
                        'name' => $user->getSpecialization()->getDomain()->getName(),
                    ] : null,
                ] : null,
                'addresses' => $addresses,
                'diplomas' => $diplomas,
            ]
        ];
        
        // Ajouter l'URL de la photo de profil si disponible
        if ($user->getProfilePicturePath()) {
            try {
                $profilePictureUrl = $this->documentStorageFactory->getDocumentUrl($user->getProfilePicturePath());
                $userData['user']['profilePictureUrl'] = $profilePictureUrl;
            } catch (\Exception $e) {
                // En cas d'erreur, on ne bloque pas la réponse, on continue sans l'URL
                $userData['user']['profilePictureUrl'] = null;
            }
        } else {
            $userData['user']['profilePictureUrl'] = null;
        }
        
        // Ajouter le profil étudiant si l'utilisateur en a un
        if ($user->getStudentProfile()) {
            $studentProfile = $user->getStudentProfile();
            $userData['user']['studentProfile'] = [
                'id' => $studentProfile->getId(),
                'isSeekingInternship' => $studentProfile->isSeekingInternship(),
                'isSeekingApprenticeship' => $studentProfile->isSeekingApprenticeship(),
                'portfolioUrl' => $studentProfile->getPortfolioUrl(),
                'currentInternshipCompany' => $studentProfile->getCurrentInternshipCompany(),
                'internshipStartDate' => $studentProfile->getInternshipStartDate() ? $studentProfile->getInternshipStartDate()->format('Y-m-d') : null,
                'internshipEndDate' => $studentProfile->getInternshipEndDate() ? $studentProfile->getInternshipEndDate()->format('Y-m-d') : null,
                'situationType' => $studentProfile->getSituationType() ? [
                    'id' => $studentProfile->getSituationType()->getId(),
                    'name' => $studentProfile->getSituationType()->getName()
                ] : null,
            ];
        }
        
        return $this->json([
            'success' => true,
            'data' => $userData
        ]);
    }

    /**
     * Récupère toutes les données du profil en une seule requête
     */
    #[Route('/all', name: 'api_profile_all', methods: ['GET'])]
    public function getAllProfileData(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Récupérer les données de base du profil
        $profileData = $this->getUserProfileData()->getContent();
        $profileData = json_decode($profileData, true);
        
        // Récupérer les statistiques et autres données si nécessaire
        // ...
        
        return $this->json([
            'success' => true,
            'data' => $profileData['data']
        ]);
    }

    /**
     * Get public profile data for a specific user
     */
    #[Route('/public/{id}', name: 'api_profile_public', methods: ['GET'])]
    public function getPublicProfileData(int $id): JsonResponse
    {
        // Récupérer l'utilisateur avec toutes ses relations chargées
        $user = $this->userRepository->findOneWithAllRelations($id);
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }
        
        // Préparer les données de base du profil
        $userData = [
            'user' => [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'phoneNumber' => $user->getPhoneNumber(),
                'linkedinUrl' => $user->getLinkedinUrl(),
                'profilePicturePath' => $user->getProfilePicturePath(),
                'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
                'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'isEmailVerified' => $user->isEmailVerified(),
                'roles' => $this->getUserRolesAsArray($user),
                'specialization' => $user->getSpecialization() ? [
                    'id' => $user->getSpecialization()->getId(),
                    'name' => $user->getSpecialization()->getName(),
                    'domain' => $user->getSpecialization()->getDomain() ? [
                        'id' => $user->getSpecialization()->getDomain()->getId(),
                        'name' => $user->getSpecialization()->getDomain()->getName(),
                    ] : null,
                ] : null,
            ]
        ];
        
        // Ajouter l'URL de la photo de profil si disponible
        if ($user->getProfilePicturePath()) {
            try {
                $profilePictureUrl = $this->documentStorageFactory->getDocumentUrl($user->getProfilePicturePath());
                $userData['user']['profilePictureUrl'] = $profilePictureUrl;
            } catch (\Exception $e) {
                // En cas d'erreur, on ne bloque pas la réponse, on continue sans l'URL
                $userData['user']['profilePictureUrl'] = null;
            }
        } else {
            $userData['user']['profilePictureUrl'] = null;
        }
        
        // Ajouter les adresses si disponibles
        $addresses = $user->getAddresses();
        if (!$addresses->isEmpty()) {
            $userData['user']['addresses'] = array_map(function($address) {
                return [
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
            }, $addresses->toArray());
        }
        
        // Ajouter les diplômes si disponibles en utilisant le service dédié
        $userData['user']['diplomas'] = $this->userDiplomaService->formatUserDiplomas($user);
        
        // Ajouter le profil étudiant si disponible
        if ($user->getStudentProfile()) {
            $userData['user']['studentProfile'] = [
                'id' => $user->getStudentProfile()->getId(),
                'isSeekingInternship' => $user->getStudentProfile()->isSeekingInternship(),
                'isSeekingApprenticeship' => $user->getStudentProfile()->isSeekingApprenticeship(),
                'portfolioUrl' => $user->getStudentProfile()->getPortfolioUrl(),
                'currentInternshipCompany' => $user->getStudentProfile()->getCurrentInternshipCompany(),
                'internshipStartDate' => $user->getStudentProfile()->getInternshipStartDate() ? $user->getStudentProfile()->getInternshipStartDate()->format('Y-m-d') : null,
                'internshipEndDate' => $user->getStudentProfile()->getInternshipEndDate() ? $user->getStudentProfile()->getInternshipEndDate()->format('Y-m-d') : null,
                'situationType' => $user->getStudentProfile()->getSituationType() ? [
                    'id' => $user->getStudentProfile()->getSituationType()->getId(),
                    'name' => $user->getStudentProfile()->getSituationType()->getName()
                ] : null,
            ];
        }
        
        return $this->json([
            'success' => true,
            'data' => $userData
        ]);
    }

    /**
     * Get profile statistics including completion percentage
     */
    #[Route('/stats', name: 'api_profile_stats', methods: ['GET'])]
    public function getProfileStats(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        try {
            // Calculate profile completion percentage based on the three criteria:
            // 1. LinkedIn URL
            // 2. CV Document
            // 3. At least one diploma
            
            $requiredItems = 3;
            $completedItems = 0;
            
            // Check LinkedIn URL
            if ($user->getLinkedinUrl()) {
                $completedItems++;
            }
            
            // Check CV Document
            $cvDocuments = $this->documentRepository->findBy([
                'user' => $user,
                'documentType' => $this->documentTypeRepository->findOneBy(['code' => 'CV'])
            ]);
            
            if (!empty($cvDocuments)) {
                $completedItems++;
            }
            
            // Check Diplomas
            if (!$user->getUserDiplomas()->isEmpty()) {
                $completedItems++;
            }
            
            $completionPercentage = round(($completedItems / $requiredItems) * 100);
            $isProfileComplete = $completionPercentage >= 100;
            
            // Get acknowledgment status
            $isAcknowledged = $user->isProfileCompletionAcknowledged();
            
            // Reset acknowledgment if profile was complete but is no longer complete
            if (!$isProfileComplete && $isAcknowledged) {
                $user->setProfileCompletionAcknowledged(false);
                $this->entityManager->persist($user);
                $this->entityManager->flush();
                $isAcknowledged = false;
            }
            
            return $this->json([
                'success' => true,
                'stats' => [
                    'profile' => [
                        'completionPercentage' => $completionPercentage,
                        'requiredItems' => $requiredItems,
                        'completedItems' => $completedItems,
                        'isComplete' => $isProfileComplete,
                        'isAcknowledged' => $isAcknowledged
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors du calcul des statistiques: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Acknowledge profile completion
     * This endpoint is called when the user acknowledges the profile completion message
     */
    #[Route('/acknowledge-completion', name: 'api_profile_acknowledge_completion', methods: ['POST'])]
    public function acknowledgeProfileCompletion(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        try {
            // Set acknowledgment flag to true
            $user->setProfileCompletionAcknowledged(true);
            $this->entityManager->persist($user);
            $this->entityManager->flush();
            
            return $this->json([
                'success' => true,
                'message' => 'Accusé de réception de la complétion de profil enregistré'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement de l\'accusé de réception: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user roles as array
     */
    private function getUserRolesAsArray(User $user): array
    {
        return array_map(function($role) {
            return is_string($role) ? $role : $role->getName();
        }, $user->getRoles());
    }

    /**
     * Récupère toutes les formations du user connecté
     */
    #[Route('/formations', name: 'api_profile_formations', methods: ['GET'])]
    public function getUserFormations(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        // Use direct query to fetch formations
        $formations = $this->userRepository->findFormationsForUser($user->getId());
        $data = [];
        foreach ($formations as $formation) {
            $data[] = [
                'id' => $formation->getId(),
                'name' => $formation->getName(),
                'promotion' => $formation->getPromotion(),
                'description' => $formation->getDescription(),
                'dateStart' => $formation->getDateStart() ? $formation->getDateStart()->format('Y-m-d') : null,
                'location' => $formation->getLocation(),
                'duration' => $formation->getDuration(),
            ];
        }
        return $this->json([
            'success' => true,
            'data' => $data
        ]);
    }
}
