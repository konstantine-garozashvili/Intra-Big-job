<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Repository\FormationRepository;
use App\Domains\Global\Repository\SpecializationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class FormationController extends AbstractController
{
    public function __construct(
        private readonly FormationRepository $formationRepository,
        private readonly SpecializationRepository $specializationRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator
    ) {
    }

    #[Route('/formations', name: 'api_formations_list', methods: ['GET'])]
    public function getAllFormations(): JsonResponse
    {
        $formations = $this->formationRepository->findAll();
        
        $data = array_map(function(Formation $formation) {
            return [
                'id' => $formation->getId(),
                'name' => $formation->getName(),
                'promotion' => $formation->getPromotion(),
                'description' => $formation->getDescription(),
                'specialization' => $formation->getSpecialization() ? [
                    'id' => $formation->getSpecialization()->getId(),
                    'name' => $formation->getSpecialization()->getName()
                ] : null
            ];
        }, $formations);

        return $this->json([
            'success' => true,
            'data' => [
                'formations' => $data
            ]
        ]);
    }

    #[Route('/formations/{id}', name: 'api_formations_get', methods: ['GET'])]
    public function getFormation(int $id): JsonResponse
    {
        $formation = $this->formationRepository->find($id);

        if (!$formation) {
            return $this->json([
                'success' => false,
                'message' => 'Formation non trouvée'
            ], 404);
        }

        $data = [
            'id' => $formation->getId(),
            'name' => $formation->getName(),
            'promotion' => $formation->getPromotion(),
            'description' => $formation->getDescription(),
            'specialization' => $formation->getSpecialization() ? [
                'id' => $formation->getSpecialization()->getId(),
                'name' => $formation->getSpecialization()->getName()
            ] : null
        ];

        return $this->json([
            'success' => true,
            'data' => [
                'formation' => $data
            ]
        ]);
    }

    #[Route('/formations', name: 'api_formations_create', methods: ['POST'])]
    public function createFormation(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $formation = new Formation();
        $formation->setName($data['name']);
        $formation->setPromotion($data['promotion']);
        if (isset($data['description'])) {
            $formation->setDescription($data['description']);
        }

        // Gestion de la spécialisation
        if (isset($data['specializationId'])) {
            $specialization = $this->specializationRepository->find($data['specializationId']);
            if ($specialization) {
                $formation->setSpecialization($specialization);
            }
        }

        $this->entityManager->persist($formation);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'data' => [
                'formation' => [
                    'id' => $formation->getId(),
                    'name' => $formation->getName(),
                    'promotion' => $formation->getPromotion(),
                    'description' => $formation->getDescription(),
                    'specialization' => $formation->getSpecialization() ? [
                        'id' => $formation->getSpecialization()->getId(),
                        'name' => $formation->getSpecialization()->getName()
                    ] : null
                ]
            ]
        ], 201);
    }

    #[Route('/formations/{id}', name: 'api_formations_update', methods: ['PUT'])]
    public function updateFormation(int $id, Request $request): JsonResponse
    {
        $formation = $this->formationRepository->find($id);

        if (!$formation) {
            return $this->json([
                'success' => false,
                'message' => 'Formation non trouvée'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $formation->setName($data['name']);
        }
        if (isset($data['promotion'])) {
            $formation->setPromotion($data['promotion']);
        }
        if (isset($data['description'])) {
            $formation->setDescription($data['description']);
        }

        // Gestion de la spécialisation
        if (isset($data['specializationId'])) {
            $specialization = $this->specializationRepository->find($data['specializationId']);
            if ($specialization) {
                $formation->setSpecialization($specialization);
            }
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'data' => [
                'formation' => [
                    'id' => $formation->getId(),
                    'name' => $formation->getName(),
                    'promotion' => $formation->getPromotion(),
                    'description' => $formation->getDescription(),
                    'specialization' => $formation->getSpecialization() ? [
                        'id' => $formation->getSpecialization()->getId(),
                        'name' => $formation->getSpecialization()->getName()
                    ] : null
                ]
            ]
        ]);
    }

    #[Route('/formations/{id}', name: 'api_formations_delete', methods: ['DELETE'])]
    public function deleteFormation(int $id): JsonResponse
    {
        $formation = $this->formationRepository->find($id);

        if (!$formation) {
            return $this->json([
                'success' => false,
                'message' => 'Formation non trouvée'
            ], 404);
        }

        $this->entityManager->remove($formation);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Formation supprimée avec succès'
        ]);
    }
} 