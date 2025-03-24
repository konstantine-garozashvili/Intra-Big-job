<?php

namespace App\DataFixtures;

use App\Domains\Global\Document\Entity\DocumentType;
use App\Domains\Global\Document\Entity\DocumentCategory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class DocumentTypeFixtures extends Fixture implements DependentFixtureInterface
{
    public const TYPE_ID_CARD = 'type-id-card';
    public const TYPE_PASSPORT = 'type-passport';
    public const TYPE_DIPLOMA = 'type-diploma';
    public const TYPE_TRANSCRIPT = 'type-transcript';
    public const TYPE_CV = 'type-cv';
    public const TYPE_RECOMMENDATION = 'type-recommendation';
    public const TYPE_REGISTRATION = 'type-registration';
    public const TYPE_MEDICAL_CERTIFICATE = 'type-medical-certificate';

    public function load(ObjectManager $manager): void
    {
        $types = [
            self::TYPE_ID_CARD => [
                'code' => 'ID_CARD',
                'name' => 'Carte d\'identité',
                'description' => 'Carte nationale d\'identité en cours de validité',
                'category' => DocumentCategoryFixtures::CATEGORY_IDENTITY,
                'mimeTypes' => ['application/pdf', 'image/jpeg', 'image/png'],
                'maxSize' => 5242880, // 5MB
                'isRequired' => true
            ],
            self::TYPE_PASSPORT => [
                'code' => 'PASSPORT',
                'name' => 'Passeport',
                'description' => 'Passeport en cours de validité',
                'category' => DocumentCategoryFixtures::CATEGORY_IDENTITY,
                'mimeTypes' => ['application/pdf', 'image/jpeg', 'image/png'],
                'maxSize' => 5242880,
                'isRequired' => false
            ],
            self::TYPE_DIPLOMA => [
                'code' => 'DIPLOMA',
                'name' => 'Diplôme',
                'description' => 'Diplôme ou attestation de réussite',
                'category' => DocumentCategoryFixtures::CATEGORY_ACADEMIC,
                'mimeTypes' => ['application/pdf'],
                'maxSize' => 10485760, // 10MB
                'isRequired' => true
            ],
            self::TYPE_TRANSCRIPT => [
                'code' => 'TRANSCRIPT',
                'name' => 'Relevé de notes',
                'description' => 'Relevé de notes officiel',
                'category' => DocumentCategoryFixtures::CATEGORY_ACADEMIC,
                'mimeTypes' => ['application/pdf'],
                'maxSize' => 10485760,
                'isRequired' => true
            ],
            self::TYPE_CV => [
                'code' => 'CV',
                'name' => 'Curriculum Vitae',
                'description' => 'CV à jour',
                'category' => DocumentCategoryFixtures::CATEGORY_PROFESSIONAL,
                'mimeTypes' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                'maxSize' => 2097152, // 2MB
                'isRequired' => true
            ],
            self::TYPE_RECOMMENDATION => [
                'code' => 'RECOMMENDATION',
                'name' => 'Lettre de recommandation',
                'description' => 'Lettre de recommandation professionnelle',
                'category' => DocumentCategoryFixtures::CATEGORY_PROFESSIONAL,
                'mimeTypes' => ['application/pdf'],
                'maxSize' => 2097152,
                'isRequired' => false
            ],
            self::TYPE_REGISTRATION => [
                'code' => 'REGISTRATION',
                'name' => 'Formulaire d\'inscription',
                'description' => 'Formulaire d\'inscription complété et signé',
                'category' => DocumentCategoryFixtures::CATEGORY_ADMINISTRATIVE,
                'mimeTypes' => ['application/pdf'],
                'maxSize' => 5242880,
                'isRequired' => true
            ],
            self::TYPE_MEDICAL_CERTIFICATE => [
                'code' => 'MEDICAL_CERTIFICATE',
                'name' => 'Certificat médical',
                'description' => 'Certificat médical d\'aptitude',
                'category' => DocumentCategoryFixtures::CATEGORY_MEDICAL,
                'mimeTypes' => ['application/pdf'],
                'maxSize' => 5242880,
                'isRequired' => true
            ],
        ];

        foreach ($types as $reference => $data) {
            $type = new DocumentType();
            $type->setCode($data['code']);
            $type->setName($data['name']);
            $type->setDescription($data['description']);
            $type->setAllowedMimeTypes($data['mimeTypes']);
            $type->setMaxFileSize($data['maxSize']);
            $type->setIsRequired($data['isRequired']);
            $type->setIsActive(true);

            /** @var DocumentCategory $category */
            $category = $this->getReference($data['category'], DocumentCategory::class);
            $type->addCategory($category);

            $manager->persist($type);
            $this->addReference($reference, $type);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            DocumentCategoryFixtures::class,
        ];
    }
} 