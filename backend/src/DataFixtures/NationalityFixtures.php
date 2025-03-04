<?php

namespace App\DataFixtures;

use App\Entity\Nationality;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class NationalityFixtures extends Fixture
{
    public const NATIONALITY_FRENCH = 'nationality-french';
    public const NATIONALITY_ENGLISH = 'nationality-english';
    public const NATIONALITY_GERMAN = 'nationality-german';
    public const NATIONALITY_SPANISH = 'nationality-spanish';
    public const NATIONALITY_ITALIAN = 'nationality-italian';

    public function load(ObjectManager $manager): void
    {
        $nationalities = [
            self::NATIONALITY_FRENCH => 'Française',
            self::NATIONALITY_ENGLISH => 'Anglaise',
            self::NATIONALITY_GERMAN => 'Allemande',
            self::NATIONALITY_SPANISH => 'Espagnole',
            self::NATIONALITY_ITALIAN => 'Italienne',
        ];

        foreach ($nationalities as $reference => $name) {
            $nationality = new Nationality();
            $nationality->setName($name);
            $manager->persist($nationality);
            $this->addReference($reference, $nationality);
        }

        $manager->flush();
    }
} 