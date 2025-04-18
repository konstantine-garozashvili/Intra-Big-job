<?php

namespace App\DataFixtures;

use App\Entity\TicketStatus;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TicketStatusFixtures extends Fixture
{
    public const STATUS_OPEN = 'status-open';
    public const STATUS_IN_PROGRESS = 'status-in-progress';
    public const STATUS_RESOLVED = 'status-resolved';
    public const STATUS_CLOSED = 'status-closed';
    public const STATUS_PENDING = 'status-pending';

    public function load(ObjectManager $manager): void
    {
        $statuses = [
            self::STATUS_OPEN => [
                'name' => 'Ouvert',
                'description' => 'Ticket ouvert en attente de traitement',
                'color' => '#3498db'
            ],
            self::STATUS_IN_PROGRESS => [
                'name' => 'En cours',
                'description' => 'Ticket en cours de traitement',
                'color' => '#f39c12'
            ],
            self::STATUS_RESOLVED => [
                'name' => 'Résolu',
                'description' => 'Ticket résolu',
                'color' => '#2ecc71'
            ],
            self::STATUS_CLOSED => [
                'name' => 'Fermé',
                'description' => 'Ticket fermé',
                'color' => '#7f8c8d'
            ],
            self::STATUS_PENDING => [
                'name' => 'En attente',
                'description' => 'En attente d\'informations supplémentaires',
                'color' => '#e74c3c'
            ]
        ];

        foreach ($statuses as $reference => $data) {
            $status = new TicketStatus();
            $status->setName($data['name']);
            $status->setDescription($data['description']);
            $status->setColor($data['color']);
            
            $manager->persist($status);
            
            // Store the reference to use in other fixtures
            $this->addReference($reference, $status);
        }

        $manager->flush();
    }
} 