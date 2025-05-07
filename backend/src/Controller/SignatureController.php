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
    
    /**
     * Get the date range for the current week
     * @return array with 'start' and 'end' keys containing DateTimeImmutable objects
     */
    private function getWeekDateRange(\DateTimeImmutable $referenceDate = null): array
    {
        $timezone = new \DateTimeZone('Europe/Paris');
        if (!$referenceDate) {
            $referenceDate = new \DateTimeImmutable('now', $timezone);
        }
        
        return [
            'start' => new \DateTimeImmutable('monday this week', $timezone),
            'end' => new \DateTimeImmutable('monday next week', $timezone)
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

    #[Route('/weekly', methods: ['GET'])]
    public function getWeeklyHistory(Request $request): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Get current week's date range
            $dateRange = $this->getWeekDateRange();
            $weekStart = $dateRange['start'];
            $weekEnd = $dateRange['end'];
            
            // Log the time values for debugging
            error_log('Week start: ' . $weekStart->format('Y-m-d H:i:s'));
            error_log('Week end: ' . $weekEnd->format('Y-m-d H:i:s'));
            
            // Get all signatures for the week
            $signatures = $this->signatureRepository->findWeeklyByUser($user, $weekStart);
            
            error_log('Found ' . count($signatures) . ' signatures for the week');
            
            // Serialize signatures properly
            $serializedSignatures = json_decode($this->serializer->serialize($signatures, 'json', ['groups' => 'signature:read']), true);
            
            // Organize signatures by date and period
            $signaturesByDate = [];
            $currentDate = clone $weekStart;
            
            // Initialize the structure with all weekdays
            while ($currentDate < $weekEnd) {
                $dateKey = $currentDate->format('Y-m-d');
                $signaturesByDate[$dateKey] = [
                    'date' => $dateKey,
                    'dayName' => $currentDate->format('l'), // Day name (Monday, Tuesday, etc.)
                    'signatures' => [
                        Signature::PERIOD_MORNING => null,
                        Signature::PERIOD_AFTERNOON => null
                    ]
                ];
                $currentDate = $currentDate->modify('+1 day');
            }
            
            // Fill in actual signatures
            foreach ($serializedSignatures as $signature) {
                $signatureDate = substr($signature['date'], 0, 10); // Extract YYYY-MM-DD
                $period = $signature['period'];
                
                if (isset($signaturesByDate[$signatureDate])) {
                    $signaturesByDate[$signatureDate]['signatures'][$period] = $signature;
                }
            }
            
            return $this->json([
                'success' => true,
                'weekStart' => $weekStart->format('Y-m-d'),
                'weekEnd' => $weekEnd->format('Y-m-d'),
                'availablePeriods' => Signature::getAvailablePeriods(),
                'signaturesByDate' => array_values($signaturesByDate) // Convert to indexed array
            ]);
        } catch (\Exception $e) {
            error_log('Error in getWeeklyHistory: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Error retrieving weekly signature history: ' . $e->getMessage()
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

    #[Route('/absences/formation/{formationId}', methods: ['GET'])]
    public function getAbsencesByFormation(int $formationId, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        // Seuls les enseignants peuvent accéder à cette route
        if (!in_array('ROLE_TEACHER', $user->getRoles())) {
            return $this->json(['message' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $date = $request->query->get('date'); // format YYYY-MM-DD
        $period = $request->query->get('period'); // morning/afternoon
        if (!$date) {
            $date = (new \DateTimeImmutable('now', new \DateTimeZone('Europe/Paris')))->format('Y-m-d');
        }
        if (!in_array($period, [Signature::PERIOD_MORNING, Signature::PERIOD_AFTERNOON], true)) {
            $period = Signature::PERIOD_MORNING;
        }

        // Récupérer la formation et les étudiants
        $formation = $this->entityManager->getRepository(\App\Entity\Formation::class)->find($formationId);
        if (!$formation) {
            return $this->json(['message' => 'Formation not found'], Response::HTTP_NOT_FOUND);
        }
        $students = $formation->getStudents();

        // Récupérer les signatures pour cette date/période
        $start = new \DateTimeImmutable($date . ' 00:00:00', new \DateTimeZone('Europe/Paris'));
        $end = $start->modify('+1 day');
        $signatures = $this->signatureRepository->createQueryBuilder('s')
            ->where('s.date >= :start')
            ->andWhere('s.date < :end')
            ->andWhere('s.period = :period')
            ->andWhere('s.user IN (:students)')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->setParameter('period', $period)
            ->setParameter('students', $students)
            ->getQuery()
            ->getResult();
        $signedUserIds = array_map(fn($s) => $s->getUser()->getId(), $signatures);

        // Les absents sont les étudiants sans signature pour cette période/date
        $absents = [];
        foreach ($students as $student) {
            if (!in_array($student->getId(), $signedUserIds)) {
                $absents[] = [
                    'id' => $student->getId(),
                    'firstName' => $student->getFirstName(),
                    'lastName' => $student->getLastName(),
                    'email' => $student->getEmail(),
                ];
            }
        }
        return $this->json([
            'success' => true,
            'formationId' => $formationId,
            'date' => $date,
            'period' => $period,
            'absents' => $absents,
            'absentCount' => count($absents),
            'studentCount' => count($students),
        ]);
    }

    #[Route('/absences/user/{userId}', methods: ['GET'])]
    public function getAbsencesByUser(int $userId, Request $request): JsonResponse
    {
        $currentUser = $this->getUser();
        if (!$currentUser) {
            return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }
        $isTeacher = in_array('ROLE_TEACHER', $currentUser->getRoles());
        $isStudent = in_array('ROLE_STUDENT', $currentUser->getRoles());

        // L'utilisateur peut voir ses propres absences
        if ($currentUser->getId() !== $userId && !$isTeacher) {
            return $this->json(['message' => 'Access denied'], Response::HTTP_FORBIDDEN);
        }

        $date = $request->query->get('date'); // format YYYY-MM-DD
        $period = $request->query->get('period'); // morning/afternoon
        $formationId = $request->query->get('formationId'); // optionnel
        if ($date && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return $this->json(['message' => 'Invalid date format'], Response::HTTP_BAD_REQUEST);
        }
        if ($period && !in_array($period, [Signature::PERIOD_MORNING, Signature::PERIOD_AFTERNOON], true)) {
            return $this->json(['message' => 'Invalid period'], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer l'utilisateur cible
        $user = $this->entityManager->getRepository(\App\Entity\User::class)->find($userId);
        if (!$user) {
            return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        // Si teacher, vérifier qu'il est responsable d'une formation où l'élève est inscrit
        if ($isTeacher && $currentUser->getId() !== $userId) {
            $formations = $this->entityManager->getRepository(\App\Entity\Formation::class)
                ->createQueryBuilder('f')
                ->leftJoin('f.students', 's')
                ->leftJoin('f.formationTeachers', 'ft')
                ->where('s.id = :studentId')
                ->andWhere('ft.user = :teacherId')
                ->setParameter('studentId', $userId)
                ->setParameter('teacherId', $currentUser->getId())
                ->getQuery()
                ->getResult();
            if (empty($formations)) {
                return $this->json(['message' => 'Access denied: not responsible for this student'], Response::HTTP_FORBIDDEN);
            }
        }

        // Récupérer les formations concernées
        $formationRepo = $this->entityManager->getRepository(\App\Entity\Formation::class);
        $formations = [];
        if ($formationId) {
            $formation = $formationRepo->find($formationId);
            if (!$formation) {
                return $this->json(['message' => 'Formation not found'], Response::HTTP_NOT_FOUND);
            }
            if (!$formation->getStudents()->contains($user)) {
                return $this->json(['message' => 'User is not a student of this formation'], Response::HTTP_FORBIDDEN);
            }
            $formations = [$formation];
        } else {
            // Toutes les formations où l'utilisateur est étudiant
            $formations = $user->getFormations();
        }

        $absences = [];
        foreach ($formations as $formation) {
            // Pour chaque jour de la formation (on prend la période demandée ou les deux)
            $dateStart = $formation->getDateStart();
            $duration = $formation->getDuration();
            for ($i = 0; $i < $duration; $i++) {
                $currentDate = (clone $dateStart)->modify("+{$i} days");
                $dateStr = $currentDate->format('Y-m-d');
                if ($date && $dateStr !== $date) continue;
                $periods = $period ? [$period] : [Signature::PERIOD_MORNING, Signature::PERIOD_AFTERNOON];
                foreach ($periods as $p) {
                    // Signature présente ?
                    $start = new \DateTimeImmutable($dateStr . ' 00:00:00', new \DateTimeZone('Europe/Paris'));
                    $end = $start->modify('+1 day');
                    $signature = $this->signatureRepository->createQueryBuilder('s')
                        ->where('s.user = :user')
                        ->andWhere('s.date >= :start')
                        ->andWhere('s.date < :end')
                        ->andWhere('s.period = :period')
                        ->setParameter('user', $user)
                        ->setParameter('start', $start)
                        ->setParameter('end', $end)
                        ->setParameter('period', $p)
                        ->getQuery()
                        ->getOneOrNullResult();
                    if (!$signature) {
                        $absences[] = [
                            'date' => $dateStr,
                            'period' => $p,
                            'formationId' => $formation->getId(),
                            'formationName' => $formation->getName(),
                        ];
                    }
                }
            }
        }
        return $this->json([
            'success' => true,
            'userId' => $userId,
            'absences' => $absences,
            'absenceCount' => count($absences),
        ]);
    }
}
