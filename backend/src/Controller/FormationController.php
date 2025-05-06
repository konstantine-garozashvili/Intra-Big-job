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
use Symfony\Bundle\SecurityBundle\Security;

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
        private readonly Security $security
    ) {
    }

    #[Route('/formations', name: 'api_formations_list', methods: ['GET'])]
    public function getAllFormations(): JsonResponse
    {
        $formations = $this->formationRepository->findAll();
        
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
                    return [
                        'id' => $student->getId(),
                        'firstName' => $student->getFirstName(),
                        'lastName' => $student->getLastName()
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
                return [
                    'id' => $student->getId(),
                    'firstName' => $student->getFirstName(),
                    'lastName' => $student->getLastName(),
                    'email' => $student->getEmail()
                ];
            }, $formation->getStudents()->toArray())
        ];

        return $this->json([
            'success' => true,
            'data' => $data
        ]);
    }
} 