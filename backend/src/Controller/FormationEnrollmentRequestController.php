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

#[Route('/api')]
class FormationEnrollmentRequestController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private FormationRepository $formationRepository,
        private RoleRepository $roleRepository
    ) {}

    #[Route('/formations/{id}/enroll', methods: ['POST'])]
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
                        'lastName' => $request->getUser()->getLastName()
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

        if ($status === true) {
            $formation = $request->getFormation();
            $user = $request->getUser();

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
        }

        $this->entityManager->flush();

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
}