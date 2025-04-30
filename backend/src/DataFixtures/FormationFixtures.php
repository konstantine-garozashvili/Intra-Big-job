<?php

namespace App\DataFixtures;

use App\Entity\Formation;
use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Persistence\ObjectManager;
use DateTime;

class FormationFixtures implements FixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $formations = [
            [
                'title' => 'Développement Web Full Stack',
                'description' => 'Formation complète en développement web, couvrant frontend et backend',
                'duration' => 6,
                'startDate' => new \DateTime('2024-09-01'),
                'endDate' => new \DateTime('2025-02-28'),
                'maxParticipants' => 20,
                'price' => 3500.00,
                'level' => 'Intermédiaire'
            ],
            [
                'title' => 'Intelligence Artificielle et Machine Learning',
                'description' => 'Apprenez les bases de l\'IA et du machine learning avec Python',
                'duration' => 4,
                'startDate' => new \DateTime('2024-10-15'),
                'endDate' => new \DateTime('2025-02-15'),
                'maxParticipants' => 15,
                'price' => 4200.00,
                'level' => 'Avancé'
            ],
            [
                'title' => 'Design UX/UI Moderne',
                'description' => 'Maîtrisez les principes de design d\'interface utilisateur et expérience utilisateur',
                'duration' => 3,
                'startDate' => new \DateTime('2024-11-01'),
                'endDate' => new \DateTime('2025-01-31'),
                'maxParticipants' => 18,
                'price' => 2800.00,
                'level' => 'Débutant'
            ],
            [
                'title' => 'Cybersécurité Avancée',
                'description' => 'Formation approfondie sur les techniques de sécurité informatique',
                'duration' => 5,
                'startDate' => new \DateTime('2024-09-15'),
                'endDate' => new \DateTime('2025-02-15'),
                'maxParticipants' => 12,
                'price' => 4500.00,
                'level' => 'Expert'
            ],
            [
                'title' => 'Marketing Digital et Social Media',
                'description' => 'Stratégies modernes de marketing digital et gestion des réseaux sociaux',
                'duration' => 3,
                'startDate' => new \DateTime('2024-10-01'),
                'endDate' => new \DateTime('2025-01-15'),
                'maxParticipants' => 25,
                'price' => 2600.00,
                'level' => 'Tous niveaux'
            ]
        ];

        foreach ($formations as $formationData) {
            $formation = new Formation();
            $formation->setTitle($formationData['title']);
            $formation->setDescription($formationData['description']);
            $formation->setDuration($formationData['duration']);
            $formation->setStartDate($formationData['startDate']);
            $formation->setEndDate($formationData['endDate']);
            $formation->setMaxParticipants($formationData['maxParticipants']);
            $formation->setPrice($formationData['price']);
            $formation->setLevel($formationData['level']);

            $manager->persist($formation);
        }

        $manager->flush();
    }
}
