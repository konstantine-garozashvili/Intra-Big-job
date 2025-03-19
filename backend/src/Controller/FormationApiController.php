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
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function list(): JsonResponse
    {
        // Vérifier si l'utilisateur a l'un des rôles requis
        $user = $this->getUser();
        $userRoles = $user->getRoles();
        
        if (!in_array('ROLE_TEACHER', $userRoles) && 
            !in_array('ROLE_ADMIN', $userRoles) && 
            !in_array('ROLE_SUPERADMIN', $userRoles)) {
            return new JsonResponse(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }
        
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

    #[Route('', name: 'api_formations_create', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function create(Request $request): JsonResponse
    {
        // Vérifier si l'utilisateur a l'un des rôles requis
        $user = $this->getUser();
        $userRoles = $user->getRoles();
        
        if (!in_array('ROLE_TEACHER', $userRoles) && 
            !in_array('ROLE_ADMIN', $userRoles) && 
            !in_array('ROLE_SUPERADMIN', $userRoles)) {
            return new JsonResponse(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }
        
        $data = json_decode($request->getContent(), true);

        if (!isset($data['name']) || !isset($data['promotion'])) {
            return new JsonResponse(['error' => 'Name and promotion are required'], Response::HTTP_BAD_REQUEST);
        }

        $formation = new Formation();
        $formation->setName($data['name']);
        $formation->setPromotion($data['promotion']);
        if (isset($data['description'])) {
            $formation->setDescription($data['description']);
        }

        $this->entityManager->persist($formation);
        $this->entityManager->flush();

        return new JsonResponse([
            'id' => $formation->getId(),
            'name' => $formation->getName(),
            'promotion' => $formation->getPromotion(),
            'description' => $formation->getDescription(),
            'students' => []
        ], Response::HTTP_CREATED);
    }

    #[Route('/available-students', name: 'api_formations_available_students', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getAvailableStudents(Request $request): JsonResponse
    {
        // Vérifier si l'utilisateur a l'un des rôles requis
        $user = $this->getUser();
        $userRoles = $user->getRoles();
        
        if (!in_array('ROLE_TEACHER', $userRoles) && 
            !in_array('ROLE_ADMIN', $userRoles) && 
            !in_array('ROLE_SUPERADMIN', $userRoles)) {
            return new JsonResponse(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }
        
        $formationId = $request->query->get('formationId');
        $formation = $formationId ? $this->formationRepository->find($formationId) : null;

        // Create query builder to get students
        $qb = $this->userRepository->createQueryBuilder('u')
            ->select('u')
            ->leftJoin('u.userRoles', 'ur')
            ->leftJoin('ur.role', 'r')
            ->where('r.name = :roleName')
            ->setParameter('roleName', 'STUDENT');

        // If a formation is specified, exclude students already enrolled
        if ($formation) {
            $qb->andWhere('u NOT IN (SELECT s FROM App\Entity\User s JOIN s.formations f WHERE f.id = :formationId)')
               ->setParameter('formationId', $formationId);
        }

        $students = $qb->getQuery()->getResult();

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
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function addStudent(Formation $formation, Request $request): JsonResponse
    {
        // Vérifier si l'utilisateur a l'un des rôles requis
        $user = $this->getUser();
        $userRoles = $user->getRoles();
        
        if (!in_array('ROLE_TEACHER', $userRoles) && 
            !in_array('ROLE_ADMIN', $userRoles) && 
            !in_array('ROLE_SUPERADMIN', $userRoles)) {
            return new JsonResponse(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }
        
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
