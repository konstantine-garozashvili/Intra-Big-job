<?php

namespace App\DataFixtures;

use App\Entity\Formation;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class FormationFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $formations = [
            [
                'name' => 'Développement Web Full Stack',
                'promotion' => '2024-2025',
                'description' => 'Formation complète en développement web, couvrant à la fois le front-end et le back-end.'
            ],
            [
                'name' => 'DevOps & Cloud Computing',
                'promotion' => '2024-2025',
                'description' => 'Formation aux pratiques DevOps et aux technologies cloud modernes.'
            ],
            [
                'name' => 'Intelligence Artificielle & Data Science',
                'promotion' => '2024-2025',
                'description' => 'Formation approfondie en IA et analyse de données.'
            ],
            [
                'name' => 'Cybersécurité',
                'promotion' => '2024-2025',
                'description' => 'Formation aux techniques de sécurité informatique et à la protection des systèmes.'
            ]
        ];

        foreach ($formations as $formationData) {
            $formation = new Formation();
            $formation->setName($formationData['name']);
            $formation->setPromotion($formationData['promotion']);
            $formation->setDescription($formationData['description']);
            
            $manager->persist($formation);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
        ];
    }
}
