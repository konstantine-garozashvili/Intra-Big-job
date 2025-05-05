<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Entity\FormationTeacher;
use App\Entity\User;
use App\Repository\FormationRepository;
use App\Repository\FormationTeacherRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/formation-teachers')]
#[IsGranted('ROLE_ADMIN')]
class FormationTeacherController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private FormationTeacherRepository $formationTeacherRepository,
        private FormationRepository $formationRepository,
        private UserRepository $userRepository,
        private SerializerInterface $serializer
    ) {
    }

    #[Route('', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $formationTeachers = $this->formationTeacherRepository->findAll();
        
        return $this->json($formationTeachers, Response::HTTP_OK, [], ['groups' => ['formation:read']]);
    }

    #[Route('/formation/{id}', methods: ['GET'])]
    public function getTeachersByFormation(int $id): JsonResponse
    {
        $teachers = $this->formationTeacherRepository->findTeachersByFormation($id);
        
        return $this->json($teachers, Response::HTTP_OK, [], ['groups' => ['formation:read']]);
    }

    #[Route('/teacher/{id}', methods: ['GET'])]
    public function getFormationsByTeacher(int $id): JsonResponse
    {
        $formations = $this->formationTeacherRepository->findFormationsByTeacher($id);
        
        return $this->json($formations, Response::HTTP_OK, [], ['groups' => ['formation:read']]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['formation_id']) || !isset($data['user_id'])) {
            return $this->json(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        $formation = $this->formationRepository->find($data['formation_id']);
        $user = $this->userRepository->find($data['user_id']);

        if (!$formation || !$user) {
            return $this->json(['error' => 'Formation or User not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si la relation existe déjà
        $existingRelation = $this->formationTeacherRepository->findOneBy([
            'formation' => $formation,
            'user' => $user
        ]);

        if ($existingRelation) {
            return $this->json(['error' => 'This teacher is already assigned to this formation'], Response::HTTP_CONFLICT);
        }

        $formationTeacher = new FormationTeacher();
        $formationTeacher->setFormation($formation);
        $formationTeacher->setUser($user);
        $formationTeacher->setIsMainTeacher($data['is_main_teacher'] ?? false);

        $this->entityManager->persist($formationTeacher);
        $this->entityManager->flush();

        return $this->json($formationTeacher, Response::HTTP_CREATED, [], ['groups' => ['formation:read']]);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $formationTeacher = $this->formationTeacherRepository->find($id);

        if (!$formationTeacher) {
            return $this->json(['error' => 'Formation teacher relation not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['is_main_teacher'])) {
            $formationTeacher->setIsMainTeacher($data['is_main_teacher']);
        }

        $this->entityManager->flush();

        return $this->json($formationTeacher, Response::HTTP_OK, [], ['groups' => ['formation:read']]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $formationTeacher = $this->formationTeacherRepository->find($id);

        if (!$formationTeacher) {
            return $this->json(['error' => 'Formation teacher relation not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($formationTeacher);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
} 