<?php

namespace App\DataFixtures;

use App\Entity\TicketService;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TicketServiceFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $services = [
            [
                'name' => 'Support technique',
                'description' => 'Problèmes techniques liés à l\'application ou au site web'
            ],
            [
                'name' => 'Facturation',
                'description' => 'Questions concernant vos factures ou paiements'
            ],
            [
                'name' => 'Contenu pédagogique',
                'description' => 'Questions ou problèmes liés au contenu des cours'
            ],
            [
                'name' => 'Accès aux cours',
                'description' => 'Problèmes d\'accès aux cours ou aux ressources pédagogiques'
            ],
            [
                'name' => 'Suggestion',
                'description' => 'Suggestions pour améliorer la plateforme ou les cours'
            ],
            [
                'name' => 'Autre',
                'description' => 'Toute autre demande ne correspondant pas aux catégories ci-dessus'
            ],
        ];

        foreach ($services as $serviceData) {
            $service = new TicketService();
            $service->setName($serviceData['name']);
            $service->setDescription($serviceData['description']);
            
            $manager->persist($service);
            
            // Add reference for use in other fixtures
            $this->addReference('ticket-service-' . strtolower(str_replace(' ', '-', $serviceData['name'])), $service);
        }

        $manager->flush();
    }
} 