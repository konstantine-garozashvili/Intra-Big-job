<?php

namespace App\DataFixtures;

use App\Entity\Product;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ProductFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $product = new Product();
        $product->setName('Produit de test')
            ->setDescription('Ceci est une description de test pour notre premier produit.')
            ->setPrice(19.99)
            ->setIsAvailable(true);

        $manager->persist($product);
        $manager->flush();
    }
} 