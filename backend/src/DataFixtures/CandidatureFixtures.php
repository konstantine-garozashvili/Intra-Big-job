<?php

namespace App\DataFixtures;

use App\Entity\Candidature;
use App\Entity\User;
use App\Entity\UserRole;
use DateTimeImmutable;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class CandidatureFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // Get all users with ROLE_STUDENT
        $studentRoleRepo = $manager->getRepository(UserRole::class);
        $studentRoles = $studentRoleRepo->createQueryBuilder('ur')
            ->join('ur.role', 'r')
            ->where('r.name = :role')
            ->setParameter('role', 'STUDENT')
            ->getQuery()
            ->getResult();

        // Create candidatures for all students
        foreach ($studentRoles as $userRole) {
            $user = $userRole->getUser();
            
            // Create a candidature for this student
            $candidature = new Candidature();
            $candidature->setUser($user);
            $candidature->setCreatedAt(new DateTimeImmutable());
            
            // Randomly set updatedAt for some candidatures
            if (rand(0, 1)) {
                $updatedDate = (new DateTimeImmutable())->modify('-' . rand(1, 10) . ' days');
                $candidature->setUpdatedAt($updatedDate);
            }
            
            $manager->persist($candidature);
        }

        // Also create candidatures for specific student emails
        $specificStudentEmails = [
            'student@bigproject.com',
            'student.design@bigproject.com',
            'student.marketing@bigproject.com',
            'student.data@bigproject.com'
        ];

        foreach ($specificStudentEmails as $email) {
            $user = $manager->getRepository(User::class)->findOneBy(['email' => $email]);
            
            if ($user) {
                // Check if a candidature already exists for this user
                $existingCandidature = $manager->getRepository(Candidature::class)
                    ->findOneBy(['user' => $user]);
                
                if (!$existingCandidature) {
                    $candidature = new Candidature();
                    $candidature->setUser($user);
                    $candidature->setCreatedAt(new DateTimeImmutable());
                    
                    // Add some variation to the dates
                    $days = rand(1, 30);
                    $createdDate = (new DateTimeImmutable())->modify("-$days days");
                    $candidature->setCreatedAt($createdDate);
                    
                    // Some candidatures will have been updated
                    if (rand(0, 1)) {
                        $updatedDate = $createdDate->modify('+' . rand(1, 5) . ' days');
                        $candidature->setUpdatedAt($updatedDate);
                    }
                    
                    $manager->persist($candidature);
                }
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            UserSpecializationFixtures::class,
        ];
    }
} 