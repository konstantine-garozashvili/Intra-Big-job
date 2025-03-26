<?php

namespace App\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Entity\User;
use App\Entity\Nationality;
use App\Entity\Role;
use App\Entity\UserRole;
use App\Entity\Theme;
use App\Service\UserService;
use App\Service\EmailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Entity\City;
use App\Entity\PostalCode;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class UserManagementController extends AbstractController
{
    private $userService;
    private $emailService;
    private $entityManager;
    private $passwordHasher;
    private $validator;

    public function __construct(
        UserService $userService,
        EmailService $emailService,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ) {
        $this->userService = $userService;
        $this->emailService = $emailService;
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
    }

    #[Route('/create-user', name: 'admin_create_user', methods: ['POST'])]
    public function createUser(Request $request): Response
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            // Validation des données requises
            $requiredFields = ['email', 'first_name', 'last_name', 'phone_number', 'birth_date', 'nationality', 'role_id'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    return $this->json([
                        'success' => false,
                        'message' => "Le champ {$field} est requis."
                    ], Response::HTTP_BAD_REQUEST);
                }
            }

            // Vérifier si l'email existe déjà
            $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
            if ($existingUser) {
                return $this->json([
                    'success' => false,
                    'message' => 'Un utilisateur avec cet email existe déjà.'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si la nationalité existe
            $nationality = $this->entityManager->getRepository(Nationality::class)->findOneBy(['name' => $data['nationality']]);
            if (!$nationality) {
                // Créer la nationalité si elle n'existe pas
                $nationality = new Nationality();
                $nationality->setName($data['nationality']);
                $this->entityManager->persist($nationality);
                $this->entityManager->flush();
            }

            // Vérifier les données d'adresse
            if (!isset($data['address_name']) || empty($data['address_name']) ||
                !isset($data['city']) || empty($data['city']) ||
                !isset($data['postal_code']) || empty($data['postal_code'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Les champs adresse, ville et code postal sont requis.'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si la ville existe, sinon la créer
            $city = $this->entityManager->getRepository(City::class)->findOneBy(['name' => $data['city']]);
            if (!$city) {
                $city = new City();
                $city->setName($data['city']);
                $this->entityManager->persist($city);
                $this->entityManager->flush();
            }

            // Vérifier si le code postal existe, sinon le créer
            $postalCode = $this->entityManager->getRepository(PostalCode::class)->findOneBy(['code' => $data['postal_code'], 'city' => $city]);
            if (!$postalCode) {
                $postalCode = new PostalCode();
                $postalCode->setCode($data['postal_code']);
                $postalCode->setCity($city);
                $this->entityManager->persist($postalCode);
                $this->entityManager->flush();
            }

            // Vérifier si le rôle existe
            $role = $this->entityManager->getRepository(Role::class)->find($data['role_id']);
            if (!$role) {
                return $this->json([
                    'success' => false,
                    'message' => 'Le rôle spécifié n\'existe pas.'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si c'est un SUPERADMIN (non autorisé à la création)
            if ($role->getName() === 'SUPERADMIN') {
                return $this->json([
                    'success' => false,
                    'message' => 'La création d\'un utilisateur SUPERADMIN n\'est pas autorisée.'
                ], Response::HTTP_FORBIDDEN);
            }

            // Récupérer le thème par défaut (Light)
            $theme = $this->entityManager->getRepository(Theme::class)->findOneBy(['name' => 'light']);
            if (!$theme) {
                return $this->json([
                    'success' => false,
                    'message' => 'Le thème par défaut n\'existe pas.'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            // Créer l'utilisateur
            $user = new User();
            $user->setEmail($data['email']);
            $user->setFirstName($data['first_name']);
            $user->setLastName($data['last_name']);
            $user->setPhoneNumber($data['phone_number']);
            $user->setBirthDate(new \DateTime($data['birth_date']));
            $user->setNationality($nationality);
            $user->setTheme($theme);
            $user->setIsActive(true);
            $user->setCreatedByAdmin(true);
            $user->setHasChangedInitialPassword(false);
            $user->setIsEmailVerified(true);

            // Valider l'entité
            $errors = $this->validator->validate($user);
            if (count($errors) > 0) {
                return $this->json([
                    'success' => false,
                    'message' => 'Erreurs de validation',
                    'errors' => (string) $errors
                ], Response::HTTP_BAD_REQUEST);
            }

            // Générer un mot de passe temporaire
            $tempPassword = bin2hex(random_bytes(8));
            $hashedPassword = $this->passwordHasher->hashPassword($user, $tempPassword);
            $user->setPassword($hashedPassword);

            // Sauvegarder l'utilisateur
            $this->entityManager->persist($user);
            $this->entityManager->flush();

            // Créer l'adresse
            $address = new \App\Entity\Address();
            $address->setName($data['address_name']);
            if (isset($data['address_complement']) && !empty($data['address_complement'])) {
                $address->setComplement($data['address_complement']);
            }
            $address->setCity($city);
            $address->setPostalCode($postalCode);
            $address->setUser($user);
            $this->entityManager->persist($address);
            $this->entityManager->flush();

            // Créer l'association avec le rôle
            $userRole = new UserRole();
            $userRole->setUser($user);
            $userRole->setRole($role);
            $this->entityManager->persist($userRole);
            $this->entityManager->flush();

            // Envoyer un email avec les informations de connexion (désactivé pour l'instant)
            /*
            $this->emailService->sendAdminCreatedUserEmail(
                $user->getEmail(),
                $tempPassword,
                $user->getFirstName()
            );
            */

            return $this->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès.',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'first_name' => $user->getFirstName(),
                    'last_name' => $user->getLastName(),
                    'nationality' => $nationality->getName(),
                    'role' => $role->getName(),
                    'temp_password' => $tempPassword, // A retirer en production, seulement pour démo
                    'address' => [
                        'name' => $address->getName(),
                        'complement' => $address->getComplement(),
                        'city' => $city->getName(),
                        'postal_code' => $postalCode->getCode()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la création de l\'utilisateur.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/check-email/{email}', name: 'admin_check_email', methods: ['GET'])]
    public function checkEmail(string $email): JsonResponse
    {
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        
        return $this->json([
            'success' => !$existingUser,
            'message' => $existingUser ? 'Un utilisateur avec cet email existe déjà' : 'Email disponible'
        ]);
    }

    #[Route('/cities', name: 'admin_get_cities', methods: ['GET'])]
    public function getCities(): JsonResponse
    {
        $cities = $this->entityManager->getRepository(City::class)->findAll();
        $citiesArray = array_map(function($city) {
            return [
                'id' => $city->getId(),
                'name' => $city->getName()
            ];
        }, $cities);

        return $this->json([
            'success' => true,
            'cities' => $citiesArray
        ]);
    }

    #[Route('/postal-codes/{cityId}', name: 'admin_get_postal_codes', methods: ['GET'])]
    public function getPostalCodes(int $cityId): JsonResponse
    {
        $city = $this->entityManager->getRepository(City::class)->find($cityId);
        if (!$city) {
            return $this->json([
                'success' => false,
                'message' => 'Ville non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $postalCodes = $this->entityManager->getRepository(PostalCode::class)->findBy(['city' => $city]);
        $postalCodesArray = array_map(function($postalCode) {
            return [
                'id' => $postalCode->getId(),
                'code' => $postalCode->getCode()
            ];
        }, $postalCodes);

        return $this->json([
            'success' => true,
            'postal_codes' => $postalCodesArray
        ]);
    }
} 