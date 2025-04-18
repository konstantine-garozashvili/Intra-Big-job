<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/simple-profile')]
class SimpleProfileController extends AbstractController
{
    #[Route('/test', name: 'app_simple_profile_test', methods: ['GET'])]
    public function testProfile(): JsonResponse
    {
        return $this->json([
            'message' => 'Simple Profile controller test endpoint',
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]);
    }
} 