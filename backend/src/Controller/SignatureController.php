<?php

namespace App\Controller;

use App\Entity\Signature;
use App\Repository\SignatureRepository;
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

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        SignatureRepository $signatureRepository
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->signatureRepository = $signatureRepository;
    }

    private function getCurrentTime(): \DateTimeImmutable
    {
        return new \DateTimeImmutable('now', new \DateTimeZone('Europe/Paris'));
    }
    
    /**
     * Get the date range for today (from start of day to start of tomorrow)
     * @return array with 'start' and 'end' keys containing DateTimeImmutable objects
     */
    private function getTodayDateRange(): array
    {
        $timezone = new \DateTimeZone('Europe/Paris');
        return [
            'start' => new \DateTimeImmutable('today', $timezone),
            'end' => new \DateTimeImmutable('tomorrow', $timezone)
        ];
    }

    #[Route('/today', methods: ['GET'])]
    public function checkTodaySignature(): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            // Get today's date range and current time
            $currentTime = $this->getCurrentTime();
            $dateRange = $this->getTodayDateRange();
            $today = $dateRange['start'];
            $tomorrow = $dateRange['end'];

            // Log the time values for debugging
            error_log('Current time (Paris): ' . $currentTime->format('Y-m-d H:i:s'));
            error_log('Today start: ' . $today->format('Y-m-d H:i:s'));
            error_log('Tomorrow start: ' . $tomorrow->format('Y-m-d H:i:s'));

            // Get current time to determine period
            $hour = (int)$currentTime->format('H');
            error_log('Current hour: ' . $hour);
            
            $period = null;
            if ($hour >= 9 && $hour < 12) {
                $period = Signature::PERIOD_MORNING;
            } elseif ($hour >= 13 && $hour < 17) {
                $period = Signature::PERIOD_AFTERNOON;
            }
            error_log('Determined period: ' . ($period ?? 'null'));

            // Get all signatures for today
            $signatures = $this->signatureRepository->createQueryBuilder('s')
                ->where('s.user = :user')
                ->andWhere('s.date >= :today')
                ->andWhere('s.date < :tomorrow')
                ->setParameter('user', $user)
                ->setParameter('today', $today)
                ->setParameter('tomorrow', $tomorrow)
                ->getQuery()
                ->getResult();

            error_log('Found ' . count($signatures) . ' signatures for today');

            // Check which periods have been signed
            $signedPeriods = array_map(function($sig) {
                return $sig->getPeriod();
            }, $signatures);

            error_log('Signed periods: ' . implode(', ', $signedPeriods));

            // Serialize signatures properly
            $serializedSignatures = json_decode($this->serializer->serialize($signatures, 'json', ['groups' => 'signature:read']), true);

            return $this->json([
                'currentPeriod' => $period,
                'signedPeriods' => $signedPeriods,
                'availablePeriods' => Signature::getAvailablePeriods(),
                'signatures' => $serializedSignatures
            ]);
        } catch (\Exception $e) {
            error_log('Error in checkTodaySignature: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Error checking today\'s signature: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            $signature = $this->signatureRepository->find($id);
            if (!$signature) {
                return $this->json(['message' => 'Signature not found'], Response::HTTP_NOT_FOUND);
            }

            // Check if user is the owner or a teacher
            $isTeacher = in_array('ROLE_TEACHER', $user->getRoles());

            if ($signature->getUser() !== $user && !$isTeacher) {
                return $this->json(['message' => 'Access denied'], Response::HTTP_FORBIDDEN);
            }

            $serializedSignature = json_decode($this->serializer->serialize($signature, 'json', ['groups' => 'signature:read']), true);

            return $this->json([
                'success' => true,
                'signature' => $serializedSignature
            ]);
        } catch (\Exception $e) {
            error_log('Error in show: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Error retrieving signature: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            // Check if user has ROLE_TEACHER to see all signatures
            $isTeacher = in_array('ROLE_TEACHER', $user->getRoles());

            if ($isTeacher) {
                // Teachers see all recent signatures
                $signatures = $this->signatureRepository->findRecent();
            } else {
                // Students only see their own signatures
                $signatures = $this->signatureRepository->findByUser($user);
            }

            $serializedSignatures = json_decode($this->serializer->serialize($signatures, 'json', ['groups' => 'signature:read']), true);

            return $this->json([
                'success' => true,
                'signatures' => $serializedSignatures
            ]);
        } catch (\Exception $e) {
            error_log('Error in list: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Error retrieving signatures: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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

            // Determine the current period based on time (using Paris timezone)
            $currentTime = $this->getCurrentTime();
            $hour = (int)$currentTime->format('H');
            
            if ($hour >= 9 && $hour < 12) {
                $period = Signature::PERIOD_MORNING;
            } elseif ($hour >= 13 && $hour < 17) {
                $period = Signature::PERIOD_AFTERNOON;
            } else {
                return $this->json([
                    'message' => 'Signatures are only allowed between 9h-12h (morning) and 13h-17h (afternoon)'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Get today's date range
            $dateRange = $this->getTodayDateRange();
            $startOfDay = $dateRange['start'];
            $endOfDay = $dateRange['end'];
            
            // Log the time values for debugging
            error_log('Checking for existing signatures between: ' . $startOfDay->format('Y-m-d H:i:s') . ' and ' . $endOfDay->format('Y-m-d H:i:s'));
            error_log('For user ID: ' . $user->getId() . ' and period: ' . $period);
            
            // Check if user has already signed for this period today
            $existingSignature = $this->signatureRepository->createQueryBuilder('s')
                ->where('s.user = :user')
                ->andWhere('s.date >= :today')
                ->andWhere('s.date < :tomorrow')
                ->andWhere('s.period = :period')
                ->setParameter('user', $user)
                ->setParameter('today', $startOfDay)
                ->setParameter('tomorrow', $endOfDay)
                ->setParameter('period', $period)
                ->getQuery()
                ->getOneOrNullResult();
                
            if ($existingSignature) {
                error_log('Found existing signature ID: ' . $existingSignature->getId());
                return $this->json([
                    'message' => 'You have already signed for the ' . $period . ' period today'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            // Create a new signature
            $signature = new Signature();
            $signature->setUser($user);
            $signature->setLocation($data['location']);
            $signature->setDate($currentTime);
            $signature->setPeriod($period);
            
            // Set the drawing if provided
            if (isset($data['drawing'])) {
                $signature->setDrawing($data['drawing']);
            }
            
            // Save to database
            $this->entityManager->persist($signature);
            $this->entityManager->flush();
            
            // Return success response
            return $this->json([
                'success' => true,
                'message' => 'Signature created successfully',
                'id' => $signature->getId(),
                'date' => $signature->getDate()->format('Y-m-d H:i:s'),
                'period' => $signature->getPeriod(),
                'drawing' => $signature->getDrawing()
            ], Response::HTTP_CREATED);
            
        } catch (\Exception $e) {
            // Log the error
            error_log('Error in SignatureController::create: ' . $e->getMessage());
            error_log($e->getTraceAsString());
            
            // Return error response
            return $this->json([
                'success' => false,
                'message' => 'Error creating signature: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/validate', methods: ['POST'])]
    public function validate(int $id): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            // Check if user is a teacher
            $isTeacher = in_array('ROLE_TEACHER', $user->getRoles());
            if (!$isTeacher) {
                return $this->json(['message' => 'Only teachers can validate signatures'], Response::HTTP_FORBIDDEN);
            }

            $signature = $this->signatureRepository->find($id);
            if (!$signature) {
                return $this->json(['message' => 'Signature not found'], Response::HTTP_NOT_FOUND);
            }

            // Set the signature as validated
            $signature->setValidated(true);
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Signature validated successfully'
            ]);
        } catch (\Exception $e) {
            error_log('Error in validate: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Error validating signature: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
