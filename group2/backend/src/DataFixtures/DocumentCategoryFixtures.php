<?php

namespace App\DataFixtures;

use App\Domains\Global\Document\Entity\DocumentCategory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class DocumentCategoryFixtures extends Fixture
{
    public const CATEGORY_IDENTITY = 'category-identity';
    public const CATEGORY_ACADEMIC = 'category-academic';
    public const CATEGORY_PROFESSIONAL = 'category-professional';
    public const CATEGORY_ADMINISTRATIVE = 'category-administrative';
    public const CATEGORY_MEDICAL = 'category-medical';

    public function load(ObjectManager $manager): void
    {
        $categories = [
            self::CATEGORY_IDENTITY => [
                'code' => 'IDENTITY',
                'name' => 'Documents d\'identité',
                'description' => 'Pièces d\'identité et documents officiels'
            ],
            self::CATEGORY_ACADEMIC => [
                'code' => 'ACADEMIC',
                'name' => 'Documents académiques',
                'description' => 'Diplômes, relevés de notes et certificats de formation'
            ],
            self::CATEGORY_PROFESSIONAL => [
                'code' => 'PROFESSIONAL',
                'name' => 'Documents professionnels',
                'description' => 'CV, lettres de recommandation et certificats professionnels'
            ],
            self::CATEGORY_ADMINISTRATIVE => [
                'code' => 'ADMINISTRATIVE',
                'name' => 'Documents administratifs',
                'description' => 'Documents administratifs et formulaires officiels'
            ],
            self::CATEGORY_MEDICAL => [
                'code' => 'MEDICAL',
                'name' => 'Documents médicaux',
                'description' => 'Certificats médicaux et documents de santé'
            ],
        ];

        $repository = $manager->getRepository(DocumentCategory::class);

        foreach ($categories as $reference => $data) {
            // Check if the category already exists
            $existingCategory = $repository->findOneBy(['code' => $data['code']]);
            
            if ($existingCategory) {
                // If it exists, use the existing one as reference
                $this->addReference($reference, $existingCategory);
                continue;
            }
            
            // Otherwise create a new one
            $category = new DocumentCategory();
            $category->setCode($data['code']);
            $category->setName($data['name']);
            $category->setDescription($data['description']);
            $category->setIsActive(true);
            $manager->persist($category);
            $this->addReference($reference, $category);
        }

        $manager->flush();
    }
} 