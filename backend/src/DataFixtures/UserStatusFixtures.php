<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\UserStatus;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class UserStatusFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // Récupérer tous les utilisateurs
        $users = $manager->getRepository(User::class)->findAll();
        
        // Pour chaque utilisateur, créer un statut par défaut (Actif)
        foreach ($users as $user) {
            $userStatus = new UserStatus();
            $userStatus->setUser($user);
            $userStatus->setStatus($this->getReference(Status::class, StatusFixtures::STATUS_ACTIVE));            
            $manager->persist($userStatus);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            StatusFixtures::class,
        ];
    }
}