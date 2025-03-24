<?php

namespace App\DataFixtures;

use App\Entity\UserSituationType;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class UserSituationTypeFixtures extends Fixture
{
    public const SITUATION_INITIAL = 'SITUATION_INITIAL';
    public const SITUATION_ALTERNANCE = 'SITUATION_ALTERNANCE';
    public const SITUATION_STAGE = 'SITUATION_STAGE';
    public const SITUATION_EMPLOI = 'SITUATION_EMPLOI';

    public function load(ObjectManager $manager): void
    {
        $situations = [
            [
                'reference' => self::SITUATION_INITIAL,
                'name' => 'Initial',
                'description' => 'Formation initiale'
            ],
            [
                'reference' => self::SITUATION_ALTERNANCE,
                'name' => 'Alternance',
                'description' => 'Formation en alternance'
            ],
            [
                'reference' => self::SITUATION_STAGE,
                'name' => 'Stage',
                'description' => 'En stage'
            ],
            [
                'reference' => self::SITUATION_EMPLOI,
                'name' => 'Emploi',
                'description' => 'En emploi'
            ],
        ];

        foreach ($situations as $situationData) {
            $situation = new UserSituationType();
            $situation->setName($situationData['name']);
            $situation->setDescription($situationData['description']);
            
            $manager->persist($situation);
            $this->addReference($situationData['reference'], $situation);
        }

        $manager->flush();
    }
} 