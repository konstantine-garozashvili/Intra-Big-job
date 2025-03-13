<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Domain;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

/**
 * This fixture demonstrates how to link users with domains for reporting purposes.
 * Note: This is just a demonstration - you would need to add a ManyToMany relationship
 * between User and Domain in your entities to make this work.
 */
class UserDomainFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // This is a demonstration of how you could link users with domains
        // For this to work, you would need to add a relationship in your entities
        
        // Example mapping of users to domains (by email)
        $userDomains = [
            // Map users to their primary domains
            'student@bigproject.com' => [
                DomainFixtures::DOMAIN_DEV
            ],
            'student.design@bigproject.com' => [
                DomainFixtures::DOMAIN_DESIGN
            ],
            'student.marketing@bigproject.com' => [
                DomainFixtures::DOMAIN_MARKETING
            ],
            'student.data@bigproject.com' => [
                DomainFixtures::DOMAIN_DATA
            ],
            'teacher@bigproject.com' => [
                DomainFixtures::DOMAIN_DEV,
                DomainFixtures::DOMAIN_DATA // Teachers might be associated with multiple domains
            ],
            'hr@bigproject.com' => [
                DomainFixtures::DOMAIN_BUSINESS
            ],
        ];

        // For this to work, you would need to add a relationship like:
        // In User.php:
        // #[ORM\ManyToMany(targetEntity: Domain::class, inversedBy: 'users')]
        // private Collection $domains;
        //
        // In Domain.php:
        // #[ORM\ManyToMany(targetEntity: User::class, mappedBy: 'domains')]
        // private Collection $users;
        
        // This code is commented out since the relationship doesn't exist yet
        /*
        foreach ($userDomains as $email => $domainRefs) {
            $user = $manager->getRepository(User::class)->findOneBy(['email' => $email]);
            
            if ($user) {
                foreach ($domainRefs as $domainRef) {
                    $domain = $this->getReference($domainRef, Domain::class);
                    // This would require the relationship to exist:
                    // $user->addDomain($domain);
                }
                $manager->persist($user);
            }
        }
        
        $manager->flush();
        */
        
        // Instead, we'll just log a message
        echo "UserDomainFixtures: This is a demonstration fixture. To implement it, add a ManyToMany relationship between User and Domain entities.\n";
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            DomainFixtures::class,
            UserSpecializationFixtures::class, // This should run after we've created the additional users
        ];
    }
} 