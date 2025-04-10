<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/move-profile')]
class MoveProfileController extends AbstractController
{
    #[Route('/test', name: 'app_move_profile_test', methods: ['GET'])]
    public function testProfile(): JsonResponse
    {
        return $this->json([
            'message' => 'MoveProfileController test endpoint',
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]);
    }
} 