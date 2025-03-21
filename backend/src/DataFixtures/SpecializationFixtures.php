<?php

namespace App\DataFixtures;

use App\Entity\Domain;
use App\Entity\Specialization;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class SpecializationFixtures extends Fixture implements DependentFixtureInterface
{
    public const SPEC_PHP = 'spec-php';
    public const SPEC_JAVASCRIPT = 'spec-javascript';
    public const SPEC_PYTHON = 'spec-python';
    public const SPEC_UI = 'spec-ui';
    public const SPEC_UX = 'spec-ux';
    public const SPEC_SEO = 'spec-seo';
    public const SPEC_SEM = 'spec-sem';
    public const SPEC_PROJECT_MANAGEMENT = 'spec-project-management';
    public const SPEC_BUSINESS_ANALYSIS = 'spec-business-analysis';
    public const SPEC_DATA_SCIENCE = 'spec-data-science';
    public const SPEC_MACHINE_LEARNING = 'spec-machine-learning';

    public function load(ObjectManager $manager): void
    {
        $specializations = [
            self::SPEC_PHP => [
                'name' => 'Développement PHP',
                'domain' => DomainFixtures::DOMAIN_DEV
            ],
            self::SPEC_JAVASCRIPT => [
                'name' => 'Développement JavaScript',
                'domain' => DomainFixtures::DOMAIN_DEV
            ],
            self::SPEC_PYTHON => [
                'name' => 'Développement Python',
                'domain' => DomainFixtures::DOMAIN_DEV
            ],
            self::SPEC_UI => [
                'name' => 'UI Design',
                'domain' => DomainFixtures::DOMAIN_DESIGN
            ],
            self::SPEC_UX => [
                'name' => 'UX Design',
                'domain' => DomainFixtures::DOMAIN_DESIGN
            ],
            self::SPEC_SEO => [
                'name' => 'SEO',
                'domain' => DomainFixtures::DOMAIN_MARKETING
            ],
            self::SPEC_SEM => [
                'name' => 'SEM & Publicité',
                'domain' => DomainFixtures::DOMAIN_MARKETING
            ],
            self::SPEC_PROJECT_MANAGEMENT => [
                'name' => 'Gestion de Projet',
                'domain' => DomainFixtures::DOMAIN_BUSINESS
            ],
            self::SPEC_BUSINESS_ANALYSIS => [
                'name' => 'Analyse d\'Affaires',
                'domain' => DomainFixtures::DOMAIN_BUSINESS
            ],
            self::SPEC_DATA_SCIENCE => [
                'name' => 'Data Science',
                'domain' => DomainFixtures::DOMAIN_DATA
            ],
            self::SPEC_MACHINE_LEARNING => [
                'name' => 'Machine Learning',
                'domain' => DomainFixtures::DOMAIN_DATA
            ],
        ];

        foreach ($specializations as $reference => $data) {
            $specialization = new Specialization();
            $specialization->setName($data['name']);
            
            /** @var Domain $domain */
            $domain = $this->getReference($data['domain'], Domain::class);
            $specialization->setDomain($domain);
            
            $manager->persist($specialization);
            $this->addReference($reference, $specialization);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            DomainFixtures::class,
        ];
    }
} 