<?php

namespace App\DataFixtures;

use App\Entity\Address;
use App\Entity\City;
use App\Entity\PostalCode;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class AddressFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $users = $manager->getRepository(User::class)->findAll();
        $cities = $manager->getRepository(City::class)->findAll();
        $postalCodes = $manager->getRepository(PostalCode::class)->findAll();

        $addresses = [
            [
                'name' => '123 Rue de la Paix',
                'complement' => 'Appartement 4B',
                'city' => CityFixtures::CITY_PARIS,
                'postalCode' => PostalCodeFixtures::POSTAL_CODE_PARIS_1
            ],
            [
                'name' => '45 Avenue des Champs-Élysées',
                'complement' => null,
                'city' => CityFixtures::CITY_PARIS,
                'postalCode' => PostalCodeFixtures::POSTAL_CODE_PARIS_2
            ],
            [
                'name' => '78 Boulevard Haussmann',
                'complement' => '3ème étage',
                'city' => CityFixtures::CITY_PARIS,
                'postalCode' => PostalCodeFixtures::POSTAL_CODE_PARIS_3
            ],
            [
                'name' => '15 Rue de la République',
                'complement' => null,
                'city' => CityFixtures::CITY_LYON,
                'postalCode' => PostalCodeFixtures::POSTAL_CODE_LYON
            ],
            [
                'name' => '56 Rue du Vieux Port',
                'complement' => 'Bâtiment B',
                'city' => CityFixtures::CITY_MARSEILLE,
                'postalCode' => PostalCodeFixtures::POSTAL_CODE_MARSEILLE
            ],
            [
                'name' => '89 Cours de l\'Intendance',
                'complement' => null,
                'city' => CityFixtures::CITY_BORDEAUX,
                'postalCode' => PostalCodeFixtures::POSTAL_CODE_BORDEAUX
            ],
            [
                'name' => '34 Rue Faidherbe',
                'complement' => 'Résidence Les Lilas',
                'city' => CityFixtures::CITY_LILLE,
                'postalCode' => PostalCodeFixtures::POSTAL_CODE_LILLE
            ],
        ];

        // Assigner une adresse à chaque utilisateur
        foreach ($users as $index => $user) {
            $addressData = $addresses[$index % count($addresses)];
            
            $address = new Address();
            $address->setName($addressData['name']);
            $address->setComplement($addressData['complement']);
            
            /** @var City $city */
            $city = $this->getReference($addressData['city'], City::class);
            $address->setCity($city);
            
            /** @var PostalCode $postalCode */
            $postalCode = $this->getReference($addressData['postalCode'], PostalCode::class);
            $address->setPostalCode($postalCode);
            
            $address->setUser($user);
            
            $manager->persist($address);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
            CityFixtures::class,
            PostalCodeFixtures::class,
        ];
    }
} 