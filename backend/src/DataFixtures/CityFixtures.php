<?php

namespace App\DataFixtures;

use App\Entity\City;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CityFixtures extends Fixture
{
    public const CITY_PARIS = 'city-paris';
    public const CITY_LYON = 'city-lyon';
    public const CITY_MARSEILLE = 'city-marseille';
    public const CITY_BORDEAUX = 'city-bordeaux';
    public const CITY_LILLE = 'city-lille';

    public function load(ObjectManager $manager): void
    {
        $cities = [
            self::CITY_PARIS => [
                'name' => 'Paris'
            ],
            self::CITY_LYON => [
                'name' => 'Lyon'
            ],
            self::CITY_MARSEILLE => [
                'name' => 'Marseille'
            ],
            self::CITY_BORDEAUX => [
                'name' => 'Bordeaux'
            ],
            self::CITY_LILLE => [
                'name' => 'Lille'
            ],
        ];

        foreach ($cities as $reference => $data) {
            $city = new City();
            $city->setName($data['name']);
            $manager->persist($city);
            $this->addReference($reference, $city);
        }

        $manager->flush();
    }
} 