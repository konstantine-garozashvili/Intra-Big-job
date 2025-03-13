<?php

namespace App\DataFixtures;

use App\Entity\Theme;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ThemeFixtures extends Fixture
{
    public const THEME_LIGHT = 'theme-light';
    public const THEME_DARK = 'theme-dark';
    public const THEME_SYSTEM = 'theme-system';

    public function load(ObjectManager $manager): void
    {
        $themes = [
            self::THEME_LIGHT => [
                'name' => 'light',
                'description' => 'Thème clair'
            ],
            self::THEME_DARK => [
                'name' => 'dark',
                'description' => 'Thème sombre'
            ],
            self::THEME_SYSTEM => [
                'name' => 'system',
                'description' => 'Thème système (suit les préférences du système)'
            ],
        ];

        foreach ($themes as $reference => $data) {
            $theme = new Theme();
            $theme->setName($data['name']);
            $theme->setDescription($data['description']);
            $manager->persist($theme);
            $this->addReference($reference, $theme);
        }

        $manager->flush();
    }
} 