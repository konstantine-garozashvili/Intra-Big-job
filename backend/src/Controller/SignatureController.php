<?php

namespace App\Controller;

use App\Entity\Signature;
use App\Entity\Validation;
use App\Repository\SignatureRepository;
use App\Repository\ValidationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/signatures')]
class SignatureController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;
    private SignatureRepository $signatureRepository;
    private ValidationRepository $validationRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        SignatureRepository $signatureRepository,
        ValidationRepository $validationRepository
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->signatureRepository = $signatureRepository;
        $this->validationRepository = $validationRepository;
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            // Get the user from the token
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            // Get the request data
            $data = json_decode($request->getContent(), true);
            
            // Log the received data for debugging
            error_log('Received data: ' . print_r($data, true));
            
            // Validate required fields
            if (!isset($data['location']) || empty($data['location'])) {
                return $this->json(['message' => 'Location is required'], Response::HTTP_BAD_REQUEST);
            }
            
            // Create a new signature
            $signature = new Signature();
            $signature->setUser($user);
            $signature->setLocation($data['location']);
            $signature->setDate(new \DateTimeImmutable());
            $signature->setValidated(false);
            
            // Save to database
            $this->entityManager->persist($signature);
            $this->entityManager->flush();
            
            // Return success response
            return $this->json([
                'message' => 'Signature created successfully',
                'id' => $signature->getId(),
                'date' => $signature->getDate()->format('Y-m-d H:i:s')
            ], Response::HTTP_CREATED);
            
        } catch (\Exception $e) {
            // Log the error
            error_log('Error in SignatureController::create: ' . $e->getMessage());
            error_log($e->getTraceAsString());
            
            // Return error response
            return $this->json([
                'message' => 'Error creating signature: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user has ROLE_TEACHER to see all signatures
        $isTeacher = false;
        foreach ($user->getUserRoles() as $userRole) {
            if ($userRole->getRole()->getName() === 'ROLE_TEACHER') {
                $isTeacher = true;
                break;
            }
        }

        if ($isTeacher) {
            // Teachers see all recent signatures
            $signatures = $this->signatureRepository->findRecent();
        } else {
            // Students only see their own signatures
            $signatures = $this->signatureRepository->findByUser($user);
        }

        return $this->json([
            'signatures' => $this->serializer->normalize($signatures, null, ['groups' => 'signature:read'])
        ]);
    }

    #[Route('/unvalidated', methods: ['GET'])]
    public function listUnvalidated(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user has ROLE_TEACHER
        $isTeacher = false;
        foreach ($user->getUserRoles() as $userRole) {
            if ($userRole->getRole()->getName() === 'ROLE_TEACHER') {
                $isTeacher = true;
                break;
            }
        }

        if (!$isTeacher) {
            return $this->json(['message' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $signatures = $this->signatureRepository->findUnvalidated();

        return $this->json([
            'signatures' => $this->serializer->normalize($signatures, null, ['groups' => 'signature:read'])
        ]);
    }

    #[Route('/{id}/validate', methods: ['POST'])]
    public function validate(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Check if user has ROLE_TEACHER
        $isTeacher = false;
        foreach ($user->getUserRoles() as $userRole) {
            if ($userRole->getRole()->getName() === 'ROLE_TEACHER') {
                $isTeacher = true;
                break;
            }
        }

        if (!$isTeacher) {
            return $this->json(['message' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $signature = $this->signatureRepository->find($id);
        if (!$signature) {
            return $this->json(['message' => 'Signature not found'], Response::HTTP_NOT_FOUND);
        }

        // Create validation record
        $validation = new Validation();
        $validation->setSignature($signature);
        $validation->setValidator($user);
        
        // Update signature status
        $signature->setValidated(true);
        
        $this->entityManager->persist($validation);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Signature validated successfully',
            'signature' => $this->serializer->normalize($signature, null, ['groups' => 'signature:read']),
            'validation' => $this->serializer->normalize($validation, null, ['groups' => 'validation:read'])
        ]);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $signature = $this->signatureRepository->find($id);
        if (!$signature) {
            return $this->json(['message' => 'Signature not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if user is the owner or a teacher
        $isTeacher = false;
        foreach ($user->getUserRoles() as $userRole) {
            if ($userRole->getRole()->getName() === 'ROLE_TEACHER') {
                $isTeacher = true;
                break;
            }
        }

        if ($signature->getUser() !== $user && !$isTeacher) {
            return $this->json(['message' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        return $this->json([
            'signature' => $this->serializer->normalize($signature, null, ['groups' => 'signature:read']),
            'validations' => $this->serializer->normalize(
                $this->validationRepository->findBySignature($signature),
                null,
                ['groups' => 'validation:read']
            )
        ]);
    }

    #[Route('/today', methods: ['GET'])]
    public function checkTodaySignature(): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            // Get today's date (start and end of day)
            $today = new \DateTimeImmutable('today');
            $tomorrow = $today->modify('+1 day');

            // Check if the user has already signed in today
            $signature = $this->signatureRepository->createQueryBuilder('s')
                ->where('s.user = :user')
                ->andWhere('s.date >= :today')
                ->andWhere('s.date < :tomorrow')
                ->setParameter('user', $user)
                ->setParameter('today', $today)
                ->setParameter('tomorrow', $tomorrow)
                ->getQuery()
                ->getOneOrNullResult();

            return $this->json([
                'hasSigned' => $signature !== null,
                'date' => $signature ? $signature->getDate()->format('Y-m-d H:i:s') : null
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Error checking today\'s signature: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/test', methods: ['GET'])]
    public function testSignatureEndpoint(): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            // Get database connection
            $conn = $this->entityManager->getConnection();
            
            // Test the connection
            $connectionStatus = $conn->isConnected() ? 'Connected' : 'Not connected';
            
            // Get table structure
            $tableStructure = [];
            try {
                $stmt = $conn->prepare("DESCRIBE signature");
                $resultSet = $stmt->executeQuery();
                $tableStructure = $resultSet->fetchAllAssociative();
            } catch (\Exception $e) {
                $tableStructure = ['error' => $e->getMessage()];
            }
            
            // Get a count of signatures
            $signatureCount = $this->signatureRepository->count([]);
            
            // Return test information
            return $this->json([
                'status' => 'success',
                'database' => [
                    'connection' => $connectionStatus,
                    'table_structure' => $tableStructure,
                    'signature_count' => $signatureCount
                ],
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail()
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'status' => 'error',
                'message' => 'Test failed: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
