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
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

#[Route('/api/formation-teachers')]
#[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
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

    #[Route('/available-teachers', methods: ['GET'])]
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
    public function getAvailableTeachers(): JsonResponse
    {
        $teachers = $this->userRepository->findByRoleWithRelations('TEACHER');
        
        $data = array_map(function(User $teacher) {
            return [
                'id' => $teacher->getId(),
                'firstName' => $teacher->getFirstName(),
                'lastName' => $teacher->getLastName(),
                'email' => $teacher->getEmail(),
                'profilePicturePath' => $teacher->getProfilePicturePath()
            ];
        }, $teachers);
        
        return $this->json(['success' => true, 'data' => $data]);
    }

    #[Route('', methods: ['GET'])]
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
    public function index(): JsonResponse
    {
        $formationTeachers = $this->formationTeacherRepository->findAll();
        $data = array_map(function(FormationTeacher $teacher) {
            return [
                'id' => $teacher->getId(),
                'isMainTeacher' => $teacher->isMainTeacher(),
                'user' => [
                    'id' => $teacher->getUser()->getId(),
                    'firstName' => $teacher->getUser()->getFirstName(),
                    'lastName' => $teacher->getUser()->getLastName(),
                    'profilePicturePath' => $teacher->getUser()->getProfilePicturePath()
                ],
                'formation' => [
                    'id' => $teacher->getFormation()->getId(),
                    'name' => $teacher->getFormation()->getName()
                ]
            ];
        }, $formationTeachers);
        
        return $this->json(['success' => true, 'data' => $data]);
    }

    #[Route('/formation/{id}', methods: ['GET'])]
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
    public function getTeachersByFormation(int $id): JsonResponse
    {
        $teachers = $this->formationTeacherRepository->findTeachersByFormation($id);
        $data = array_map(function(FormationTeacher $teacher) {
            return [
                'id' => $teacher->getId(),
                'isMainTeacher' => $teacher->isMainTeacher(),
                'user' => [
                    'id' => $teacher->getUser()->getId(),
                    'firstName' => $teacher->getUser()->getFirstName(),
                    'lastName' => $teacher->getUser()->getLastName(),
                    'profilePicturePath' => $teacher->getUser()->getProfilePicturePath()
                ]
            ];
        }, $teachers);
        
        return $this->json(['success' => true, 'data' => $data]);
    }

    #[Route('/teacher/{id}', methods: ['GET'])]
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
    public function getFormationsByTeacher(int $id): JsonResponse
    {
        $formations = $this->formationTeacherRepository->findFormationsByTeacher($id);
        
        return $this->json($formations, Response::HTTP_OK, [], ['groups' => ['formation:read']]);
    }

    #[Route('/stats', methods: ['GET'])]
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
    public function getStats(): JsonResponse
    {
        $stats = [
            'totalTeachers' => $this->formationTeacherRepository->countTotalTeachers(),
            'totalFormations' => $this->formationTeacherRepository->countTotalFormations(),
            'mainTeachers' => $this->formationTeacherRepository->countMainTeachers(),
            'teachersPerFormation' => $this->formationTeacherRepository->getTeachersPerFormationStats()
        ];
        
        return $this->json(['success' => true, 'data' => $stats]);
    }

    #[Route('/batch', methods: ['POST'])]
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
    public function batchUpdate(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['updates']) || !is_array($data['updates'])) {
            return $this->json(['success' => false, 'error' => 'Invalid request format'], Response::HTTP_BAD_REQUEST);
        }
        
        $results = [];
        foreach ($data['updates'] as $update) {
            try {
                $formationTeacher = $this->formationTeacherRepository->find($update['id']);
                if ($formationTeacher) {
                    if (isset($update['isMainTeacher'])) {
                        $formationTeacher->setIsMainTeacher($update['isMainTeacher']);
                    }
                    $this->entityManager->persist($formationTeacher);
                    $results[] = ['id' => $update['id'], 'success' => true];
                } else {
                    $results[] = ['id' => $update['id'], 'success' => false, 'error' => 'Not found'];
                }
            } catch (\Exception $e) {
                $results[] = ['id' => $update['id'], 'success' => false, 'error' => $e->getMessage()];
            }
        }
        
        $this->entityManager->flush();
        
        return $this->json(['success' => true, 'data' => $results]);
    }

    #[Route('', methods: ['POST'])]
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
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
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
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
    #[Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_SUPERADMIN') or is_granted('ROLE_RECRUITER')")]
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