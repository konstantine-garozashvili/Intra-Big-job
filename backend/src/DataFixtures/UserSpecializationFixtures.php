<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\UserRole;
use App\Entity\Role;
use App\Entity\Status;
use App\Entity\UserStatus;
use App\Entity\Specialization;
use App\Entity\Nationality;
use App\Entity\Theme;
use App\Entity\UserSituationType;
use App\Domains\Student\Entity\StudentProfile;
use DateTime;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserSpecializationFixtures extends Fixture implements DependentFixtureInterface
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Define which specializations should be assigned to which users
        // Format: [user email => specialization reference]
        $userSpecializations = [
            // Assign specializations to students
            'student@bigproject.com' => SpecializationFixtures::SPEC_JAVASCRIPT,
            
            // Assign specializations to teachers based on their expertise
            'teacher@bigproject.com' => SpecializationFixtures::SPEC_PHP,
            
            // HR might have business specialization
            'hr@bigproject.com' => SpecializationFixtures::SPEC_PROJECT_MANAGEMENT,
            
            // Admin might have a technical specialization
            'admin@bigproject.com' => SpecializationFixtures::SPEC_PYTHON,
            
            // Recruiter might focus on business analysis
            'recruiter@bigproject.com' => SpecializationFixtures::SPEC_BUSINESS_ANALYSIS,
        ];

        // Create additional student users with different specializations
        $additionalStudents = [
            [
                'email' => 'student.design@bigproject.com',
                'firstName' => 'Alice',
                'lastName' => 'Designer',
                'birthDate' => '1999-05-15',
                'phoneNumber' => '0600000011',
                'specialization' => SpecializationFixtures::SPEC_UI,
                'role' => RoleFixtures::ROLE_STUDENT,
                'status' => StatusFixtures::STATUS_ACTIVE
            ],
            [
                'email' => 'student.marketing@bigproject.com',
                'firstName' => 'Bob',
                'lastName' => 'Marketer',
                'birthDate' => '2000-08-22',
                'phoneNumber' => '0600000012',
                'specialization' => SpecializationFixtures::SPEC_SEO,
                'role' => RoleFixtures::ROLE_STUDENT,
                'status' => StatusFixtures::STATUS_ACTIVE
            ],
            [
                'email' => 'student.data@bigproject.com',
                'firstName' => 'Charlie',
                'lastName' => 'Analyst',
                'birthDate' => '1998-11-30',
                'phoneNumber' => '0600000013',
                'specialization' => SpecializationFixtures::SPEC_DATA_SCIENCE,
                'role' => RoleFixtures::ROLE_STUDENT,
                'status' => StatusFixtures::STATUS_ACTIVE
            ],
        ];

        // Assign specializations to existing users
        foreach ($userSpecializations as $email => $specializationRef) {
            $user = $manager->getRepository(User::class)->findOneBy(['email' => $email]);
            
            if ($user) {
                /** @var Specialization $specialization */
                $specialization = $this->getReference($specializationRef, Specialization::class);
                $user->setSpecialization($specialization);
                $manager->persist($user);
            }
        }

        // Create additional student users with specializations
        foreach ($additionalStudents as $studentData) {
            $user = new User();
            $user->setEmail($studentData['email']);
            $user->setPassword($this->passwordHasher->hashPassword($user, 'Password123@'));
            $user->setFirstName($studentData['firstName']);
            $user->setLastName($studentData['lastName']);
            $user->setBirthDate(new DateTime($studentData['birthDate']));
            $user->setPhoneNumber($studentData['phoneNumber']);
            $user->setNationality($this->getReference(NationalityFixtures::NATIONALITY_FRENCH, Nationality::class));
            $user->setTheme($this->getReference(ThemeFixtures::THEME_LIGHT, Theme::class));
            $user->setIsEmailVerified(true);
            $user->setIsUserActive(true);
            
            // Set specialization
            $specialization = $this->getReference($studentData['specialization'], Specialization::class);
            $user->setSpecialization($specialization);
            
            $manager->persist($user);

            // Create user role
            $userRole = new UserRole();
            $userRole->setUser($user);
            $userRole->setRole($this->getReference($studentData['role'], Role::class));
            $manager->persist($userRole);

            // Create user status
            $userStatus = new UserStatus();
            $userStatus->setUser($user);
            $userStatus->setStatus($this->getReference($studentData['status'], Status::class));
            $manager->persist($userStatus);

            // Create student profile
            $studentProfile = new StudentProfile();
            $studentProfile->setUser($user);
            $studentProfile->setSituationType($this->getReference(UserSituationTypeFixtures::SITUATION_INITIAL, UserSituationType::class));
            $manager->persist($studentProfile);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            SpecializationFixtures::class,
            RoleFixtures::class,
            ThemeFixtures::class,
            NationalityFixtures::class,
            UserSituationTypeFixtures::class,
        ];
    }
} 