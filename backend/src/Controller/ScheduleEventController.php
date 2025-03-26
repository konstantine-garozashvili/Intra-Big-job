<?php

namespace App\Controller;

use App\Entity\ScheduleEvent;
use App\Entity\EventParticipant;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class ScheduleEventController extends AbstractController
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/create-event', name: 'api_create_schedule_event', methods: ['POST'])]
    public function createEvent(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);

            $currentUser = $this->getUser();
            if (!$currentUser) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $event = new ScheduleEvent();
            $event->setTitle($data['title']);
            $event->setDescription($data['description'] ?? null);

            $startDateTime = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $data['date'] . ' ' . $data['startTime']);
            $endDateTime = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $data['date'] . ' ' . $data['endTime']);

            $event->setStartDateTime($startDateTime);
            $event->setEndDateTime($endDateTime);
            $event->setLocation($data['location'] ?? null);
            $event->setType($data['type'] ?? 'autre');

            $event->setCreatedBy($currentUser);
            $event->setCreatedAt(new \DateTimeImmutable());

            if (isset($data['participants']) && is_array($data['participants'])) {
                foreach ($data['participants'] as $participantId) {
                    $participant = $userRepository->find($participantId);

                    if ($participant) {
                        $eventParticipant = new EventParticipant();
                        $eventParticipant->setEvent($event);
                        $eventParticipant->setUser($participant);

                        $event->addEventParticipant($eventParticipant);

                        $entityManager->persist($eventParticipant);
                    }
                }
            }

            $entityManager->persist($event);
            $entityManager->flush();

            return $this->json([
                'id' => $event->getId(),
                'title' => $event->getTitle(),
                'description' => $event->getDescription(),
                'startDateTime' => $event->getStartDateTime()->format('Y-m-d H:i'),
                'endDateTime' => $event->getEndDateTime()->format('Y-m-d H:i'),
                'location' => $event->getLocation(),
                'type' => $event->getType(),
                'participants' => array_map(function ($participant) {
                    $user = $participant->getUser();
                    return [
                        'id' => $user->getId(),
                        'name' => $user->getFirstName() . ' ' . $user->getLastName()
                    ];
                }, $event->getEventParticipants()->toArray())
            ]);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            error_log($e->getTraceAsString());

            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'événement',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/get-user-events', name: 'api_get_user_events', methods: ['GET'])]
    public function getUserEvents(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non connecté'], 401);
        }

        $eventParticipantRepo = $this->entityManager->getRepository(EventParticipant::class);
        $participantEvents = $eventParticipantRepo->findBy(['user' => $user]);

        $events = [];

        foreach ($participantEvents as $eventParticipant) {
            $event = $eventParticipant->getEvent();
            $events[$event->getId()] = $this->formatEventData($event);
        }

        $scheduleEventRepo = $this->entityManager->getRepository(ScheduleEvent::class);
        $createdEvents = $scheduleEventRepo->findBy(['createdBy' => $user]);

        foreach ($createdEvents as $event) {
            if (!isset($events[$event->getId()])) {
                $events[$event->getId()] = $this->formatEventData($event);
            }
        }

        return $this->json(array_values($events));
    }

    private function formatEventData(ScheduleEvent $event): array
    {
        $participants = [];
        foreach ($event->getEventParticipants() as $eventParticipant) {
            $user = $eventParticipant->getUser();
            $participants[] = [
                'id' => $user->getId(),
                'name' => $user->getFirstName() . ' ' . $user->getLastName()
            ];
        }

        return [
            'id' => $event->getId(),
            'title' => $event->getTitle(),
            'description' => $event->getDescription(),
            'startDateTime' => $event->getStartDateTime()->format('Y-m-d H:i'),
            'endDateTime' => $event->getEndDateTime()->format('Y-m-d H:i'),
            'location' => $event->getLocation(),
            'type' => $event->getType(),
            'createdBy' => [
                'id' => $event->getCreatedBy()->getId(),
                'name' => $event->getCreatedBy()->getFirstName() . ' ' . $event->getCreatedBy()->getLastName()
            ],
            'participants' => $participants
        ];
    }
}
