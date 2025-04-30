<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Repository\FormationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api')]
class FormationController extends AbstractController
{
    private $entityManager;
    private $formationRepository;
    private $serializer;

    public function __construct(
        EntityManagerInterface $entityManager,
        FormationRepository $formationRepository,
        SerializerInterface $serializer
    ) {
        $this->entityManager = $entityManager;
        $this->formationRepository = $formationRepository;
        $this->serializer = $serializer;
    }

    #[Route('/formations', name: 'get_formations', methods: ['GET'])]
    public function getAllFormations(): JsonResponse
    {
        $formations = $this->formationRepository->findAll();
        
        $data = array_map(function ($formation) {
            return [
                'id' => $formation->getId(),
                'name' => $formation->getName(),
                'promotion' => $formation->getPromotion(),
                'description' => $formation->getDescription(),
                'capacity' => $formation->getCapacity(),
                'dateStart' => $formation->getDateStart()->format('Y-m-d'),
                'location' => $formation->getLocation(),
                'duration' => $formation->getDuration()
            ];
        }, $formations);

        return new JsonResponse($data);
    }

    #[Route('/formations/{id}', name: 'get_formation', methods: ['GET'])]
    public function getFormation(int $id): JsonResponse
    {
        $formation = $this->formationRepository->find($id);

        if (!$formation) {
            return new JsonResponse(['message' => 'Formation not found'], Response::HTTP_NOT_FOUND);
        }

        $data = [
            'id' => $formation->getId(),
            'name' => $formation->getName(),
            'promotion' => $formation->getPromotion(),
            'description' => $formation->getDescription(),
            'capacity' => $formation->getCapacity(),
            'dateStart' => $formation->getDateStart()->format('Y-m-d'),
            'location' => $formation->getLocation(),
            'duration' => $formation->getDuration()
        ];

        return new JsonResponse($data);
    }

    #[Route('/formations', name: 'create_formation', methods: ['POST'])]
    public function createFormation(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $formation = new Formation();
        $formation->setName($data['name']);
        $formation->setPromotion($data['promotion']);
        $formation->setDescription($data['description']);
        $formation->setCapacity($data['capacity']);
        $formation->setDateStart(new \DateTime($data['dateStart']));
        $formation->setLocation($data['location']);
        $formation->setDuration($data['duration']);

        $this->entityManager->persist($formation);
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Formation created successfully',
            'id' => $formation->getId()
        ], Response::HTTP_CREATED);
    }

    #[Route('/formations/{id}', name: 'update_formation', methods: ['PUT'])]
    public function updateFormation(Request $request, int $id): JsonResponse
    {
        $formation = $this->formationRepository->find($id);

        if (!$formation) {
            return new JsonResponse(['message' => 'Formation not found'], Response::HTTP_NOT_FOUND);
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
        if (isset($data['capacity'])) {
            $formation->setCapacity($data['capacity']);
        }
        if (isset($data['dateStart'])) {
            $formation->setDateStart(new \DateTime($data['dateStart']));
        }
        if (isset($data['location'])) {
            $formation->setLocation($data['location']);
        }
        if (isset($data['duration'])) {
            $formation->setDuration($data['duration']);
        }

        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Formation updated successfully']);
    }

    #[Route('/formations/{id}', name: 'delete_formation', methods: ['DELETE'])]
    public function deleteFormation(int $id): JsonResponse
    {
        $formation = $this->formationRepository->find($id);

        if (!$formation) {
            return new JsonResponse(['message' => 'Formation not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($formation);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Formation deleted successfully']);
    }
} 