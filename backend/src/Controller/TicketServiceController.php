<?php

namespace App\Controller;

use App\Entity\TicketService;
use App\Repository\TicketServiceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/ticket-services')]
class TicketServiceController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;
    private TicketServiceRepository $ticketServiceRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        TicketServiceRepository $ticketServiceRepository
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->ticketServiceRepository = $ticketServiceRepository;
    }

    #[Route('', methods: ['GET'])]
    public function getAllServices(): JsonResponse
    {
        $services = $this->ticketServiceRepository->findAll();

        return $this->json(
            $services,
            Response::HTTP_OK,
            [],
            ['groups' => 'ticketService:read']
        );
    }

    #[Route('/{id}', methods: ['GET'])]
    public function getService(int $id): JsonResponse
    {
        $service = $this->ticketServiceRepository->find($id);

        if (!$service) {
            return $this->json(['error' => 'Service not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(
            $service,
            Response::HTTP_OK,
            [],
            ['groups' => 'ticketService:read']
        );
    }

    #[Route('', methods: ['POST'])]
    public function createService(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || empty($data['name'])) {
            return $this->json(['error' => 'Service name is required'], Response::HTTP_BAD_REQUEST);
        }

        $service = new TicketService();
        $service->setName($data['name']);
        
        if (isset($data['description'])) {
            $service->setDescription($data['description']);
        }

        $this->entityManager->persist($service);
        $this->entityManager->flush();

        return $this->json(
            $service,
            Response::HTTP_CREATED,
            [],
            ['groups' => 'ticketService:read']
        );
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function updateService(int $id, Request $request): JsonResponse
    {
        $service = $this->ticketServiceRepository->find($id);

        if (!$service) {
            return $this->json(['error' => 'Service not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name']) && !empty($data['name'])) {
            $service->setName($data['name']);
        }

        if (isset($data['description'])) {
            $service->setDescription($data['description']);
        }

        $this->entityManager->flush();

        return $this->json(
            $service,
            Response::HTTP_OK,
            [],
            ['groups' => 'ticketService:read']
        );
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function deleteService(int $id): JsonResponse
    {
        $service = $this->ticketServiceRepository->find($id);

        if (!$service) {
            return $this->json(['error' => 'Service not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($service);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
} 