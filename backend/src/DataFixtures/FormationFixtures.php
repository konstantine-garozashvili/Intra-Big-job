<?php

namespace App\DataFixtures;

use App\Entity\Formation;
use App\Entity\Specialization;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class FormationFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $formations = [
            [
                'name' => 'Développement Web PHP',
                'promotion' => '2024',
                'description' => 'Formation complète en développement web PHP',
                'specialization' => SpecializationFixtures::SPEC_PHP,
                'capacity' => 25,
                'date_start' => new \DateTime('2024-09-01'),
                'duration' => 12, // 12 mois
                'location' => 'Paris'
            ],
            [
                'name' => 'Développement Web JavaScript',
                'promotion' => '2024',
                'description' => 'Formation en développement web JavaScript moderne',
                'specialization' => SpecializationFixtures::SPEC_JAVASCRIPT,
                'capacity' => 25,
                'date_start' => new \DateTime('2024-09-01'),
                'duration' => 12, // 12 mois
                'location' => 'Lyon'
            ],
            [
                'name' => 'Data Science et IA',
                'promotion' => '2024',
                'description' => 'Formation en Data Science et Intelligence Artificielle',
                'specialization' => SpecializationFixtures::SPEC_DATA_SCIENCE,
                'capacity' => 20,
                'date_start' => new \DateTime('2024-09-01'),
                'duration' => 15, // 15 mois
                'location' => 'Paris'
            ],
            [
                'name' => 'Machine Learning Avancé',
                'promotion' => '2024',
                'description' => 'Formation avancée en Machine Learning',
                'specialization' => SpecializationFixtures::SPEC_MACHINE_LEARNING,
                'capacity' => 15,
                'date_start' => new \DateTime('2024-09-01'),
                'duration' => 18, // 18 mois
                'location' => 'Bordeaux'
            ]
        ];

        foreach ($formations as $formationData) {
            $formation = new Formation();
            $formation->setName($formationData['name']);
            $formation->setPromotion($formationData['promotion']);
            $formation->setDescription($formationData['description']);
            $formation->setCapacity($formationData['capacity']);
            $formation->setDateStart($formationData['date_start']);
            $formation->setDuration($formationData['duration']);
            $formation->setLocation($formationData['location']);
            
            // Get the specialization reference
            /** @var Specialization $specialization */
            $specialization = $this->getReference($formationData['specialization'], Specialization::class);
            $formation->setSpecialization($specialization);

            $manager->persist($formation);
            
            // Add reference for potential future fixtures
            $this->addReference('FORMATION_' . strtoupper(str_replace(' ', '_', $formationData['name'])), $formation);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            SpecializationFixtures::class,
        ];
    }
} 
