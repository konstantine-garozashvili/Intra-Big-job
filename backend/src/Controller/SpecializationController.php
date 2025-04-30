<?php

namespace App\Controller;

use App\Entity\Specialization;
use App\Repository\SpecializationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class SpecializationController extends AbstractController
{
    public function __construct(
        private readonly SpecializationRepository $specializationRepository
    ) {
    }

    /**
     * Récupère toutes les spécialisations
     */
    #[Route('/specializations', name: 'api_specializations_list', methods: ['GET'])]
    public function getAllSpecializations(): JsonResponse
    {
        $specializations = $this->specializationRepository->findAll();
        
        $data = array_map(function(Specialization $specialization) {
            return [
                'id' => $specialization->getId(),
                'name' => $specialization->getName(),
                'domain' => $specialization->getDomain() ? [
                    'id' => $specialization->getDomain()->getId(),
                    'name' => $specialization->getDomain()->getName()
                ] : null
            ];
        }, $specializations);

        return $this->json([
            'success' => true,
            'data' => [
                'specializations' => $data
            ]
        ]);
    }

    /**
     * Récupère une spécialisation par son ID
     */
    #[Route('/specializations/{id}', name: 'api_specializations_get', methods: ['GET'])]
    public function getSpecialization(int $id): JsonResponse
    {
        $specialization = $this->specializationRepository->find($id);

        if (!$specialization) {
            return $this->json([
                'success' => false,
                'message' => 'Spécialisation non trouvée'
            ], 404);
        }

        $data = [
            'id' => $specialization->getId(),
            'name' => $specialization->getName(),
            'domain' => $specialization->getDomain() ? [
                'id' => $specialization->getDomain()->getId(),
                'name' => $specialization->getDomain()->getName()
            ] : null
        ];

        return $this->json([
            'success' => true,
            'data' => [
                'specialization' => $data
            ]
        ]);
    }
}