<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\DiplomaRepository;
use App\Service\UserDiplomaService;
use App\Service\UserProfileService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/profile')]
class ProfileDataController extends AbstractController
{
    private $security;
    private $serializer;
    private $entityManager;
    private $userRepository;
    private $diplomaRepository;
    private $userDiplomaService;
    private $userProfileService;
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        DiplomaRepository $diplomaRepository,
        UserDiplomaService $userDiplomaService,
        UserProfileService $userProfileService
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->diplomaRepository = $diplomaRepository;
        $this->userDiplomaService = $userDiplomaService;
        $this->userProfileService = $userProfileService;
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
                'cvFilePath' => $user->getCvFilePath(),
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
     * Get user roles as array
     */
    private function getUserRolesAsArray(User $user): array
    {
        return array_map(function($role) {
            return is_string($role) ? $role : $role->getName();
        }, $user->getRoles());
    }

    /**
     * Get public documents for a specific user
     */
    #[Route('/public/{id}/documents', name: 'api_profile_public_documents', methods: ['GET'])]
    public function getPublicUserDocuments(int $id): JsonResponse
    {
        // Debug log
        error_log("Attempting to fetch documents for user ID: " . $id);
        
        // Récupérer l'utilisateur
        $user = $this->userRepository->findOneWithAllRelations($id);
        
        if (!$user) {
            error_log("User not found with ID: " . $id);
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        error_log("User found with ID: " . $id);
        
        try {
            // Utiliser le service de profil pour récupérer les documents publics
            $documents = $this->userProfileService->getPublicUserDocuments($user);
            error_log("Documents retrieved: " . json_encode($documents));
            
            return $this->json([
                'success' => true,
                'data' => [
                    'documents' => $documents
                ]
            ]);
        } catch (\Exception $e) {
            error_log("Error fetching documents: " . $e->getMessage());
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des documents: ' . $e->getMessage()
            ], 500);
        }
    }
}
