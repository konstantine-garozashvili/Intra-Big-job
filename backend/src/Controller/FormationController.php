<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Entity\FormationTeacher;
use App\Repository\FormationRepository;
use App\Domains\Global\Repository\SpecializationRepository;
use App\Service\FormationService;
use App\Service\S3StorageService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Domains\Student\Repository\StudentProfileRepository;
use Symfony\Bundle\SecurityBundle\Security;
use App\Service\DocumentStorageFactory;

#[Route('/api')]
class FormationController extends AbstractController
{
    public function __construct(
        private readonly FormationRepository $formationRepository,
        private readonly SpecializationRepository $specializationRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly SerializerInterface $serializer,
        private readonly ValidatorInterface $validator,
        private readonly S3StorageService $s3StorageService,
        private readonly StudentProfileRepository $studentProfileRepository,
        private readonly Security $security,
        private readonly DocumentStorageFactory $documentStorageFactory
    ) {
    }

    #[Route('/formations', name: 'api_formations_list', methods: ['GET'])]
    public function getAllFormations(Request $request): JsonResponse
    {
        $page = $request->query->getInt('page', 1);
        $limit = $request->query->getInt('limit', 10);
        $offset = ($page - 1) * $limit;
        $search = $request->query->get('search', '');

        $formations = $this->formationRepository->searchByName($search, $limit, $offset);
        $totalFormations = $this->formationRepository->countByName($search);
        $totalPages = ceil($totalFormations / $limit);
        
        $data = array_map(function(Formation $formation) {
            $imageUrl = null;
            if ($formation->getImageUrl()) {
                // Vérifier si l'URL contient déjà le domaine S3
                $imageUrl = $formation->getImageUrl();
                if (!str_contains($imageUrl, 'bigproject-storage.s3')) {
                    $imageUrl = $this->s3StorageService->getPresignedUrl($imageUrl);
                }
                // Éviter le double encodage en décodant d'abord l'URL
                $imageUrl = urldecode($imageUrl);
            }

            return [
                'id' => $formation->getId(),
                'name' => $formation->getName(),
                'promotion' => $formation->getPromotion(),
                'description' => $formation->getDescription(),
                'capacity' => $formation->getCapacity(),
                'dateStart' => $formation->getDateStart()->format('Y-m-d'),
                'location' => $formation->getLocation(),
                'duration' => $formation->getDuration(),
                'image_url' => $imageUrl,
                'students' => array_map(function($student) {
                    $profilePictureUrl = null;
                    if ($student->getProfilePicturePath()) {
                        try {
                            $profilePictureUrl = $this->documentStorageFactory->getDocumentUrl($student->getProfilePicturePath());
                        } catch (\Exception $e) {
                            $profilePictureUrl = null;
                        }
                    }
                    return [
                        'id' => $student->getId(),
                        'firstName' => $student->getFirstName(),
                        'lastName' => $student->getLastName(),
                        'profilePictureUrl' => $profilePictureUrl
                    ];
                }, $formation->getStudents()->toArray()),
                'specialization' => $formation->getSpecialization() ? [
                    'id' => $formation->getSpecialization()->getId(),
                    'name' => $formation->getSpecialization()->getName()
                ] : null
            ];
        }, $formations);

        return $this->json([
            'success' => true,
            'data' => [
                'formations' => $data,
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => $totalPages,
                    'limit' => $limit,
                    'total' => $totalFormations
                ]
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

        $imageUrl = null;
        if ($formation->getImageUrl()) {
            // Vérifier si l'URL contient déjà le domaine S3
            $imageUrl = $formation->getImageUrl();
            if (!str_contains($imageUrl, 'bigproject-storage.s3')) {
                $imageUrl = $this->s3StorageService->getPresignedUrl($imageUrl);
            }
            // Éviter le double encodage en décodant d'abord l'URL
            $imageUrl = urldecode($imageUrl);
        }

        $data = [
            'id' => $formation->getId(),
            'name' => $formation->getName(),
            'promotion' => $formation->getPromotion(),
            'description' => $formation->getDescription(),
            'image_url' => $imageUrl,
            'specialization' => $formation->getSpecialization() ? [
                'id' => $formation->getSpecialization()->getId(),
                'name' => $formation->getSpecialization()->getName()
            ] : null,
            'capacity' => $formation->getCapacity(),
            'duration' => $formation->getDuration(),
            'dateStart' => $formation->getDateStart() ? $formation->getDateStart()->format('Y-m-d') : null,
            'location' => $formation->getLocation(),
            'students' => array_map(function($student) {
                $profilePictureUrl = null;
                if ($student->getProfilePicturePath()) {
                    try {
                        $profilePictureUrl = $this->documentStorageFactory->getDocumentUrl($student->getProfilePicturePath());
                    } catch (\Exception $e) {
                        $profilePictureUrl = null;
                    }
                }
                return [
                    'id' => $student->getId(),
                    'firstName' => $student->getFirstName(),
                    'lastName' => $student->getLastName(),
                    'email' => $student->getEmail(),
                    'profilePictureUrl' => $profilePictureUrl
                ];
            }, $formation->getStudents()->toArray()),
        ];

        return $this->json([
            'success' => true,
            'data' => [
                'formation' => $data
            ]
        ]);
    }

    #[Route('/formations', name: 'api_formations_create', methods: ['POST'])]
    public function createFormation(Request $request, FormationService $formationService): JsonResponse
    {
        // Récupérer les champs texte depuis le formulaire multipart
        $name = $request->request->get('name');
        $promotion = $request->request->get('promotion');
        $capacity = $request->request->get('capacity');
        $duration = $request->request->get('duration');
        $dateStart = $request->request->get('dateStart');
        $description = $request->request->get('description');
        $location = $request->request->get('location');
        $specializationId = $request->request->get('specializationId');
        /** @var UploadedFile|null $imageFile */
        $imageFile = $request->files->get('image');

        // Vérification des champs obligatoires
        $requiredFields = ['name', 'promotion', 'capacity', 'duration', 'dateStart', 'image'];
        $missingFields = [];
        foreach ($requiredFields as $field) {
            if ($field === 'image' && !$imageFile) {
                $missingFields[] = $field;
            } elseif ($field !== 'image' && empty($$field)) {
                $missingFields[] = $field;
            }
        }
        if (!empty($missingFields)) {
            return $this->json([
                'success' => false,
                'message' => 'Champs obligatoires manquants : ' . implode(', ', $missingFields)
            ], 400);
        }

        try {
            $formation = new Formation();
            $formation->setName($name);
            $formation->setPromotion($promotion);
            $formation->setCapacity((int)$capacity);
            $formation->setDuration((int)$duration);
            $formation->setDateStart(new \DateTime($dateStart));
            if ($description) {
                $formation->setDescription($description);
            }
            if ($location) {
                $formation->setLocation($location);
            }
            // Gestion de la spécialisation
            if ($specializationId) {
                $specialization = $this->specializationRepository->find($specializationId);
                if ($specialization) {
                    $formation->setSpecialization($specialization);
                } else {
                    return $this->json([
                        'success' => false,
                        'message' => 'Spécialisation non trouvée'
                    ], 404);
                }
            }

            // Upload de l'image et association à la formation
            $result = $formationService->uploadFormationImage($formation, $imageFile);
            if (!$result['success']) {
                return $this->json([
                    'success' => false,
                    'message' => $result['message']
                ], 500);
            }
            $formation->setImageUrl($result['data']['image_url']);

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
                        'capacity' => $formation->getCapacity(),
                        'duration' => $formation->getDuration(),
                        'dateStart' => $formation->getDateStart()->format('Y-m-d'),
                        'location' => $formation->getLocation(),
                        'image_url' => $formation->getImageUrl(),
                        'specialization' => $formation->getSpecialization() ? [
                            'id' => $formation->getSpecialization()->getId(),
                            'name' => $formation->getSpecialization()->getName()
                        ] : null
                    ]
                ]
            ], 201);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la formation : ' . $e->getMessage()
            ], 500);
        }
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
        if (isset($data['image_url'])) {
            $formation->setImageUrl($data['image_url']);
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
                    'image_url' => $formation->getImageUrl(),
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

    #[Route('/formations/{id}/image', name: 'api_formations_upload_image', methods: ['POST'])]
    public function uploadFormationImage(
        int $id,
        Request $request,
        FormationService $formationService
    ): JsonResponse {
        $formation = $this->formationRepository->find($id);

        if (!$formation) {
            return $this->json([
                'success' => false,
                'message' => 'Formation non trouvée'
            ], 404);
        }

        /** @var UploadedFile $file */
        $file = $request->files->get('image');
        if (!$file) {
            return $this->json([
                'success' => false,
                'message' => 'Aucun fichier image envoyé'
            ], 400);
        }

        $result = $formationService->uploadFormationImage($formation, $file);

        if (!$result['success']) {
            return $this->json([
                'success' => false,
                'message' => $result['message']
            ], 500);
        }

        return $this->json([
            'success' => true,
            'message' => $result['message'],
            'data' => [
                'image_url' => $result['data']['image_url']
            ]
        ]);
    }

    #[Route('/formations/{formationId}/students/{userId}', name: 'api_formations_remove_student', methods: ['DELETE'])]
    public function removeStudentFromFormation(int $formationId, int $userId): JsonResponse
    {
        $formation = $this->formationRepository->find($formationId);
        if (!$formation) {
            return $this->json([
                'success' => false,
                'message' => 'Formation non trouvée'
            ], 404);
        }

        $user = $this->entityManager->getRepository(\App\Entity\User::class)->find($userId);
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        // Remove all enrollment requests for this user and formation (by ID)
        $enrollmentRequests = $this->entityManager->getRepository(\App\Entity\FormationEnrollmentRequest::class)
            ->findBy(['user' => $user->getId(), 'formation' => $formation->getId()]);
        foreach ($enrollmentRequests as $request) {
            $this->entityManager->remove($request);
        }

        // Remove the user from the formation
        $formation->removeStudent($user);

        // Remove STUDENT role
        foreach ($user->getUserRoles() as $userRole) {
            if (strtoupper($userRole->getRole()->getName()) === 'STUDENT') {
                $user->removeUserRole($userRole);
                $this->entityManager->remove($userRole);
            }
        }

        // Add GUEST role if not present
        $hasGuest = false;
        foreach ($user->getUserRoles() as $userRole) {
            if (strtoupper($userRole->getRole()->getName()) === 'GUEST') {
                $hasGuest = true;
                break;
            }
        }
        if (!$hasGuest) {
            $guestRole = $this->entityManager->getRepository(\App\Entity\Role::class)->findOneBy(['name' => 'GUEST']);
            if ($guestRole) {
                $userRole = new \App\Entity\UserRole();
                $userRole->setUser($user);
                $userRole->setRole($guestRole);
                $user->addUserRole($userRole);
                $this->entityManager->persist($userRole);
            }
        }

        // Remove StudentProfile if exists
        $studentProfile = $this->studentProfileRepository->findByUserWithRelations($user->getId());
        if ($studentProfile) {
            $user->setStudentProfile(null); // Dissociate profile from user
            $this->entityManager->remove($studentProfile);
        }

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Étudiant retiré de la formation, profil supprimé et rôle mis à jour.'
        ]);
    }

    #[Route('/formations/{id}/available-students', name: 'api_formations_available_students', methods: ['GET'])]
    public function getAvailableStudents(int $id): JsonResponse
    {
        $formation = $this->formationRepository->find($id);
        if (!$formation) {
            return $this->json([
                'success' => false,
                'message' => 'Formation non trouvée'
            ], 404);
        }
        $qb = $this->entityManager->createQueryBuilder();
        $qb->select('u')
            ->from('App\\Entity\\User', 'u')
            ->leftJoin('u.formations', 'f')
            ->leftJoin('u.userRoles', 'ur')
            ->leftJoin('ur.role', 'r')
            ->where($qb->expr()->orX(
                $qb->expr()->eq('r.name', ':guest'),
                $qb->expr()->eq('r.name', ':student')
            ))
            ->andWhere($qb->expr()->orX(
                $qb->expr()->isNull('f.id'),
                $qb->expr()->neq('f.id', ':formationId')
            ))
            ->setParameter('guest', 'GUEST')
            ->setParameter('student', 'STUDENT')
            ->setParameter('formationId', $id);
        $users = $qb->getQuery()->getResult();
        // Filter out users already in the formation
        $users = array_filter($users, function($u) use ($formation) {
            return !$formation->getStudents()->contains($u);
        });
        $data = array_map(function($u) {
            return [
                'id' => $u->getId(),
                'firstName' => $u->getFirstName(),
                'lastName' => $u->getLastName(),
                'email' => $u->getEmail(),
            ];
        }, $users);
        return $this->json([
            'success' => true,
            'data' => $data
        ]);
    }

    #[Route('/formations/{id}/teacher-view', name: 'api_formations_teacher_view', methods: ['GET'])]
    #[IsGranted('ROLE_TEACHER')]
    public function getFormationForTeacher(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $formation = $this->formationRepository->find($id);
        if (!$formation) {
            return $this->json([
                'success' => false,
                'message' => 'Formation non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si le professeur est associé à cette formation
        $formationTeacher = $this->entityManager->getRepository(FormationTeacher::class)
            ->findOneBy(['formation' => $formation, 'user' => $user]);

        if (!$formationTeacher) {
            return $this->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à voir cette formation'
            ], Response::HTTP_FORBIDDEN);
        }

        $imageUrl = null;
        if ($formation->getImageUrl()) {
            $imageUrl = $formation->getImageUrl();
            if (!str_contains($imageUrl, 'bigproject-storage.s3')) {
                $imageUrl = $this->s3StorageService->getPresignedUrl($imageUrl);
            }
            $imageUrl = urldecode($imageUrl);
        }

        $data = [
            'id' => $formation->getId(),
            'name' => $formation->getName(),
            'promotion' => $formation->getPromotion(),
            'description' => $formation->getDescription(),
            'capacity' => $formation->getCapacity(),
            'dateStart' => $formation->getDateStart()->format('Y-m-d'),
            'location' => $formation->getLocation(),
            'duration' => $formation->getDuration(),
            'image_url' => $imageUrl,
            'isMainTeacher' => $formationTeacher->isMainTeacher(),
            'specialization' => $formation->getSpecialization() ? [
                'id' => $formation->getSpecialization()->getId(),
                'name' => $formation->getSpecialization()->getName()
            ] : null,
            'students' => array_map(function($student) {
                $profilePictureUrl = null;
                if ($student->getProfilePicturePath()) {
                    try {
                        $profilePictureUrl = $this->documentStorageFactory->getDocumentUrl($student->getProfilePicturePath());
                    } catch (\Exception $e) {
                        $profilePictureUrl = null;
                    }
                }
                return [
                    'id' => $student->getId(),
                    'firstName' => $student->getFirstName(),
                    'lastName' => $student->getLastName(),
                    'email' => $student->getEmail(),
                    'profilePictureUrl' => $profilePictureUrl
                ];
            }, $formation->getStudents()->toArray())
        ];

        return $this->json([
            'success' => true,
            'data' => $data
        ]);
    }

    #[Route('/formations/{formationId}/students/{userId}', name: 'api_formations_add_student', methods: ['POST'])]
    #[\Symfony\Bundle\SecurityBundle\Attribute\Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_RECRUITER')")]
    public function addStudentToFormation(int $formationId, int $userId): JsonResponse
    {
        $formation = $this->formationRepository->find($formationId);
        if (!$formation) {
            return $this->json([
                'success' => false,
                'message' => 'Formation non trouvée'
            ], 404);
        }
        $user = $this->entityManager->getRepository(\App\Entity\User::class)->find($userId);
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }
        // Remove GUEST role if present
        foreach ($user->getUserRoles() as $userRole) {
            if (strtoupper($userRole->getRole()->getName()) === 'GUEST') {
                $user->removeUserRole($userRole);
                $this->entityManager->remove($userRole);
            }
        }
        // Add user to formation if not already present
        if (!$formation->getStudents()->contains($user)) {
            $formation->addStudent($user);
        }
        // Add STUDENT role if not present
        $hasStudent = false;
        foreach ($user->getUserRoles() as $userRole) {
            if (strtoupper($userRole->getRole()->getName()) === 'STUDENT') {
                $hasStudent = true;
                break;
            }
        }
        if (!$hasStudent) {
            $studentRole = $this->entityManager->getRepository(\App\Entity\Role::class)->findOneBy(['name' => 'STUDENT']);
            if ($studentRole) {
                $userRole = new \App\Entity\UserRole();
                $userRole->setUser($user);
                $userRole->setRole($studentRole);
                $user->addUserRole($userRole);
                $this->entityManager->persist($userRole);
            }
        }
        $this->entityManager->flush();
        return $this->json([
            'success' => true,
            'message' => 'Utilisateur ajouté à la formation.'
        ]);
    }
} 