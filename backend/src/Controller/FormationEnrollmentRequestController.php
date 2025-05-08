<?php

namespace App\Controller;

use App\Entity\Formation;
use App\Entity\FormationEnrollmentRequest;
use App\Entity\Role;
use App\Entity\UserRole;
use App\Repository\FormationRepository;
use App\Domains\Global\Repository\RoleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Domains\Student\Service\StudentProfileService;
use App\Service\DocumentStorageFactory;
use Symfony\Component\HttpClient\NativeHttpClient;

#[Route('/api')]
class FormationEnrollmentRequestController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private FormationRepository $formationRepository;
    private RoleRepository $roleRepository;
    private StudentProfileService $studentProfileService;
    private DocumentStorageFactory $documentStorageFactory;

    public function __construct(
        EntityManagerInterface $entityManager,
        FormationRepository $formationRepository,
        RoleRepository $roleRepository,
        StudentProfileService $studentProfileService,
        DocumentStorageFactory $documentStorageFactory
    ) {
        $this->entityManager = $entityManager;
        $this->formationRepository = $formationRepository;
        $this->roleRepository = $roleRepository;
        $this->studentProfileService = $studentProfileService;
        $this->documentStorageFactory = $documentStorageFactory;
    }

    #[Route('/formations/{id}/enroll', methods: ['POST'])]
    #[Route('/formations/{id}/enrollment-request', methods: ['POST'])]
    #[IsGranted('ROLE_GUEST')]
    public function createEnrollmentRequest(Formation $formation): Response
    {
        $user = $this->getUser();
        
        // Vérifier si le profil est complété
        if (!$user->isProfileCompletionAcknowledged()) {
            return $this->json([
                'message' => 'Vous devez compléter votre profil avant de faire une demande'
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si une demande existe déjà
        $existingRequest = $this->entityManager->getRepository(FormationEnrollmentRequest::class)
            ->findOneBy([
                'user' => $user,
                'formation' => $formation,
                'status' => null
            ]);

        if ($existingRequest) {
            return $this->json([
                'message' => 'Une demande est déjà en cours pour cette formation'
            ], Response::HTTP_CONFLICT);
        }

        $enrollmentRequest = new FormationEnrollmentRequest();
        $enrollmentRequest->setUser($user);
        $enrollmentRequest->setFormation($formation);

        $this->entityManager->persist($enrollmentRequest);
        $this->entityManager->flush();

        // Notifier tous les recruteurs via Firestore
        try {
            $recruiters = $this->entityManager->getRepository(\App\Entity\User::class)
                ->findByRoleWithRelations('RECRUITER');
            $formationName = $formation->getName();
            $firebaseUrl = $this->getParameter('firebase_database_url') ?? 'https://firestore.googleapis.com/v1/projects/bigproject-d6daf/databases/(default)/documents';
            $client = new NativeHttpClient();
            foreach ($recruiters as $recruiter) {
                $userId = (string)$recruiter->getId();
                // Vérifier la préférence Firestore du recruteur
                $prefUrl = $firebaseUrl . '/notificationPreferences/' . $userId;
                $prefResp = $client->request('GET', $prefUrl, [
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ]
                ]);
                $prefData = json_decode($prefResp->getContent(false), true);
                $fields = $prefData['fields'] ?? [];
                if (isset($fields['GUEST_APPLICATION']['booleanValue']) && $fields['GUEST_APPLICATION']['booleanValue'] === false) {
                    // Préférence désactivée, on skip
                    continue;
                }
                $notificationData = [
                    'fields' => [
                        'recipientId' => ['stringValue' => $userId],
                        'title' => ['stringValue' => "Nouvelle demande d'inscription invité"],
                        'message' => ['stringValue' => "Un invité a demandé à rejoindre la formation $formationName."],
                        'type' => ['stringValue' => 'GUEST_APPLICATION'],
                        'timestamp' => ['timestampValue' => (new \DateTime())->format(\DateTime::RFC3339)],
                        'read' => ['booleanValue' => false],
                        'targetUrl' => ['stringValue' => '/recruiter/enrollment-requests'],
                        'source' => ['stringValue' => 'backend'],
                        'appVersion' => ['stringValue' => '1.0']
                    ]
                ];
                $client->request('POST', $firebaseUrl . '/notifications', [
                    'json' => $notificationData,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ]
                ]);
            }
        } catch (\Exception $e) {
            // Log mais ne bloque pas la création
            if (method_exists($this, 'getLogger') && $this->getLogger()) {
                $this->getLogger()->error('Erreur envoi notification Firestore: ' . $e->getMessage());
            }
        }

        return $this->json([
            'message' => 'Demande d\'inscription créée avec succès',
            'id' => $enrollmentRequest->getId()
        ], Response::HTTP_CREATED);
    }

    #[Route('/formation-requests', methods: ['GET'])]
    #[IsGranted('ROLE_RECRUITER')]
    public function listEnrollmentRequests(): Response
    {
        $requests = $this->entityManager->getRepository(FormationEnrollmentRequest::class)
            ->findBy(['status' => null]);

        return $this->json([
            'requests' => array_map(function($request) {
                $profilePictureUrl = null;
                $profilePicturePath = $request->getUser()->getProfilePicturePath();
                if ($profilePicturePath) {
                    try {
                        $profilePictureUrl = $this->documentStorageFactory->getDocumentUrl($profilePicturePath);
                    } catch (\Exception $e) {
                        $profilePictureUrl = null;
                    }
                }
                return [
                    'id' => $request->getId(),
                    'formation' => [
                        'id' => $request->getFormation()->getId(),
                        'name' => $request->getFormation()->getName()
                    ],
                    'user' => [
                        'id' => $request->getUser()->getId(),
                        'email' => $request->getUser()->getEmail(),
                        'firstName' => $request->getUser()->getFirstName(),
                        'lastName' => $request->getUser()->getLastName(),
                        'profilePictureUrl' => $profilePictureUrl
                    ],
                    'createdAt' => $request->getCreatedAt()->format('Y-m-d H:i:s')
                ];
            }, $requests)
        ]);
    }

    #[Route('/formation-requests/{id}', methods: ['PATCH'])]
    #[IsGranted('ROLE_RECRUITER')]
    public function processEnrollmentRequest(
        FormationEnrollmentRequest $request,
        Request $httpRequest
    ): Response {
        $content = json_decode($httpRequest->getContent(), true);
        
        if (!isset($content['status'])) {
            return $this->json([
                'message' => 'Le statut est requis'
            ], Response::HTTP_BAD_REQUEST);
        }

        $status = $content['status'];
        $comment = $content['comment'] ?? null;

        $request->setStatus($status);
        $request->setComment($comment);
        $request->setReviewedBy($this->getUser());

        $user = $request->getUser();
        $formation = $request->getFormation();

        if ($status === true) {
            // Remove GUEST role
            foreach ($user->getUserRoles() as $userRole) {
                if ($userRole->getRole()->getName() === 'GUEST') {
                    $user->removeUserRole($userRole);
                    $this->entityManager->remove($userRole);
                }
            }

            // Add STUDENT role
            $studentRole = $this->roleRepository->findOneBy(['name' => 'STUDENT']);
            if ($studentRole) {
                $userRole = new UserRole();
                $userRole->setUser($user);
                $userRole->setRole($studentRole);
                $user->addUserRole($userRole);
                $this->entityManager->persist($userRole);
            }

            // Add user to formation
            $formation->addStudent($user);

            // Create student profile if not exists
            $this->studentProfileService->createProfileForUser($user);
        }

        $this->entityManager->flush();

        // Notifier le guest de la décision (accepté/refusé)
        try {
            $firebaseUrl = $this->getParameter('firebase_database_url') ?? 'https://firestore.googleapis.com/v1/projects/bigproject-d6daf/databases/(default)/documents';
            $client = new \Symfony\Component\HttpClient\NativeHttpClient();
            $userId = (string)$user->getId();
            $notifTitle = $status ? "Votre demande d'inscription a été acceptée" : "Votre demande d'inscription a été refusée";
            $notifMsg = $status
                ? "Votre demande pour rejoindre la formation '" . $formation->getName() . "' a été acceptée." 
                : "Votre demande pour rejoindre la formation '" . $formation->getName() . "' a été refusée.";
            if ($comment) {
                $notifMsg .= "\nCommentaire du recruteur : " . $comment;
            }
            $notificationData = [
                'fields' => [
                    'recipientId' => ['stringValue' => $userId],
                    'title' => ['stringValue' => $notifTitle],
                    'message' => ['stringValue' => $notifMsg],
                    'type' => ['stringValue' => 'INFO'],
                    'timestamp' => ['timestampValue' => (new \DateTime())->format(\DateTime::RFC3339)],
                    'read' => ['booleanValue' => false],
                    'targetUrl' => ['stringValue' => '/formations'],
                    'source' => ['stringValue' => 'backend'],
                    'appVersion' => ['stringValue' => '1.0']
                ]
            ];
            $client->request('POST', $firebaseUrl . '/notifications', [
                'json' => $notificationData,
                'headers' => [
                    'Content-Type' => 'application/json',
                ]
            ]);
        } catch (\Exception $e) {
            // Log mais ne bloque pas la suite
            if (method_exists($this, 'getLogger') && $this->getLogger()) {
                $this->getLogger()->error('Erreur envoi notification Firestore (guest): ' . $e->getMessage());
            }
        }

        return $this->json([
            'message' => $status ? 'Demande acceptée' : 'Demande refusée'
        ]);
    }

    #[Route('/formation-requests/my', methods: ['GET'])]
    #[IsGranted('ROLE_GUEST')]
    public function getMyRequests(): Response
    {
        $user = $this->getUser();
        $requests = $this->entityManager->getRepository(FormationEnrollmentRequest::class)
            ->findBy(['user' => $user], ['createdAt' => 'DESC']);

        return $this->json([
            'requests' => array_map(function($request) {
                return [
                    'id' => $request->getId(),
                    'formation' => [
                        'id' => $request->getFormation()->getId(),
                        'name' => $request->getFormation()->getName()
                    ],
                    'status' => $request->getStatus(),
                    'comment' => $request->getComment(),
                    'createdAt' => $request->getCreatedAt()->format('Y-m-d H:i:s'),
                    'reviewedBy' => $request->getReviewedBy() ? [
                        'id' => $request->getReviewedBy()->getId(),
                        'firstName' => $request->getReviewedBy()->getFirstName(),
                        'lastName' => $request->getReviewedBy()->getLastName()
                    ] : null
                ];
            }, $requests)
        ]);
    }

    #[Route('/formation-requests/{id}', methods: ['DELETE'])]
    #[IsGranted('ROLE_RECRUITER')]
    public function deleteEnrollmentRequest(FormationEnrollmentRequest $request): Response
    {
        $this->entityManager->remove($request);
        $this->entityManager->flush();

        return $this->json(['message' => 'Demande supprimée'], Response::HTTP_NO_CONTENT);
    }

    #[Route('/formation-requests/{id}/cancel', methods: ['DELETE'])]
    #[IsGranted('ROLE_GUEST')]
    public function cancelEnrollmentRequest(FormationEnrollmentRequest $request): Response
    {
        $user = $this->getUser();
        
        // Check if the request belongs to the current user
        if ($request->getUser()->getId() !== $user->getId()) {
            return $this->json([
                'message' => 'Vous n\'êtes pas autorisé à annuler cette demande'
            ], Response::HTTP_FORBIDDEN);
        }

        // Only allow cancellation of pending requests
        if ($request->getStatus() !== null) {
            return $this->json([
                'message' => 'Seules les demandes en attente peuvent être annulées'
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->remove($request);
        $this->entityManager->flush();

        return $this->json(['message' => 'Demande annulée avec succès'], Response::HTTP_OK);
    }

    #[Route('/formations/{id}/enrollment-requests', methods: ['GET'])]
    #[\Symfony\Bundle\SecurityBundle\Attribute\Security("is_granted('ROLE_ADMIN') or is_granted('ROLE_RECRUITER')")]
    public function getEnrollmentRequestsForFormation(Formation $formation, Request $request): Response
    {
        $statusParam = $request->query->get('status');
        $repo = $this->entityManager->getRepository(FormationEnrollmentRequest::class);
        $criteria = ['formation' => $formation];
        if ($statusParam === 'accepted') {
            $criteria['status'] = true;
        } elseif ($statusParam === 'pending') {
            $criteria['status'] = null;
        } elseif ($statusParam === 'rejected') {
            $criteria['status'] = false;
        }
        $requests = $repo->findBy($criteria);
        return $this->json(array_map(function($request) {
            return [
                'id' => $request->getId(),
                'user' => [
                    'id' => $request->getUser()->getId(),
                    'firstName' => $request->getUser()->getFirstName(),
                    'lastName' => $request->getUser()->getLastName(),
                    'email' => $request->getUser()->getEmail(),
                ],
                'status' => $request->getStatus(),
                'createdAt' => $request->getCreatedAt()?->format('Y-m-d H:i:s'),
                'comment' => $request->getComment(),
            ];
        }, $requests));
    }
}