<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class TestNotificationController extends AbstractController
{
    #[Route('/test-notification', name: 'app_test_notification', methods: ['GET'])]
    public function testNotification(): JsonResponse
    {
        return $this->json([
            'success' => true,
            'message' => 'Test notification route works!',
            'timestamp' => new \DateTime()
        ]);
    }
    
    #[Route('/test-notification-count', name: 'app_test_notification_count', methods: ['GET'])]
    public function testNotificationCount(): JsonResponse
    {
        return $this->json([
            'count' => 5,
            'success' => true
        ]);
    }
} 