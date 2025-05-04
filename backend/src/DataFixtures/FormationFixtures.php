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
                'name' => 'Développement Web Full Stack',
                'promotion' => '2024-A',
                'description' => 'Formation complète en développement web couvrant le front-end et le back-end avec les dernières technologies',
                'specialization' => SpecializationFixtures::SPEC_PHP,
                'capacity' => 25,
                'date_start' => new \DateTime('2024-09-01'),
                'duration' => 12,
                'location' => 'Paris'
            ],
            [
                'name' => 'Data Science & Intelligence Artificielle',
                'promotion' => '2024-B',
                'description' => 'Formation approfondie en science des données et IA avec Python et les frameworks modernes',
                'specialization' => SpecializationFixtures::SPEC_DATA_SCIENCE,
                'capacity' => 20,
                'date_start' => new \DateTime('2024-09-15'),
                'duration' => 15,
                'location' => 'Lyon'
            ],
            [
                'name' => 'DevOps & Cloud Computing',
                'promotion' => '2024-A',
                'description' => 'Maîtrisez les pratiques DevOps et le cloud computing avec AWS et Azure',
                'specialization' => SpecializationFixtures::SPEC_DEVOPS,
                'capacity' => 18,
                'date_start' => new \DateTime('2024-10-01'),
                'duration' => 14,
                'location' => 'Bordeaux'
            ],
            [
                'name' => 'Cybersécurité Avancée',
                'promotion' => '2024-B',
                'description' => 'Formation spécialisée en sécurité informatique et protection des données',
                'specialization' => SpecializationFixtures::SPEC_CYBERSECURITY,
                'capacity' => 15,
                'date_start' => new \DateTime('2024-09-30'),
                'duration' => 16,
                'location' => 'Paris'
            ],
            [
                'name' => 'Développement Mobile React Native',
                'promotion' => '2024-A',
                'description' => 'Créez des applications mobiles multiplateformes avec React Native',
                'specialization' => SpecializationFixtures::SPEC_JAVASCRIPT,
                'capacity' => 22,
                'date_start' => new \DateTime('2024-10-15'),
                'duration' => 10,
                'location' => 'Nantes'
            ],
            [
                'name' => 'UX/UI Design & Développement Frontend',
                'promotion' => '2024-B',
                'description' => 'Maîtrisez la conception d\'interfaces utilisateur et le développement frontend moderne',
                'specialization' => SpecializationFixtures::SPEC_JAVASCRIPT,
                'capacity' => 20,
                'date_start' => new \DateTime('2024-11-01'),
                'duration' => 11,
                'location' => 'Lille'
            ],
            [
                'name' => 'Machine Learning Avancé',
                'promotion' => '2024-A',
                'description' => 'Plongez dans le machine learning avec Python, TensorFlow et PyTorch',
                'specialization' => SpecializationFixtures::SPEC_MACHINE_LEARNING,
                'capacity' => 16,
                'date_start' => new \DateTime('2024-09-20'),
                'duration' => 18,
                'location' => 'Toulouse'
            ],
            [
                'name' => 'Développement Python Backend',
                'promotion' => '2024-B',
                'description' => 'Développez des applications backend robustes avec Python et Django/Flask',
                'specialization' => SpecializationFixtures::SPEC_PYTHON,
                'capacity' => 24,
                'date_start' => new \DateTime('2024-10-10'),
                'duration' => 13,
                'location' => 'Marseille'
            ],
            [
                'name' => 'Architecture Cloud & Microservices',
                'promotion' => '2024-A',
                'description' => 'Concevez et déployez des architectures cloud modernes basées sur les microservices',
                'specialization' => SpecializationFixtures::SPEC_DEVOPS,
                'capacity' => 18,
                'date_start' => new \DateTime('2024-11-15'),
                'duration' => 15,
                'location' => 'Nice'
            ],
            [
                'name' => 'Data Engineering & Big Data',
                'promotion' => '2024-B',
                'description' => 'Formation complète en ingénierie des données et technologies Big Data',
                'specialization' => SpecializationFixtures::SPEC_DATA_SCIENCE,
                'capacity' => 20,
                'date_start' => new \DateTime('2024-12-01'),
                'duration' => 16,
                'location' => 'Strasbourg'
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
            $this->addReference(
                'FORMATION_' . strtoupper(str_replace([' ', '/', '&'], '_', $formationData['name'])),
                $formation
            );
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