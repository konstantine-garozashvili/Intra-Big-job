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
                'name' => 'Formation 1',
                'promotion' => '2024-2025',
                'description' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            ],
            [
                'name' => 'Formation 2',
                'promotion' => '2024-2025',
                'description' => 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
            ],
            [
                'name' => 'Formation 3',
                'promotion' => '2024-2025',
                'description' => 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
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
