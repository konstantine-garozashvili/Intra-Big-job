<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Service\FormationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Attribute\Security;

#[Route('/api/formations')]
class FormationImageController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private FormationService $formationService
    ) {
    }

    #[Route('/{id}/image', name: 'api_formation_image_upload', methods: ['POST'])]
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
    public function uploadImage(Request $request, Formation $formation): JsonResponse
    {
        try {
            $uploadedFile = $request->files->get('image');

            if (!$uploadedFile) {
                return $this->json([
                    'success' => false,
                    'message' => 'Aucun fichier n\'a été envoyé'
                ], 400);
            }

            // Validate file type
            $mimeType = $uploadedFile->getMimeType();
            $extension = $uploadedFile->getClientOriginalExtension();
            
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            
            $validMimeType = in_array($mimeType, $allowedTypes);
            $validExtension = in_array(strtolower($extension), $allowedExtensions);

            if (!$validMimeType && !$validExtension) {
                return $this->json([
                    'success' => false,
                    'message' => 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WEBP'
                ], 400);
            }

            // Validate file size (max 5MB)
            $maxSize = 5 * 1024 * 1024;
            if ($uploadedFile->getSize() > $maxSize) {
                return $this->json([
                    'success' => false,
                    'message' => 'La taille du fichier dépasse la limite autorisée (5MB)'
                ], 400);
            }

            // Upload image
            $result = $this->formationService->uploadFormationImage($formation, $uploadedFile);

            return $this->json($result, $result['success'] ? 200 : 500);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/{id}/image', name: 'api_formation_image_delete', methods: ['DELETE'])]
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
    public function deleteImage(Formation $formation): JsonResponse
    {
        try {
            $result = $this->formationService->deleteFormationImage($formation);
            return $this->json($result, $result['success'] ? 200 : 500);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue: ' . $e->getMessage()
            ], 500);
        }
    }
} 