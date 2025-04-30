<?php

namespace App\DataFixtures;

use App\Entity\Formation;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class FormationFixtures extends Fixture implements FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['formation'];
    }

    public function load(ObjectManager $manager): void
    {
        $formations = [
            [
                'name' => 'Développement Web Full Stack',
                'promotion' => '2024-2025',
                'description' => 'Formation complète en développement web, couvrant à la fois le front-end et le back-end. Apprenez HTML, CSS, JavaScript, React, PHP, Symfony et plus encore.',
                'capacity' => 24,
                'dateStart' => new \DateTime('2024-09-15'),
                'location' => 'Campus Paris',
                'duration' => 24
            ],
            [
                'name' => 'Data Science & Intelligence Artificielle',
                'promotion' => '2024-2025',
                'description' => 'Plongez dans le monde de la data science et de l\'IA. Python, Machine Learning, Deep Learning, et analyse de données.',
                'capacity' => 20,
                'dateStart' => new \DateTime('2024-10-01'),
                'location' => 'Campus Lyon',
                'duration' => 18
            ],
            [
                'name' => 'Cybersécurité',
                'promotion' => '2024-2025',
                'description' => 'Devenez expert en sécurité informatique. Pentesting, sécurité réseau, cryptographie et réponse aux incidents.',
                'capacity' => 18,
                'dateStart' => new \DateTime('2024-09-01'),
                'location' => 'Campus Lille',
                'duration' => 12
            ],
            [
                'name' => 'DevOps & Cloud Computing',
                'promotion' => '2024-2025',
                'description' => 'Maîtrisez les pratiques DevOps et le cloud computing. Docker, Kubernetes, AWS, CI/CD et automatisation.',
                'capacity' => 16,
                'dateStart' => new \DateTime('2024-11-15'),
                'location' => 'Campus Bordeaux',
                'duration' => 15
            ],
            [
                'name' => 'Design UX/UI',
                'promotion' => '2024-2025',
                'description' => 'Créez des interfaces utilisateur exceptionnelles. Design thinking, prototypage, tests utilisateurs et design systems.',
                'capacity' => 20,
                'dateStart' => new \DateTime('2024-09-30'),
                'location' => 'Campus Paris',
                'duration' => 12
            ],
            [
                'name' => 'Développement Mobile',
                'promotion' => '2024-2025',
                'description' => 'Développez des applications mobiles natives et cross-platform. React Native, Flutter, iOS et Android.',
                'capacity' => 22,
                'dateStart' => new \DateTime('2024-10-15'),
                'location' => 'Campus Marseille',
                'duration' => 18
            ],
            [
                'name' => 'Architecture Logicielle',
                'promotion' => '2024-2025',
                'description' => 'Apprenez à concevoir des architectures logicielles robustes et évolutives. Patterns, microservices, et bonnes pratiques.',
                'capacity' => 15,
                'dateStart' => new \DateTime('2024-11-01'),
                'location' => 'Campus Lyon',
                'duration' => 24
            ],
            [
                'name' => 'Marketing Digital',
                'promotion' => '2024-2025',
                'description' => 'Maîtrisez les stratégies de marketing digital. SEO, réseaux sociaux, analytics et growth hacking.',
                'capacity' => 25,
                'dateStart' => new \DateTime('2024-09-15'),
                'location' => 'Campus Nice',
                'duration' => 12
            ]
        ];

        foreach ($formations as $formationData) {
            $formation = new Formation();
            $formation->setName($formationData['name']);
            $formation->setPromotion($formationData['promotion']);
            $formation->setDescription($formationData['description']);
            $formation->setCapacity($formationData['capacity']);
            $formation->setDateStart($formationData['dateStart']);
            $formation->setLocation($formationData['location']);
            $formation->setDuration($formationData['duration']);

            $manager->persist($formation);
        }

        $manager->flush();
    }
} 