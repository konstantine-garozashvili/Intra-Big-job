<?php

namespace App\DataFixtures;

use App\Entity\City;
use App\Entity\PostalCode;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class PostalCodeFixtures extends Fixture implements DependentFixtureInterface
{
    public const POSTAL_CODE_PARIS_1 = 'postal-code-paris-1';
    public const POSTAL_CODE_PARIS_2 = 'postal-code-paris-2';
    public const POSTAL_CODE_PARIS_3 = 'postal-code-paris-3';
    public const POSTAL_CODE_LYON = 'postal-code-lyon';
    public const POSTAL_CODE_MARSEILLE = 'postal-code-marseille';
    public const POSTAL_CODE_BORDEAUX = 'postal-code-bordeaux';
    public const POSTAL_CODE_LILLE = 'postal-code-lille';

    public function load(ObjectManager $manager): void
    {
        $postalCodes = [
            self::POSTAL_CODE_PARIS_1 => [
                'code' => '75001',
                'city' => CityFixtures::CITY_PARIS,
                'district' => '1er arrondissement'
            ],
            self::POSTAL_CODE_PARIS_2 => [
                'code' => '75002',
                'city' => CityFixtures::CITY_PARIS,
                'district' => '2ème arrondissement'
            ],
            self::POSTAL_CODE_PARIS_3 => [
                'code' => '75003',
                'city' => CityFixtures::CITY_PARIS,
                'district' => '3ème arrondissement'
            ],
            self::POSTAL_CODE_LYON => [
                'code' => '69000',
                'city' => CityFixtures::CITY_LYON,
                'district' => null
            ],
            self::POSTAL_CODE_MARSEILLE => [
                'code' => '13000',
                'city' => CityFixtures::CITY_MARSEILLE,
                'district' => null
            ],
            self::POSTAL_CODE_BORDEAUX => [
                'code' => '33000',
                'city' => CityFixtures::CITY_BORDEAUX,
                'district' => null
            ],
            self::POSTAL_CODE_LILLE => [
                'code' => '59000',
                'city' => CityFixtures::CITY_LILLE,
                'district' => null
            ],
        ];

        foreach ($postalCodes as $reference => $data) {
            $postalCode = new PostalCode();
            $postalCode->setCode($data['code']);
            
            // Récupérer la référence de la ville avec le type explicite
            /** @var City $city */
            $city = $this->getReference($data['city'], City::class);
            $postalCode->setCity($city);
            
            $postalCode->setDistrict($data['district']);
            $manager->persist($postalCode);
            $this->addReference($reference, $postalCode);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            CityFixtures::class,
        ];
    }
} 