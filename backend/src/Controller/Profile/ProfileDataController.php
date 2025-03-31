<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\DiplomaRepository;
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
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        DiplomaRepository $diplomaRepository
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->diplomaRepository = $diplomaRepository;
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
     * Endpoint pour vérifier l'état de complétude du profil directement depuis la base de données
     */
    #[Route('/completion-status', name: 'api_profile_completion', methods: ['GET'])]
    public function getProfileCompletionStatus(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        $defaultResponse = [
            'success' => true,
            'data' => [
                'completionPercentage' => 0,
                'hasLinkedIn' => false,
                'hasCv' => false,
                'hasDiploma' => false,
                'isGuest' => true,
                'completedItems' => 0,
                'totalItems' => 3
            ]
        ];
        
        if (!$user) {
            return $this->json($defaultResponse);
        }
        
        // Check if user is a guest user
        $isGuest = false;
        foreach ($user->getUserRoles() as $userRole) {
            if ($userRole->getRole()->getName() === 'GUEST') {
                $isGuest = true;
                break;
            }
        }
        
        // Return default response for guest users
        if ($isGuest) {
            return $this->json($defaultResponse);
        }
        
        try {
            // Charger l'utilisateur avec toutes ses relations
            $user = $this->userRepository->findOneWithAllRelations($user->getId());
            
            // Vérifier si l'utilisateur a un URL LinkedIn
            $hasLinkedIn = !empty($user->getLinkedinUrl());
            
            // Vérifier si l'utilisateur a un CV
            $hasCv = false;
            try {
                // Check if user has a CV file path
                $hasCv = !empty($user->getCvFilePath());
            } catch (\Exception $e) {
                // Log error if needed but continue execution
                $hasCv = false;
            }
            
            // Vérifier si l'utilisateur a des diplômes
            $hasDiploma = $user->getDiplomas()->count() > 0;
            
            // Calculer le pourcentage de complétion
            $completedItems = ($hasLinkedIn ? 1 : 0) + ($hasCv ? 1 : 0) + ($hasDiploma ? 1 : 0);
            $totalItems = 3;
            $completionPercentage = ($completedItems / $totalItems) * 100;
            
            return $this->json([
                'success' => true,
                'data' => [
                    'hasLinkedIn' => $hasLinkedIn,
                    'hasCv' => $hasCv,
                    'hasDiploma' => $hasDiploma,
                    'completedItems' => $completedItems,
                    'totalItems' => $totalItems,
                    'completionPercentage' => $completionPercentage
                ]
            ]);
        } catch (\Exception $e) {
            // Return error response with details
            return $this->json([
                'success' => false,
                'message' => 'Error checking profile completion: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
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
}
