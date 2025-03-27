<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Repository\UserRepository;
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
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
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
                'linkedinUrl' => $user->getLinkedinUrl(),
                'nationality' => $user->getNationality() ? [
                    'id' => $user->getNationality()->getId(),
                    'name' => $user->getNationality()->getName(),
                ] : null,
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
            ]
        ];
        
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
}
