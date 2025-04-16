<?php

namespace App\Controller;

use App\Repository\NotificationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api')]
class NotificationController extends AbstractController
{
    private $security;
    private $notificationRepository;
    private $entityManager;
    
    public function __construct(
        Security $security,
        NotificationRepository $notificationRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->security = $security;
        $this->notificationRepository = $notificationRepository;
        $this->entityManager = $entityManager;
    }
    
    #[Route('/notifications', name: 'get_user_notifications', methods: ['GET'])]
    public function getUserNotifications(): JsonResponse
    {
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }
        
        $notifications = $this->notificationRepository->findBy(
            ['user' => $user, 'isRead' => false],
            ['createdAt' => 'DESC'],
            5
        );
        
        $notificationsData = [];
        foreach ($notifications as $notification) {
            $notificationsData[] = [
                'id' => $notification->getId(),
                'message' => $notification->getMessage(),
                'type' => $notification->getType(),
                'isRead' => $notification->isRead(),
                'createdAt' => $notification->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }
        
        return $this->json([
            'success' => true,
            'notifications' => $notificationsData
        ]);
    }
    
    #[Route('/notifications/mark-read', name: 'mark_notifications_read', methods: ['POST'])]
    public function markNotificationsAsRead(Request $request): JsonResponse
    {
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'User not authenticated'
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }
        
        $data = json_decode($request->getContent(), true);
        $notificationIds = $data['notificationIds'] ?? [];
        
        if (empty($notificationIds)) {
            $notifications = $this->notificationRepository->findBy(['user' => $user, 'isRead' => false]);
        } else {
            $notifications = $this->notificationRepository->findBy([
                'id' => $notificationIds,
                'user' => $user,
                'isRead' => false
            ]);
        }
        
        foreach ($notifications as $notification) {
            $notification->setIsRead(true);
        }
        
        $this->entityManager->flush();
        
        return $this->json([
            'success' => true,
            'message' => 'Notifications marked as read'
        ]);
    }
}
