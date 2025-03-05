<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\UserRole;
use DateTime;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Entity\Nationality;
use App\Entity\Theme;
use App\Entity\Role;

class UserFixtures extends Fixture implements DependentFixtureInterface
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
            // Administrateurs
            [
                'firstName' => 'Admin',
                'lastName' => 'User',
                'email' => 'admin@bigproject.com',
                'roleName' => RoleFixtures::ROLE_ADMIN,
                'birthDate' => '1990-01-01',
                'phoneNumber' => '0123456789',
            ],
            [
                'firstName' => 'Sophie',
                'lastName' => 'Martin',
                'email' => 'sophie.martin@bigproject.com',
                'roleName' => RoleFixtures::ROLE_ADMIN,
                'birthDate' => '1988-05-15',
                'phoneNumber' => '0623456789',
            ],
            
            // Super Administrateurs
            [
                'firstName' => 'Superadmin',
                'lastName' => 'User',
                'email' => 'superadmin@bigproject.com',
                'roleName' => RoleFixtures::ROLE_SUPERADMIN,
                'birthDate' => '1985-03-20',
                'phoneNumber' => '0723456789',
            ],
            [
                'firstName' => 'Pierre',
                'lastName' => 'Dupont',
                'email' => 'pierre.dupont@bigproject.com',
                'roleName' => RoleFixtures::ROLE_SUPERADMIN,
                'birthDate' => '1983-07-12',
                'phoneNumber' => '0623456780',
            ],
            
            // Ressources Humaines
            [
                'firstName' => 'HR',
                'lastName' => 'User',
                'email' => 'hr@bigproject.com',
                'roleName' => RoleFixtures::ROLE_HR,
                'birthDate' => '1985-11-30',
                'phoneNumber' => '0623456781',
            ],
            [
                'firstName' => 'Emma',
                'lastName' => 'Dubois',
                'email' => 'emma.dubois@bigproject.com',
                'roleName' => RoleFixtures::ROLE_HR,
                'birthDate' => '1987-09-25',
                'phoneNumber' => '0623456782',
            ],
            
            // Professeurs
            [
                'firstName' => 'Teacher',
                'lastName' => 'User',
                'email' => 'teacher@bigproject.com',
                'roleName' => RoleFixtures::ROLE_TEACHER,
                'birthDate' => '1980-06-15',
                'phoneNumber' => '0623456783',
            ],
            [
                'firstName' => 'Thomas',
                'lastName' => 'Petit',
                'email' => 'thomas.petit@bigproject.com',
                'roleName' => RoleFixtures::ROLE_TEACHER,
                'birthDate' => '1983-04-18',
                'phoneNumber' => '0623456784',
            ],
            [
                'firstName' => 'Marie',
                'lastName' => 'Robert',
                'email' => 'marie.robert@bigproject.com',
                'roleName' => RoleFixtures::ROLE_TEACHER,
                'birthDate' => '1982-08-22',
                'phoneNumber' => '0623456785',
            ],
            
            // Étudiants
            [
                'firstName' => 'Student',
                'lastName' => 'User',
                'email' => 'student@bigproject.com',
                'roleName' => RoleFixtures::ROLE_STUDENT,
                'birthDate' => '2000-02-10',
                'phoneNumber' => '0623456786',
            ],
            [
                'firstName' => 'Léa',
                'lastName' => 'Moreau',
                'email' => 'lea.moreau@bigproject.com',
                'roleName' => RoleFixtures::ROLE_STUDENT,
                'birthDate' => '2001-05-20',
                'phoneNumber' => '0623456787',
            ],
            [
                'firstName' => 'Hugo',
                'lastName' => 'Roux',
                'email' => 'hugo.roux@bigproject.com',
                'roleName' => RoleFixtures::ROLE_STUDENT,
                'birthDate' => '2000-11-15',
                'phoneNumber' => '0623456788',
            ],
            [
                'firstName' => 'Chloé',
                'lastName' => 'Simon',
                'email' => 'chloe.simon@bigproject.com',
                'roleName' => RoleFixtures::ROLE_STUDENT,
                'birthDate' => '2002-03-30',
                'phoneNumber' => '0623456789',
            ],
            
            // Invités
            [
                'firstName' => 'Guest',
                'lastName' => 'User',
                'email' => 'guest@bigproject.com',
                'roleName' => RoleFixtures::ROLE_GUEST,
                'birthDate' => '1995-12-05',
                'phoneNumber' => '0623456790',
            ],
            [
                'firstName' => 'Julie',
                'lastName' => 'Laurent',
                'email' => 'julie.laurent@bigproject.com',
                'roleName' => RoleFixtures::ROLE_GUEST,
                'birthDate' => '1993-10-08',
                'phoneNumber' => '0623456791',
            ],
        ];

        // Mot de passe commun pour tous les utilisateurs
        $plainPassword = 'Password123@';

        // Nationalité française par défaut pour tous les utilisateurs
        $frenchNationality = $this->getReference(NationalityFixtures::NATIONALITY_FRENCH, Nationality::class);
        
        // Thème light par défaut pour tous les utilisateurs
        $lightTheme = $this->getReference(ThemeFixtures::THEME_LIGHT, Theme::class);

        // Création des utilisateurs
        foreach ($usersData as $userData) {
            $user = new User();
            $user->setFirstName($userData['firstName']);
            $user->setLastName($userData['lastName']);
            $user->setEmail($userData['email']);
            $user->setBirthDate(new DateTime($userData['birthDate']));
            $user->setPhoneNumber($userData['phoneNumber']);
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
            $userRole->setRole($this->getReference($userData['roleName'], Role::class));
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
} 