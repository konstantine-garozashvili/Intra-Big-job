<?php

namespace App\DataFixtures;

use App\Entity\Role;
use App\Entity\UserStatus;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class UserStatusFixtures extends Fixture implements DependentFixtureInterface
{
    public const STATUS_ACTIVE = 'status-active';
    public const STATUS_PENDING = 'status-pending';
    public const STATUS_BLOCKED = 'status-blocked';
    public const STATUS_ARCHIVED = 'status-archived';
    public const STATUS_GRADUATED = 'status-graduated';
    public const STATUS_ON_LEAVE = 'status-on-leave';

    public function load(ObjectManager $manager): void
    {
        $statuses = [
            self::STATUS_ACTIVE => [
                'name' => 'Actif',
                'description' => 'Utilisateur actif avec accès complet',
                'role' => RoleFixtures::ROLE_STUDENT
            ],
            self::STATUS_PENDING => [
                'name' => 'En attente',
                'description' => 'Compte en attente de validation',
                'role' => RoleFixtures::ROLE_GUEST
            ],
            self::STATUS_BLOCKED => [
                'name' => 'Bloqué',
                'description' => 'Compte temporairement bloqué',
                'role' => RoleFixtures::ROLE_GUEST
            ],
            self::STATUS_ARCHIVED => [
                'name' => 'Archivé',
                'description' => 'Compte archivé - accès restreint',
                'role' => RoleFixtures::ROLE_GUEST
            ],
            self::STATUS_GRADUATED => [
                'name' => 'Diplômé',
                'description' => 'Étudiant ayant terminé sa formation',
                'role' => RoleFixtures::ROLE_STUDENT
            ],
            self::STATUS_ON_LEAVE => [
                'name' => 'En congé',
                'description' => 'Utilisateur temporairement absent',
                'role' => RoleFixtures::ROLE_STUDENT
            ],
        ];

        foreach ($statuses as $reference => $data) {
            $status = new UserStatus();
            $status->setName($data['name']);
            $status->setDescription($data['description']);
            
            /** @var Role $role */
            $role = $this->getReference($data['role'], Role::class);
            $status->setAssociatedRole($role);
            
            $manager->persist($status);
            $this->addReference($reference, $status);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            RoleFixtures::class,
        ];
    }
} 