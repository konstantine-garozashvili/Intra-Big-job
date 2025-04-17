<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class NotificationController extends AbstractController
{
    #[Route('/notifications/stream', name: 'notifications_stream', methods: ['GET'])]
    public function stream(Request $request, EntityManagerInterface $entityManager): StreamedResponse
    {
        // Get user from security context
        $user = $this->getUser();
        if (!$user) {
            throw $this->createAccessDeniedException('Authentication required');
        }

        $response = new StreamedResponse(function() use ($user) {
            while (true) {
                if (connection_aborted()) {
                    break;
                }

                // Check for notifications in the temp file
                $notificationFile = sys_get_temp_dir() . "/sse_{$user->getId()}.txt";
                if (file_exists($notificationFile)) {
                    $notifications = file_get_contents($notificationFile);
                    if ($notifications) {
                        echo $notifications;
                        flush();
                        // Clear the file after sending
                        file_put_contents($notificationFile, '');
                    }
                }

                // Keep connection alive
                echo ":\n\n";
                flush();
                
                // Sleep for 2 seconds before next check
                sleep(2);
            }
        });

        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('Connection', 'keep-alive');
        $response->headers->set('X-Accel-Buffering', 'no'); // Disable nginx buffering
        $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow frontend access
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Allow-Headers', 'Authorization');

        return $response;
    }

    #[Route('/notifications/send/{userId}', name: 'send_notification', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function sendNotification(int $userId): Response
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['message'])) {
            return $this->json(['error' => 'Message is required'], 400);
        }

        $message = json_encode([
            'type' => $data['type'] ?? 'notification',
            'message' => $data['message'],
            'timestamp' => (new \DateTime())->format('c')
        ]);

        // Store notification in temp file
        $notificationFile = sys_get_temp_dir() . "/sse_{$userId}.txt";
        file_put_contents($notificationFile, "data: {$message}\n\n", FILE_APPEND);

        return $this->json(['success' => true]);
    }
}
