<?php

namespace App\DataFixtures;

use App\Entity\Formation;
use App\Entity\User;
use App\Entity\FormationEnrollmentRequest;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class FormationFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // Récupérer les étudiants existants (créés dans UserFixtures)
        $student1 = $manager->getRepository(User::class)->findOneBy(['email' => 'student@bigproject.com']);
        $student2 = $manager->getRepository(User::class)->findOneBy(['email' => 'student2@bigproject.com']);
        $student3 = $manager->getRepository(User::class)->findOneBy(['email' => 'student3@bigproject.com']);

        // Création des formations
        $formation1 = new Formation();
        $formation1->setName('Développement Web');
        $formation1->setPromotion('2024');
        $formation1->setDescription('Formation complète en développement web.');
        $formation1->setCapacity(30);
        $formation1->setDateStart(new \DateTime('2024-09-01'));
        $formation1->setLocation('Paris');
        $formation1->setDuration(12);
        $manager->persist($formation1);

        $formation2 = new Formation();
        $formation2->setName('Cybersécurité');
        $formation2->setPromotion('2024');
        $formation2->setDescription('Formation avancée en cybersécurité.');
        $formation2->setCapacity(25);
        $formation2->setDateStart(new \DateTime('2024-10-01'));
        $formation2->setLocation('Lyon');
        $formation2->setDuration(10);
        $manager->persist($formation2);

        $formation3 = new Formation();
        $formation3->setName('Data Science');
        $formation3->setPromotion('2024');
        $formation3->setDescription('Formation en analyse de données et IA.');
        $formation3->setCapacity(20);
        $formation3->setDateStart(new \DateTime('2024-11-01'));
        $formation3->setLocation('Marseille');
        $formation3->setDuration(14);
        $manager->persist($formation3);

        // Lier les étudiants aux formations (ManyToMany)
        if ($student1) {
            $formation1->addStudent($student1);
            $formation2->addStudent($student1);
        }
        if ($student2) {
            $formation1->addStudent($student2);
            $formation3->addStudent($student2);
        }
        if ($student3) {
            $formation2->addStudent($student3);
            $formation3->addStudent($student3);
        }

        // Créer des FormationEnrollmentRequest pour chaque étudiant/formation
        foreach ([[$formation1, $student1], [$formation1, $student2], [$formation2, $student1], [$formation2, $student3], [$formation3, $student2], [$formation3, $student3]] as [$formation, $student]) {
            if ($formation && $student) {
                $enrollment = new FormationEnrollmentRequest();
                $enrollment->setFormation($formation);
                $enrollment->setUser($student);
                $enrollment->setStatus(true);
                $manager->persist($enrollment);
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [UserFixtures::class];
    }
} 