<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\RegistrationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api')]
class UserController extends AbstractController
{
    private $security;
    private $serializer;

    public function __construct(
        Security $security,
        SerializerInterface $serializer
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
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
    public function getUserProfile(): JsonResponse
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
        ];

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
                'obtainedAt' => $diploma->getObtainedAt() ? $diploma->getObtainedAt()->format('Y-m-d') : null,
            ];
        }
        $userData['diplomas'] = $diplomas;

        // Ajouter les adresses
        $addresses = [];
        foreach ($user->getAddresses() as $address) {
            $addresses[] = [
                'id' => $address->getId(),
                'streetNumber' => $address->getStreetNumber(),
                'streetName' => $address->getStreetName(),
                'postalCode' => $address->getPostalCode() ? [
                    'id' => $address->getPostalCode()->getId(),
                    'code' => $address->getPostalCode()->getCode(),
                ] : null,
                'city' => $address->getPostalCode() && $address->getPostalCode()->getCity() ? [
                    'id' => $address->getPostalCode()->getCity()->getId(),
                    'name' => $address->getPostalCode()->getCity()->getName(),
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
        ValidatorInterface $validator
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

            // Mise à jour des relations
            if (isset($data['nationality']) && is_numeric($data['nationality'])) {
                $nationality = $entityManager->getRepository('App:Nationality')->find($data['nationality']);
                if ($nationality) {
                    $user->setNationality($nationality);
                }
            }

            if (isset($data['theme']) && is_numeric($data['theme'])) {
                $theme = $entityManager->getRepository('App:Theme')->find($data['theme']);
                if ($theme) {
                    $user->setTheme($theme);
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

            return $this->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour: ' . $e->getMessage()
            ], 500);
        }
    }
    #[Route('/users', name: 'api_get_all_users', methods: ['GET'])]
    public function getAllUsers(EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $allUsers = $entityManager->getRepository(\App\Entity\User::class)->findAll();

            $usersData = [];
            foreach ($allUsers as $user) {
                $roles = [];
                foreach ($user->getUserRoles() as $userRole) {
                    $roles[] = [
                        'id' => $userRole->getRole()->getId(),
                        'name' => $userRole->getRole()->getName(),
                    ];
                }

                $userData = [
                    'id' => $user->getId(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'email' => $user->getEmail(),
                    'phoneNumber' => $user->getPhoneNumber(),
                    'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
                    'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                    'roles' => $roles
                ];

                $usersData[] = $userData;
            }

            return $this->json([
                'success' => true,
                'data' => $usersData
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération des utilisateurs: ' . $e->getMessage()
            ], 500);
        }
    }
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
