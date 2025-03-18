<?php

namespace App\DataFixtures;

use App\Entity\Status;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class StatusFixtures extends Fixture
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
                'description' => 'Utilisateur actif avec accès complet'
            ],
            self::STATUS_PENDING => [
                'name' => 'En attente',
                'description' => 'Compte en attente de validation'
            ],
            self::STATUS_BLOCKED => [
                'name' => 'Bloqué',
                'description' => 'Compte temporairement bloqué'
            ],
            self::STATUS_ARCHIVED => [
                'name' => 'Archivé',
                'description' => 'Compte archivé - accès restreint'
            ],
            self::STATUS_GRADUATED => [
                'name' => 'Diplômé',
                'description' => 'Étudiant ayant terminé sa formation'
            ],
            self::STATUS_ON_LEAVE => [
                'name' => 'En congé',
                'description' => 'Utilisateur temporairement absent'
            ],
        ];

        foreach ($statuses as $reference => $data) {
            $status = new Status();
            $status->setName($data['name']);
            $status->setDescription($data['description']);
            $manager->persist($status);
            $this->addReference($reference, $status);        }

        $manager->flush();
    }
}