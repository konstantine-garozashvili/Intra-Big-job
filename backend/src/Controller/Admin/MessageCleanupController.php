<?php

namespace App\Controller\Admin;

use App\Service\MessageCleanupService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin/messages')]
#[IsGranted('ROLE_ADMIN')]
class MessageCleanupController extends AbstractController
{
    private MessageCleanupService $messageCleanupService;

    public function __construct(MessageCleanupService $messageCleanupService)
    {
        $this->messageCleanupService = $messageCleanupService;
    }

    #[Route('/cleanup', methods: ['POST'])]
    public function cleanupMessages(Request $request): JsonResponse
    {
        $days = $request->request->getInt('days', 15);
        $dryRun = $request->request->getBoolean('dryRun', false);

        $result = $this->messageCleanupService->cleanupOldMessages($days, $dryRun);

        return $this->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'count' => $result['count'],
            'dryRun' => $dryRun,
            'days' => $days
        ]);
    }
}
