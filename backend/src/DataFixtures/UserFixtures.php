<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\UserRole;
use App\Entity\UserStatus;
use DateTime;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Entity\Nationality;
use App\Entity\Theme;
use App\Entity\Role;
use App\Entity\Status;
use App\Domains\Student\Entity\StudentProfile;
use App\Entity\UserSituationType;

class UserFixtures extends Fixture implements DependentFixtureInterface
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Liste des utilisateurs avec leurs rôles et statuts
        $users = [
            RoleFixtures::ROLE_SUPERADMIN => [
                'firstName' => 'Alexandre',
                'lastName' => 'Dupont',
                'email' => 'superadmin@bigproject.com',
                'birthDate' => '1985-01-01',
                'phoneNumber' => '0600000001',
            ],
            RoleFixtures::ROLE_ADMIN => [
                'firstName' => 'Sophie',
                'lastName' => 'Martin',
                'email' => 'admin@bigproject.com',
                'birthDate' => '1988-02-15',
                'phoneNumber' => '0600000002'
            ],
            RoleFixtures::ROLE_HR => [
                'firstName' => 'Camille',
                'lastName' => 'Bernard',
                'email' => 'hr@bigproject.com',
                'birthDate' => '1990-03-20',
                'phoneNumber' => '0600000003'
            ],
            RoleFixtures::ROLE_TEACHER => [
                'firstName' => 'Thomas',
                'lastName' => 'Petit',
                'email' => 'teacher@bigproject.com',
                'birthDate' => '1982-04-10',
                'phoneNumber' => '0600000004'
            ],
            RoleFixtures::ROLE_STUDENT => [
                'firstName' => 'Emma',
                'lastName' => 'Dubois',
                'email' => 'student@bigproject.com',
                'birthDate' => '2000-05-25',
                'phoneNumber' => '0600000005',
            ],
            RoleFixtures::ROLE_RECRUITER => [
                'firstName' => 'Lucas',
                'lastName' => 'Moreau',
                'email' => 'recruiter@bigproject.com',
                'birthDate' => '1992-06-15',
                'phoneNumber' => '0600000006'
            ],
            RoleFixtures::ROLE_GUEST => [
                'firstName' => 'Marie',
                'lastName' => 'Lambert',
                'email' => 'guest@bigproject.com',
                'birthDate' => '1995-07-30',
                'phoneNumber' => '0600000007',
                'status' => StatusFixtures::STATUS_PENDING
            ]
        ];

        foreach ($users as $roleReference => $userData) {
            $user = new User();
            $user->setEmail($userData['email']);
            $user->setPassword($this->passwordHasher->hashPassword($user, 'Password123@'));
            $user->setFirstName($userData['firstName']);
            $user->setLastName($userData['lastName']);
            $user->setBirthDate(new DateTime($userData['birthDate']));
            $user->setPhoneNumber($userData['phoneNumber']);
            $user->setNationality($this->getReference(NationalityFixtures::NATIONALITY_FRENCH, Nationality::class));
            $user->setTheme($this->getReference(ThemeFixtures::THEME_LIGHT, Theme::class));
            $user->setIsEmailVerified(true);
            $manager->persist($user);
            $user->setIsUserActive(true);


            // Assignation du rôle
            $userRole = new UserRole();
            $userRole->setUser($user);
            $userRole->setRole($this->getReference($roleReference, Role::class));
            $manager->persist($userRole);

            // Assignation du statut (avec valeur par défaut si non défini)
            $statusReference = $userData['status'] ?? StatusFixtures::STATUS_DEFAULT;
            $userStatus = new UserStatus();
            $userStatus->setUser($user);
            $userStatus->setStatus($this->getReference($statusReference, Status::class));
            $manager->persist($userStatus);

            // Création d'un profil étudiant si c'est un étudiant
            if ($roleReference === RoleFixtures::ROLE_STUDENT) {
                $studentProfile = new StudentProfile();
                $studentProfile->setUser($user);
                $studentProfile->setSituationType($this->getReference(UserSituationTypeFixtures::SITUATION_INITIAL, UserSituationType::class));
                $manager->persist($studentProfile);
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            RoleFixtures::class,
            ThemeFixtures::class,
            NationalityFixtures::class,
            UserSituationTypeFixtures::class,
            StatusFixtures::class, // Ajout de la dépendance aux statuts
        ];
    }
}
