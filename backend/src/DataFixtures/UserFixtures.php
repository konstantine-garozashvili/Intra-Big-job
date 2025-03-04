<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\UserRole;
use DateTime;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Common\DataFixtures\DependsOnInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture implements DependsOnInterface, FixtureGroupInterface
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Définition des données utilisateurs pour chaque rôle
        $usersData = [
            [
                'firstName' => 'Admin',
                'lastName' => 'User',
                'email' => 'admin@admin.fr',
                'roleName' => RoleFixtures::ROLE_ADMIN,
            ],
            [
                'firstName' => 'Moderator',
                'lastName' => 'User',
                'email' => 'moderator@moderator.fr',
                'roleName' => RoleFixtures::ROLE_MODERATOR,
            ],
            [
                'firstName' => 'HR',
                'lastName' => 'User',
                'email' => 'hr@hr.fr',
                'roleName' => RoleFixtures::ROLE_HR,
            ],
            [
                'firstName' => 'Teacher',
                'lastName' => 'User',
                'email' => 'teacher@teacher.fr',
                'roleName' => RoleFixtures::ROLE_TEACHER,
            ],
            [
                'firstName' => 'Student',
                'lastName' => 'User',
                'email' => 'student@student.fr',
                'roleName' => RoleFixtures::ROLE_STUDENT,
            ],
            [
                'firstName' => 'Guest',
                'lastName' => 'User',
                'email' => 'guest@guest.fr',
                'roleName' => RoleFixtures::ROLE_GUEST,
            ],
        ];

        // Mot de passe commun pour tous les utilisateurs
        $plainPassword = 'Password123@';

        // Nationalité française par défaut pour tous les utilisateurs
        $frenchNationality = $this->getReference(NationalityFixtures::NATIONALITY_FRENCH);
        
        // Thème light par défaut pour tous les utilisateurs
        $lightTheme = $this->getReference(ThemeFixtures::THEME_LIGHT);

        // Date de naissance par défaut (1er janvier 1990)
        $birthDate = new DateTime('1990-01-01');

        // Création des utilisateurs
        foreach ($usersData as $userData) {
            $user = new User();
            $user->setFirstName($userData['firstName']);
            $user->setLastName($userData['lastName']);
            $user->setEmail($userData['email']);
            $user->setBirthDate($birthDate);
            $user->setPhoneNumber('0123456789');
            $user->setNationality($frenchNationality);
            $user->setTheme($lightTheme);
            $user->setIsEmailVerified(true);
            $user->setCreatedAt(new DateTimeImmutable());

            // Hachage du mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword(
                $user,
                $plainPassword
            );
            $user->setPassword($hashedPassword);

            $manager->persist($user);

            // Création de l'association UserRole
            $userRole = new UserRole();
            $userRole->setUser($user);
            $userRole->setRole($this->getReference($userData['roleName']));
            $manager->persist($userRole);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            RoleFixtures::class,
            ThemeFixtures::class,
            NationalityFixtures::class,
        ];
    }

    public function getGroups(): array
    {
        return ['UserFixtures'];
    }
} 