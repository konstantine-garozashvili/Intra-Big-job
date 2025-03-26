<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Nationality;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserService
{
    private $entityManager;
    private $passwordHasher;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    public function createUser(array $data, bool $isAdminCreation = false): User
    {
        // Vérifier si l'email existe déjà
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            throw new \Exception('Un utilisateur avec cet email existe déjà.');
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

        // Créer l'utilisateur
        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstName($data['first_name']);
        $user->setLastName($data['last_name']);
        $user->setPhoneNumber($data['phone_number']);
        $user->setBirthDate(new \DateTime($data['birth_date']));
        $user->setNationality($nationality);
        $user->setIsActive(true);
        $user->setCreatedByAdmin($isAdminCreation);
        $user->setHasChangedInitialPassword(false);
        $user->setIsEmailVerified($isAdminCreation);

        // Gérer le mot de passe
        if ($isAdminCreation) {
            // Générer un mot de passe temporaire pour la création par admin
            $tempPassword = bin2hex(random_bytes(8));
            $hashedPassword = $this->passwordHasher->hashPassword($user, $tempPassword);
            $user->setPassword($hashedPassword);
        } else {
            // Utiliser le mot de passe fourni pour l'inscription normale
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }

        // Sauvegarder l'utilisateur
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }

    public function updateUser(User $user, array $data): User
    {
        if (isset($data['email']) && $data['email'] !== $user->getEmail()) {
            $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
            if ($existingUser) {
                throw new \Exception('Un utilisateur avec cet email existe déjà.');
            }
            $user->setEmail($data['email']);
        }

        if (isset($data['first_name'])) {
            $user->setFirstName($data['first_name']);
        }

        if (isset($data['last_name'])) {
            $user->setLastName($data['last_name']);
        }

        if (isset($data['phone_number'])) {
            $user->setPhoneNumber($data['phone_number']);
        }

        if (isset($data['birth_date'])) {
            $user->setBirthDate(new \DateTime($data['birth_date']));
        }

        if (isset($data['nationality'])) {
            $nationality = $this->entityManager->getRepository(Nationality::class)->findOneBy(['name' => $data['nationality']]);
            if (!$nationality) {
                $nationality = new Nationality();
                $nationality->setName($data['nationality']);
                $this->entityManager->persist($nationality);
                $this->entityManager->flush();
            }
            $user->setNationality($nationality);
        }

        $this->entityManager->flush();
        return $user;
    }
} 