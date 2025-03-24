<?php

namespace App\DataFixtures;

use App\Entity\UserDiploma;
use App\Entity\User;
use App\Entity\Diploma;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class UserDiplomaFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // Récupérer les utilisateurs avec le rôle étudiant
        $users = $manager->getRepository(User::class)->findAll();
        $studentUsers = [];
        
        foreach ($users as $user) {
            $roles = $user->getRoles();
            if (in_array('ROLE_STUDENT', $roles)) {
                $studentUsers[] = $user;
            }
        }
        
        // Si aucun utilisateur étudiant n'est trouvé, on ne fait rien
        if (empty($studentUsers)) {
            return;
        }
        
        // Récupérer tous les diplômes
        $diplomas = $manager->getRepository(Diploma::class)->findAll();
        
        // Pour chaque étudiant, attribuer 1 à 3 diplômes aléatoires
        foreach ($studentUsers as $student) {
            // Nombre aléatoire de diplômes (entre 1 et 3)
            $numDiplomas = rand(1, 3);
            
            // Mélanger les diplômes pour en prendre aléatoirement
            shuffle($diplomas);
            
            // Attribuer les diplômes
            for ($i = 0; $i < $numDiplomas && $i < count($diplomas); $i++) {
                $userDiploma = new UserDiploma();
                $userDiploma->setUser($student);
                $userDiploma->setDiploma($diplomas[$i]);
                
                // Date d'obtention aléatoire dans les 10 dernières années
                $year = rand(date('Y') - 10, date('Y'));
                $month = rand(1, 12);
                $day = rand(1, 28); // Pour éviter les problèmes avec février
                $obtainedDate = new \DateTime("$year-$month-$day");
                
                $userDiploma->setObtainedDate($obtainedDate);
                
                $manager->persist($userDiploma);
            }
        }
        
        $manager->flush();
    }
    
    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            DiplomaFixtures::class,
        ];
    }
} 