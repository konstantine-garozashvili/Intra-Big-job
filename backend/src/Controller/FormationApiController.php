<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Entity\User;
use App\Repository\FormationRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/formations')]
class FormationApiController extends AbstractController
{
    private $formationRepository;
    private $userRepository;
    private $entityManager;
    private $serializer;

    public function __construct(
        FormationRepository $formationRepository,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer
    ) {
        $this->formationRepository = $formationRepository;
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
    }

    #[Route('', name: 'api_formations_list', methods: ['GET'])]
    #[IsGranted('ROLE_TEACHER')]
    public function list(): JsonResponse
    {
        $formations = $this->formationRepository->findAll();
        $data = [];

        foreach ($formations as $formation) {
            $students = [];
            foreach ($formation->getStudents() as $student) {
                $students[] = [
                    'id' => $student->getId(),
                    'firstName' => $student->getFirstName(),
                    'lastName' => $student->getLastName(),
                    'email' => $student->getEmail()
                ];
            }

            $data[] = [
                'id' => $formation->getId(),
                'name' => $formation->getName(),
                'description' => $formation->getDescription(),
                'promotion' => $formation->getPromotion(),
                'students' => $students
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/available-students', name: 'api_formations_available_students', methods: ['GET'])]
    #[IsGranted('ROLE_TEACHER')]
    public function getAvailableStudents(Request $request): JsonResponse
    {
        $formationId = $request->query->get('formationId');
        $formation = $formationId ? $this->formationRepository->find($formationId) : null;

        // Récupérer tous les utilisateurs avec le rôle ROLE_STUDENT
        $students = $this->userRepository->findByRole('ROLE_STUDENT');

        // Si une formation est spécifiée, exclure les étudiants déjà inscrits
        if ($formation) {
            $enrolledStudentIds = array_map(function($student) {
                return $student->getId();
            }, $formation->getStudents()->toArray());

            $students = array_filter($students, function($student) use ($enrolledStudentIds) {
                return !in_array($student->getId(), $enrolledStudentIds);
            });
        }

        $data = array_map(function($student) {
            return [
                'id' => $student->getId(),
                'firstName' => $student->getFirstName(),
                'lastName' => $student->getLastName(),
                'email' => $student->getEmail()
            ];
        }, $students);

        return new JsonResponse(array_values($data));
    }

    #[Route('/{id}/students', name: 'api_formations_add_student', methods: ['POST'])]
    #[IsGranted('ROLE_TEACHER')]
    public function addStudent(Formation $formation, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $studentId = $data['studentId'] ?? null;

        if (!$studentId) {
            return new JsonResponse(['error' => 'Student ID is required'], Response::HTTP_BAD_REQUEST);
        }

        $student = $this->userRepository->find($studentId);

        if (!$student) {
            return new JsonResponse(['error' => 'Student not found'], Response::HTTP_NOT_FOUND);
        }

        if (!in_array('ROLE_STUDENT', $student->getRoles())) {
            return new JsonResponse(['error' => 'User is not a student'], Response::HTTP_BAD_REQUEST);
        }

        if ($formation->getStudents()->contains($student)) {
            return new JsonResponse(['error' => 'Student already enrolled'], Response::HTTP_BAD_REQUEST);
        }

        $formation->addStudent($student);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Student added successfully']);
    }
}
