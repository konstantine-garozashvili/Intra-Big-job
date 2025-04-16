<?php

namespace App\Controller;

use App\Entity\Signature;
use App\Entity\User;
use App\Repository\SignatureRepository;
use App\Repository\UserRepository;
use App\Domains\Global\Notification\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/signature-reminders')]
class SignatureReminderController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private SignatureRepository $signatureRepository;
    private UserRepository $userRepository;
    private NotificationService $notificationService;

    public function __construct(
        EntityManagerInterface $entityManager,
        SignatureRepository $signatureRepository,
        UserRepository $userRepository,
        NotificationService $notificationService
    ) {
        $this->entityManager = $entityManager;
        $this->signatureRepository = $signatureRepository;
        $this->userRepository = $userRepository;
        $this->notificationService = $notificationService;
    }

    private function getCurrentTime(): \DateTimeImmutable
    {
        return new \DateTimeImmutable('now', new \DateTimeZone('Europe/Paris'));
    }
    
    private function getTodayDateRange(): array
    {
        $timezone = new \DateTimeZone('Europe/Paris');
        return [
            'start' => new \DateTimeImmutable('today', $timezone),
            'end' => new \DateTimeImmutable('tomorrow', $timezone)
        ];
    }

    /**
     * Send reminders to users who haven't signed for the current period
     */
    #[Route('/send', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function sendReminders(Request $request): JsonResponse
    {
        try {
            // Obtenir la période actuelle basée sur l'heure
            $currentTime = $this->getCurrentTime();
            $hour = (int)$currentTime->format('H');
            
            $period = null;
            if ($hour >= 9 && $hour < 12) {
                $period = Signature::PERIOD_MORNING;
            } elseif ($hour >= 13 && $hour < 17) {
                $period = Signature::PERIOD_AFTERNOON;
            } else {
                return $this->json([
                    'success' => false,
                    'message' => 'Les rappels ne peuvent être envoyés qu\'entre 9h-12h (matin) et 13h-17h (après-midi)'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            // Obtenir les plages horaires pour aujourd'hui
            $dateRange = $this->getTodayDateRange();
            $today = $dateRange['start'];
            $tomorrow = $dateRange['end'];
            
            // Trouver tous les utilisateurs étudiants et enseignants
            $studentsAndTeachers = $this->userRepository->findUsersWithRoles(['ROLE_STUDENT', 'ROLE_TEACHER']);
            
            $remindersCount = 0;
            $skippedCount = 0;
            
            foreach ($studentsAndTeachers as $user) {
                // Vérifier si l'utilisateur a déjà signé pour cette période aujourd'hui
                $existingSignature = $this->signatureRepository->createQueryBuilder('s')
                    ->where('s.user = :user')
                    ->andWhere('s.date >= :today')
                    ->andWhere('s.date < :tomorrow')
                    ->andWhere('s.period = :period')
                    ->setParameter('user', $user)
                    ->setParameter('today', $today)
                    ->setParameter('tomorrow', $tomorrow)
                    ->setParameter('period', $period)
                    ->getQuery()
                    ->getOneOrNullResult();
                
                if (!$existingSignature) {
                    // L'utilisateur n'a pas signé, envoyer un rappel
                    $this->notificationService->sendNotification(
                        $user,
                        'signature_reminder',
                        'Rappel de signature',
                        'N\'oubliez pas de signer votre présence pour la période ' . Signature::getAvailablePeriods()[$period] . ' aujourd\'hui.',
                        [
                            'period' => $period,
                            'periodName' => Signature::getAvailablePeriods()[$period],
                            'date' => $currentTime->format('Y-m-d')
                        ],
                        '/signature'
                    );
                    $remindersCount++;
                } else {
                    $skippedCount++;
                }
            }
            
            return $this->json([
                'success' => true,
                'message' => 'Rappels envoyés avec succès',
                'data' => [
                    'period' => $period,
                    'remindersCount' => $remindersCount,
                    'skippedCount' => $skippedCount,
                    'totalUsers' => count($studentsAndTeachers)
                ]
            ]);
        } catch (\Exception $e) {
            error_log('Error in sendReminders: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi des rappels: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Send end-of-period reminders (last call to sign)
     */
    #[Route('/last-call', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function sendLastCallReminders(Request $request): JsonResponse
    {
        try {
            // Obtenir la période actuelle basée sur l'heure
            $currentTime = $this->getCurrentTime();
            $hour = (int)$currentTime->format('H');
            $minute = (int)$currentTime->format('i');
            
            $period = null;
            // Vérifier si nous sommes proche de la fin d'une période (30 minutes avant la fin)
            if ($hour == 11 && $minute >= 30) {
                $period = Signature::PERIOD_MORNING;
            } elseif ($hour == 16 && $minute >= 30) {
                $period = Signature::PERIOD_AFTERNOON;
            } else {
                return $this->json([
                    'success' => false,
                    'message' => 'Les rappels de dernière minute ne peuvent être envoyés que 30 minutes avant la fin des périodes (11h30 pour le matin, 16h30 pour l\'après-midi)'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            // Obtenir les plages horaires pour aujourd'hui
            $dateRange = $this->getTodayDateRange();
            $today = $dateRange['start'];
            $tomorrow = $dateRange['end'];
            
            // Trouver tous les utilisateurs étudiants et enseignants
            $studentsAndTeachers = $this->userRepository->findUsersWithRoles(['ROLE_STUDENT', 'ROLE_TEACHER']);
            
            $remindersCount = 0;
            $skippedCount = 0;
            
            foreach ($studentsAndTeachers as $user) {
                // Vérifier si l'utilisateur a déjà signé pour cette période aujourd'hui
                $existingSignature = $this->signatureRepository->createQueryBuilder('s')
                    ->where('s.user = :user')
                    ->andWhere('s.date >= :today')
                    ->andWhere('s.date < :tomorrow')
                    ->andWhere('s.period = :period')
                    ->setParameter('user', $user)
                    ->setParameter('today', $today)
                    ->setParameter('tomorrow', $tomorrow)
                    ->setParameter('period', $period)
                    ->getQuery()
                    ->getOneOrNullResult();
                
                if (!$existingSignature) {
                    // L'utilisateur n'a pas signé, envoyer un rappel de dernière minute
                    $this->notificationService->sendNotification(
                        $user,
                        'signature_last_call',
                        'Dernier rappel de signature',
                        'IMPORTANT : Il vous reste moins de 30 minutes pour signer votre présence pour la période ' . Signature::getAvailablePeriods()[$period] . ' aujourd\'hui.',
                        [
                            'period' => $period,
                            'periodName' => Signature::getAvailablePeriods()[$period],
                            'date' => $currentTime->format('Y-m-d'),
                            'isUrgent' => true
                        ],
                        '/signature'
                    );
                    $remindersCount++;
                } else {
                    $skippedCount++;
                }
            }
            
            return $this->json([
                'success' => true,
                'message' => 'Rappels de dernière minute envoyés avec succès',
                'data' => [
                    'period' => $period,
                    'remindersCount' => $remindersCount,
                    'skippedCount' => $skippedCount,
                    'totalUsers' => count($studentsAndTeachers)
                ]
            ]);
        } catch (\Exception $e) {
            error_log('Error in sendLastCallReminders: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi des rappels de dernière minute: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 