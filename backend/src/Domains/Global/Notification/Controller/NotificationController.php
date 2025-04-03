<?php

namespace App\Domains\Global\Notification\Controller;

use App\Domains\Global\Notification\Entity\Notification;
use App\Domains\Global\Notification\Service\NotificationService;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/notifications')]
class NotificationController extends AbstractController
{
    public function __construct(
        private NotificationService $notificationService,
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer
    ) {
    }

    /**
     * Get user notifications
     */
    #[Route('', name: 'app_notifications_list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = min(50, max(1, (int) $request->query->get('limit', 10)));
        $includeRead = filter_var($request->query->get('include_read', 'true'), FILTER_VALIDATE_BOOLEAN);

        $result = $this->notificationService->getUserNotifications($user, $page, $limit, $includeRead);

        return $this->json([
            'notifications' => $result['notifications'],
            'pagination' => $result['pagination'],
            'unread_count' => $this->notificationService->getUnreadCount($user)
        ], Response::HTTP_OK, [], ['groups' => ['notification:read']]);
    }

    /**
     * Get unread notification count
     */
    #[Route('/unread-count', name: 'app_notifications_unread_count', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function unreadCount(#[CurrentUser] User $user): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount($user);

        return $this->json([
            'count' => $count
        ]);
    }

    /**
     * Mark notifications as read
     */
    #[Route('/mark-read', name: 'app_notifications_mark_read', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function markAsRead(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $notificationIds = $data['notification_ids'] ?? null;

        // Validate notification IDs if provided
        if ($notificationIds !== null) {
            if (!is_array($notificationIds)) {
                return $this->json([
                    'message' => 'Le paramètre notification_ids doit être un tableau.'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Check if all notifications belong to the user
            if (count($notificationIds) > 0) {
                $notifications = $this->entityManager->getRepository(Notification::class)
                    ->findBy(['id' => $notificationIds]);

                foreach ($notifications as $notification) {
                    if ($notification->getUser()->getId() !== $user->getId()) {
                        return $this->json([
                            'message' => 'Accès non autorisé à une notification.'
                        ], Response::HTTP_FORBIDDEN);
                    }
                }
            }
        }

        $updated = $this->notificationService->markAsRead($user, $notificationIds);

        return $this->json([
            'success' => true,
            'updated' => $updated,
            'unread_count' => $this->notificationService->getUnreadCount($user)
        ]);
    }

    /**
     * Mark a specific notification as read
     */
    #[Route('/{id}/mark-read', name: 'app_notification_mark_read', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function markOneAsRead(Notification $notification, #[CurrentUser] User $user): JsonResponse
    {
        // Check if the notification belongs to the user
        if ($notification->getUser()->getId() !== $user->getId()) {
            return $this->json([
                'message' => 'Accès non autorisé à cette notification.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Mark as read if not already
        if (!$notification->isRead()) {
            $notification->setIsRead(true);
            $notification->setReadAt(new \DateTime());
            $this->entityManager->flush();
        }

        return $this->json([
            'success' => true,
            'notification' => $notification,
            'unread_count' => $this->notificationService->getUnreadCount($user)
        ], Response::HTTP_OK, [], ['groups' => ['notification:read']]);
    }

    /**
     * Get a single notification
     */
    #[Route('/{id}', name: 'app_notification_get', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getNotification(Notification $notification, #[CurrentUser] User $user): JsonResponse
    {
        // Check if the notification belongs to the user
        if ($notification->getUser()->getId() !== $user->getId()) {
            return $this->json([
                'message' => 'Accès non autorisé à cette notification.'
            ], Response::HTTP_FORBIDDEN);
        }

        return $this->json($notification, Response::HTTP_OK, [], ['groups' => ['notification:read']]);
    }
}