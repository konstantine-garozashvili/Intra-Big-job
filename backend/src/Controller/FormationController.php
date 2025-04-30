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

#[Route('/api/formations')]
class FormationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private FormationRepository $formationRepository,
        private SpecializationRepository $specializationRepository
    ) {
    }

    #[Route('', name: 'get_formations', methods: ['GET'])]
    public function index(): JsonResponse
    {
        try {
            $formations = $this->formationRepository->findAll();
            $data = $this->serializer->serialize($formations, 'json', ['groups' => 'formation:read']);
            return new JsonResponse($data, Response::HTTP_OK, [], true);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'get_formation', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        try {
            $formation = $this->formationRepository->find($id);
            
            if (!$formation) {
                return new JsonResponse(['message' => 'Formation not found'], Response::HTTP_NOT_FOUND);
            }

            return new JsonResponse(
                $this->serializer->serialize($formation, 'json'),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', name: 'create_formation', methods: ['POST'])]
    #[IsGranted('ROLE_RECRUITER', message: 'Only recruiters can create formations')]
    public function create(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            // Vérifier si la spécialisation existe
            if (!isset($data['specialization_id'])) {
                return new JsonResponse([
                    'message' => 'Specialization ID is required'
                ], Response::HTTP_BAD_REQUEST);
            }

            $specialization = $this->specializationRepository->find($data['specialization_id']);
            if (!$specialization) {
                return new JsonResponse([
                    'message' => 'Specialization not found'
                ], Response::HTTP_NOT_FOUND);
            }
            
            $formation = new Formation();
            $formation->setName($data['name']);
            $formation->setPromotion($data['promotion']);
            $formation->setDescription($data['description'] ?? null);
            $formation->setCapacity($data['capacity']);
            $formation->setDateStart(new \DateTime($data['dateStart']));
            $formation->setLocation($data['location'] ?? null);
            $formation->setDuration($data['duration']);
            $formation->setSpecialization($specialization);

            $errors = $this->validator->validate($formation);
            if (count($errors) > 0) {
                return new JsonResponse(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->persist($formation);
            $this->entityManager->flush();

            return new JsonResponse(
                $this->serializer->serialize($formation, 'json', ['groups' => 'formation:read']),
                Response::HTTP_CREATED,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'message' => $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update_formation', methods: ['PUT'])]
    #[IsGranted('ROLE_RECRUITER', message: 'Only recruiters can update formations')]
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $formation = $this->formationRepository->find($id);
            
            if (!$formation) {
                return new JsonResponse(['message' => 'Formation not found'], Response::HTTP_NOT_FOUND);
            }

            $data = json_decode($request->getContent(), true);

            if (isset($data['specialization_id'])) {
                $specialization = $this->specializationRepository->find($data['specialization_id']);
                if (!$specialization) {
                    return new JsonResponse([
                        'message' => 'Specialization not found'
                    ], Response::HTTP_NOT_FOUND);
                }
                $formation->setSpecialization($specialization);
            }

            if (isset($data['name'])) {
                $formation->setName($data['name']);
            }
            if (isset($data['promotion'])) {
                $formation->setPromotion($data['promotion']);
            }
            if (array_key_exists('description', $data)) {
                $formation->setDescription($data['description']);
            }
            if (isset($data['capacity'])) {
                $formation->setCapacity($data['capacity']);
            }
            if (isset($data['dateStart'])) {
                $formation->setDateStart(new \DateTime($data['dateStart']));
            }
            if (array_key_exists('location', $data)) {
                $formation->setLocation($data['location']);
            }
            if (isset($data['duration'])) {
                $formation->setDuration($data['duration']);
            }

            $errors = $this->validator->validate($formation);
            if (count($errors) > 0) {
                return new JsonResponse(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->flush();

            return new JsonResponse(
                $this->serializer->serialize($formation, 'json', ['groups' => 'formation:read']),
                Response::HTTP_OK,
                [],
                true
            );
        } catch (\Exception $e) {
            return new JsonResponse([
                'message' => $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete_formation', methods: ['DELETE'])]
    #[IsGranted('ROLE_RECRUITER', message: 'Only recruiters can delete formations')]
    public function delete(int $id): JsonResponse
    {
        try {
            $formation = $this->formationRepository->find($id);
            
            if (!$formation) {
                return new JsonResponse(['message' => 'Formation not found'], Response::HTTP_NOT_FOUND);
            }

            $this->entityManager->remove($formation);
            $this->entityManager->flush();

            return new JsonResponse(null, Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 