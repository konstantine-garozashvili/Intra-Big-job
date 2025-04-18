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
            self::DOMAIN_DEV => [
                'name' => 'Développement',
                'description' => 'Domaine du développement logiciel et web'
            ],
            self::DOMAIN_DESIGN => [
                'name' => 'Design',
                'description' => 'Domaine du design graphique et UX/UI'
            ],
            self::DOMAIN_MARKETING => [
                'name' => 'Marketing Digital',
                'description' => 'Domaine du marketing en ligne et stratégies digitales'
            ],
            self::DOMAIN_BUSINESS => [
                'name' => 'Business & Management',
                'description' => 'Domaine de la gestion d\'entreprise et du management'
            ],
            self::DOMAIN_DATA => [
                'name' => 'Data & IA',
                'description' => 'Domaine de l\'analyse de données et intelligence artificielle'
            ],
        ];

        foreach ($domains as $reference => $data) {
            $domain = new Domain();
            $domain->setName($data['name']);
            $domain->setDescription($data['description']);
            $manager->persist($domain);
            $this->addReference($reference, $domain);
        }

        $manager->flush();
    }
} 