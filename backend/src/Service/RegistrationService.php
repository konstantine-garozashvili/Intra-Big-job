<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Address;
use App\Entity\City;
use App\Entity\PostalCode;
use App\Entity\Nationality;
use App\Entity\UserRole;
use App\Entity\Role;
use App\Entity\Theme;
use App\Repository\NationalityRepository;
use App\Repository\CityRepository;
use App\Repository\PostalCodeRepository;
use App\Domains\Global\Repository\RoleRepository;
use App\Repository\ThemeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RegistrationService
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    private ValidatorInterface $validator;
    private NationalityRepository $nationalityRepository;
    private CityRepository $cityRepository;
    private PostalCodeRepository $postalCodeRepository;
    private RoleRepository $roleRepository;
    private ThemeRepository $themeRepository;
    private VerificationService $verificationService;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator,
        NationalityRepository $nationalityRepository,
        CityRepository $cityRepository,
        PostalCodeRepository $postalCodeRepository,
        RoleRepository $roleRepository,
        ThemeRepository $themeRepository,
        VerificationService $verificationService
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
        $this->nationalityRepository = $nationalityRepository;
        $this->cityRepository = $cityRepository;
        $this->postalCodeRepository = $postalCodeRepository;
        $this->roleRepository = $roleRepository;
        $this->themeRepository = $themeRepository;
        $this->verificationService = $verificationService;
    }

    /**
     * Enregistre un nouvel utilisateur avec toutes ses données associées
     */
    public function registerUser(array $data): User
    {
        // Logging pour le débogage
        error_log('RegistrationService::registerUser - Début de la méthode');
        
        // VALIDATION DU MOT DE PASSE - Première priorité, avant toute autre validation
        // S'assurer que le mot de passe existe et est de type string
        if (!isset($data['password'])) {
            error_log('RegistrationService - Erreur critique: Mot de passe manquant');
            throw new \InvalidArgumentException(json_encode([
                'password' => "Le mot de passe est requis."
            ]));
        }
        
        // Forcer la conversion en string si nécessaire (protection supplémentaire)
        $password = (string)$data['password'];
        
        // Remplacer le mot de passe dans les données avec la version forcée en string
        $data['password'] = $password;
        
        // Vérifier la longueur EXACTE du mot de passe (longueur absolue en octets)
        $passwordLength = mb_strlen($password, '8bit');
        error_log('RegistrationService - Validation mot de passe - Longueur exacte: ' . $passwordLength . ' octets');
        
        // Bloquer si le mot de passe est trop long (limite absolue)
        if ($passwordLength > 50) {
            error_log('RegistrationService - ERREUR CRITIQUE: Mot de passe trop long (' . $passwordLength . ' caractères)');
            throw new \InvalidArgumentException(json_encode([
                'password' => "Le mot de passe ne doit pas dépasser 50 caractères."
            ]));
        }
        
        // Bloquer si le mot de passe est trop court
        if ($passwordLength < 8) {
            error_log('RegistrationService - ERREUR: Mot de passe trop court (' . $passwordLength . ' caractères)');
            throw new \InvalidArgumentException(json_encode([
                'password' => "Le mot de passe doit contenir au moins 8 caractères."
            ]));
        }
        
        // Maintenant, passer aux autres validations
        // Vérifier l'âge minimum (16 ans)
        $birthDate = new \DateTime($data['birthDate']);
        $now = new \DateTime();
        $minimumAge = 16;
        
        // Calculer l'âge
        $age = $birthDate->diff($now)->y;
        
        // Vérifier si l'anniversaire est déjà passé cette année
        $hasBirthdayOccurred = 
            ($now->format('m') > $birthDate->format('m')) || 
            (($now->format('m') == $birthDate->format('m')) && ($now->format('d') >= $birthDate->format('d')));
        
        $adjustedAge = $hasBirthdayOccurred ? $age : $age - 1;
        
        // Si l'âge est inférieur à l'âge minimum, lever une exception
        if ($adjustedAge < $minimumAge) {
            throw new \InvalidArgumentException(json_encode([
                'birthDate' => "Vous devez avoir au moins {$minimumAge} ans pour vous inscrire."
            ]));
        }
        
        // Créer un nouvel utilisateur
        $user = new User();
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        $user->setEmail($data['email']);
        $user->setPhoneNumber($data['phoneNumber']);
        
        // Définir la date de naissance
        $birthDate = new \DateTime($data['birthDate']);
        $user->setBirthDate($birthDate);
        
        // Hasher le mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);
        
        // Définir la nationalité
        $nationality = $this->getNationality($data['nationality']);
        $user->setNationality($nationality);
        
        // Définir le thème par défaut
        $defaultTheme = $this->getDefaultTheme();
        $user->setTheme($defaultTheme);
        
        // Marquer l'email comme vérifié directement (temporairement)
        $user->setIsEmailVerified(true);
        
        // Ajouter le rôle utilisateur par défaut
        $this->addDefaultRole($user);
        
        // Valider l'utilisateur avant de persister
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            throw new \InvalidArgumentException(json_encode($errorMessages));
        }
        
        // Persister l'utilisateur
        $this->entityManager->persist($user);
        
        // Créer et associer l'adresse
        if (isset($data['address'])) {
            $this->createAddress($user, $data['address']);
        }
        
        // Sauvegarder en base de données
        $this->entityManager->flush();
        
        // Commenté temporairement: Ne pas envoyer d'email de vérification
        // $this->verificationService->sendVerificationEmail($user);
        
        return $user;
    }
    
    /**
     * Récupère ou crée une nationalité
     */
    private function getNationality(string $nationality): Nationality
    {
        // Essayer de trouver la nationalité par son code (ex: 'FR', 'PT')
        $nationalityEntity = $this->nationalityRepository->findOneBy(['code' => strtoupper($nationality)]);
        
        // Si non trouvée par code, essayer par nom
        if (!$nationalityEntity) {
            $nationalityEntity = $this->nationalityRepository->findOneBy(['name' => ucfirst(strtolower($nationality))]);
        }
        
        // Si toujours non trouvée, créer une nouvelle nationalité
        if (!$nationalityEntity) {
            $nationalityEntity = new Nationality();
            
            // Normaliser le nom (première lettre en majuscule)
            $name = ucfirst(strtolower($nationality));
            $nationalityEntity->setName($name);
            
            // Générer un code (2 premières lettres en majuscule)
            $code = strtoupper(substr($nationality, 0, 2));
            $nationalityEntity->setCode($code);
            
            $this->entityManager->persist($nationalityEntity);
        }
        
        return $nationalityEntity;
    }
    
    /**
     * Récupère le thème par défaut
     */
    private function getDefaultTheme(): Theme
    {
        $theme = $this->themeRepository->findOneBy(['name' => 'Default']);
        
        if (!$theme) {
            // Créer un thème par défaut si aucun n'existe
            $theme = new Theme();
            $theme->setName('Default');
            $this->entityManager->persist($theme);
        }
        
        return $theme;
    }
    
    /**
     * Ajoute le rôle utilisateur par défaut
     */
    private function addDefaultRole(User $user): void
    {
        $role = $this->roleRepository->findOneBy(['name' => 'GUEST']);
        
        if (!$role) {
            // Créer le rôle s'il n'existe pas
            $role = new Role();
            $role->setName('GUEST');
            $role->setDescription('Invité - Accès limité en lecture seule');
            $this->entityManager->persist($role);
        }
        
        $userRole = new UserRole();
        $userRole->setUser($user);
        $userRole->setRole($role);
        
        $this->entityManager->persist($userRole);
        $user->addUserRole($userRole);
    }
    
    /**
     * Crée et associe une adresse à l'utilisateur
     */
    private function createAddress(User $user, array $addressData): void
    {
        // S'assurer que les données d'adresse sont correctement encodées en UTF-8
        $cityName = mb_convert_encoding($addressData['city'], 'UTF-8', 'auto');
        $addressName = mb_convert_encoding($addressData['name'], 'UTF-8', 'auto');
        $complement = isset($addressData['complement']) ? mb_convert_encoding($addressData['complement'], 'UTF-8', 'auto') : null;
        $postalCode = $addressData['postalCode'];

        // Récupérer ou créer la ville
        $city = $this->getOrCreateCity($cityName);
        
        // Récupérer ou créer le code postal
        $postalCode = $this->getOrCreatePostalCode($postalCode, $city);
        
        // Créer l'adresse
        $address = new Address();
        $address->setName($addressName);
        $address->setCity($city);
        $address->setPostalCode($postalCode);
        $address->setUser($user);
        
        // Ajouter le complément d'adresse s'il existe
        if ($complement) {
            $address->setComplement($complement);
        }
        
        $this->entityManager->persist($address);
        $user->addAddress($address);
    }
    
    /**
     * Récupère ou crée une ville
     */
    private function getOrCreateCity(string $cityName): City
    {
        $city = $this->cityRepository->findOneBy(['name' => $cityName]);
        
        if (!$city) {
            $city = new City();
            $city->setName($cityName);
            $this->entityManager->persist($city);
        }
        
        return $city;
    }
    
    /**
     * Récupère ou crée un code postal
     */
    private function getOrCreatePostalCode(string $code, City $city): PostalCode
    {
        $postalCode = $this->postalCodeRepository->findOneBy(['code' => $code]);
        
        if (!$postalCode) {
            $postalCode = new PostalCode();
            $postalCode->setCode($code);
            $postalCode->setCity($city);
            $this->entityManager->persist($postalCode);
        } else if ($postalCode->getCity() !== $city) {
            // Si le code postal existe mais est associé à une autre ville
            // Cela peut indiquer un doublon ou une erreur dans les données
            // Ici, nous choisissons de mettre à jour la ville
            $postalCode->setCity($city);
        }
        
        return $postalCode;
    }
} 