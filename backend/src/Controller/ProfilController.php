<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\DiplomaRepository;
use App\Repository\AddressRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/profil')]
class ProfilController extends AbstractController
{
    private $security;
    private $serializer;
    private $entityManager;
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        EntityManagerInterface $entityManager
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->entityManager = $entityManager;
    }

    /**
     * Récupère toutes les données utilisateur pour le profil
     */
    #[Route('/user-data', name: 'api_profil_user_data', methods: ['GET'])]
    public function getUserProfilData(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Récupérer les données utilisateur avec les relations
        $userData = [
            'user' => [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'phoneNumber' => $user->getPhoneNumber(),
                'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
                'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'isEmailVerified' => $user->isEmailVerified(),
                'nationality' => $user->getNationality() ? [
                    'id' => $user->getNationality()->getId(),
                    'name' => $user->getNationality()->getName(),
                ] : null,
                'theme' => $user->getTheme() ? [
                    'id' => $user->getTheme()->getId(),
                    'name' => $user->getTheme()->getName(),
                ] : null,
                'roles' => $this->getUserRolesAsArray($user),
            ]
        ];
        
        return $this->json([
            'success' => true,
            'data' => $userData
        ]);
    }
    
    /**
     * Récupère les diplômes de l'utilisateur
     */
    #[Route('/diplomas', name: 'api_profil_diplomas', methods: ['GET'])]
    public function getUserDiplomas(DiplomaRepository $diplomaRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $diplomas = [];
        foreach ($user->getDiplomas() as $diploma) {
            $diplomas[] = [
                'id' => $diploma->getId(),
                'name' => $diploma->getName(),
                'obtainedAt' => $diploma->getObtainedAt() ? $diploma->getObtainedAt()->format('Y-m-d') : null,
            ];
        }
        
        return $this->json([
            'success' => true,
            'data' => [
                'diplomas' => $diplomas
            ]
        ]);
    }
    
    /**
     * Récupère les adresses de l'utilisateur
     */
    #[Route('/addresses', name: 'api_profil_addresses', methods: ['GET'])]
    public function getUserAddresses(AddressRepository $addressRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
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
        
        return $this->json([
            'success' => true,
            'data' => [
                'addresses' => $addresses
            ]
        ]);
    }
    
    /**
     * Récupère les statistiques de l'utilisateur
     */
    #[Route('/stats', name: 'api_profil_stats', methods: ['GET'])]
    public function getUserStats(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $stats = [
            'profile' => [
                'completionPercentage' => $this->calculateProfileCompletionPercentage($user),
            ],
            'memberSince' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d') : null,
            'daysSinceRegistration' => $user->getCreatedAt() ? (new \DateTime())->diff($user->getCreatedAt())->days : null,
        ];
        
        return $this->json([
            'success' => true,
            'data' => [
                'stats' => $stats
            ]
        ]);
    }
    
    /**
     * Récupère toutes les données complètes nécessaires pour le profil en une seule requête
     */
    #[Route('/all', name: 'api_profil_all', methods: ['GET'])]
    public function getAllProfilData(
        DiplomaRepository $diplomaRepository,
        AddressRepository $addressRepository
    ): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Combiner toutes les données du profil en une seule requête
        $userData = $this->getUserDataArray($user);
        $diplomas = $this->getUserDiplomasArray($user);
        $addresses = $this->getUserAddressesArray($user);
        $stats = $this->getUserStatsArray($user);
        
        return $this->json([
            'success' => true,
            'data' => [
                'user' => $userData,
                'diplomas' => $diplomas,
                'addresses' => $addresses,
                'stats' => $stats
            ]
        ]);
    }
    
    /**
     * Méthodes privées utilitaires
     */
    private function getUserRolesAsArray(User $user): array
    {
        $roles = [];
        foreach ($user->getUserRoles() as $userRole) {
            $roles[] = [
                'id' => $userRole->getRole()->getId(),
                'name' => $userRole->getRole()->getName(),
            ];
        }
        return $roles;
    }
    
    private function calculateProfileCompletionPercentage(User $user): float
    {
        $fieldsToCheck = [
            $user->getFirstName(),
            $user->getLastName(),
            $user->getEmail(),
            $user->getPhoneNumber(),
            $user->getBirthDate(),
            $user->getNationality(),
            !$user->getAddresses()->isEmpty(),
            !$user->getDiplomas()->isEmpty(),
        ];
        
        $filledFields = array_filter($fieldsToCheck, function($field) {
            return !empty($field);
        });
        
        return (count($filledFields) / count($fieldsToCheck)) * 100;
    }
    
    private function getUserDataArray(User $user): array
    {
        return [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'phoneNumber' => $user->getPhoneNumber(),
            'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null,
            'isEmailVerified' => $user->isEmailVerified(),
            'nationality' => $user->getNationality() ? [
                'id' => $user->getNationality()->getId(),
                'name' => $user->getNationality()->getName(),
            ] : null,
            'theme' => $user->getTheme() ? [
                'id' => $user->getTheme()->getId(),
                'name' => $user->getTheme()->getName(),
            ] : null,
            'roles' => $this->getUserRolesAsArray($user),
        ];
    }
    
    private function getUserDiplomasArray(User $user): array
    {
        $diplomas = [];
        foreach ($user->getDiplomas() as $diploma) {
            $diplomas[] = [
                'id' => $diploma->getId(),
                'name' => $diploma->getName(),
                'obtainedAt' => $diploma->getObtainedAt() ? $diploma->getObtainedAt()->format('Y-m-d') : null,
            ];
        }
        
        return $diplomas;
    }
    
    private function getUserAddressesArray(User $user): array
    {
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
        
        return $addresses;
    }
    
    private function getUserStatsArray(User $user): array
    {
        return [
            'profile' => [
                'completionPercentage' => $this->calculateProfileCompletionPercentage($user),
            ],
            'memberSince' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d') : null,
            'daysSinceRegistration' => $user->getCreatedAt() ? (new \DateTime())->diff($user->getCreatedAt())->days : null,
        ];
    }
} 