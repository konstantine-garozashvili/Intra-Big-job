<?php

namespace App\DataFixtures;

use App\Entity\Domain;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class DomainFixtures extends Fixture
{
    public const DOMAIN_DEV = 'domain-dev';
    public const DOMAIN_DESIGN = 'domain-design';
    public const DOMAIN_MARKETING = 'domain-marketing';
    public const DOMAIN_BUSINESS = 'domain-business';
    public const DOMAIN_DATA = 'domain-data';

    public function load(ObjectManager $manager): void
    {
        $domains = [
            self::DOMAIN_DEV => 'Développement',
            self::DOMAIN_DESIGN => 'Design',
            self::DOMAIN_MARKETING => 'Marketing Digital',
            self::DOMAIN_BUSINESS => 'Business & Management',
            self::DOMAIN_DATA => 'Data & IA',
        ];

        foreach ($domains as $reference => $name) {
            $domain = new Domain();
            $domain->setName($name);
            $manager->persist($domain);
            $this->addReference($reference, $domain);
        }

        $manager->flush();
    }
} 