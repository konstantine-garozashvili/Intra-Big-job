<?php

namespace App\Service;

use App\Entity\Formation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FormationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private S3StorageService $s3StorageService
    ) {
    }

    /**
     * Upload formation image to S3 and update formation entity
     */
    public function uploadFormationImage(Formation $formation, UploadedFile $file): array
    {
        try {
            // Upload to S3 in the formations directory
            $result = $this->s3StorageService->upload($file, 'formations');

            if (!$result['success']) {
                return [
                    'success' => false,
                    'message' => 'Erreur lors de l\'upload: ' . ($result['error'] ?? 'Erreur inconnue')
                ];
            }

            // Delete old image if exists
            if ($formation->getImageUrl()) {
                try {
                    // Extract the key from the old URL
                    $oldKey = $formation->getImageUrl();
                    $this->s3StorageService->delete($oldKey);
                } catch (\Exception $e) {
                    // Log error but continue
                }
            }

            // Update formation with new image URL
            $formation->setImageUrl($result['key']);
            $this->entityManager->persist($formation);
            $this->entityManager->flush();

            return [
                'success' => true,
                'message' => 'Image de formation mise à jour avec succès',
                'data' => [
                    'image_url' => $result['url'],
                    'image_key' => $result['key']
                ]
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'upload de l\'image: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Delete formation image
     */
    public function deleteFormationImage(Formation $formation): array
    {
        try {
            $imageUrl = $formation->getImageUrl();
            
            if (!$imageUrl) {
                return [
                    'success' => false,
                    'message' => 'Aucune image à supprimer'
                ];
            }

            // Delete from S3
            $this->s3StorageService->delete($imageUrl);

            // Update formation
            $formation->setImageUrl(null);
            $this->entityManager->persist($formation);
            $this->entityManager->flush();

            return [
                'success' => true,
                'message' => 'Image supprimée avec succès'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'image: ' . $e->getMessage()
            ];
        }
    }
} 