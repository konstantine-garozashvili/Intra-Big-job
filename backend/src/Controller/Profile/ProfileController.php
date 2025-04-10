<?php

namespace App\Controller\Profile;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/profile')]
class ProfileController extends AbstractController
{
    #[Route('/test', name: 'app_profile_test', methods: ['GET'])]
    public function testProfile(): JsonResponse
    {
        return $this->json([
            'message' => 'Profile controller test endpoint',
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s'),
        ]);
    }
}
