<?php

namespace App\Controller;

use App\Service\TimeoutService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Controller to expose timeout information to frontend clients
 */
#[Route('/api', name: 'api_timeout_')]
class TimeoutApiController extends AbstractController
{
    private TimeoutService $timeoutService;
    
    public function __construct(TimeoutService $timeoutService)
    {
        $this->timeoutService = $timeoutService;
    }

    /**
     * Get adaptive timeout settings for frontend use
     */
    #[Route('/timeout-config', name: 'config', methods: ['GET'])]
    public function getTimeoutConfig(Request $request): JsonResponse
    {
        $isLowPerformance = $this->timeoutService->isLowPerformanceEnvironment();
        
        // Get timeout values
        $defaultTimeout = $this->timeoutService->getTimeout(false);
        $profileTimeout = $this->timeoutService->getTimeout(true);
        
        return new JsonResponse([
            'isLowPerformance' => $isLowPerformance,
            'timeouts' => [
                'default' => $defaultTimeout * 1000, // Convert to milliseconds for frontend
                'profile' => $profileTimeout * 1000,
                'large' => $defaultTimeout * 2 * 1000, // Double timeout for large requests
            ],
            'serverTimestamp' => time(),
            'serverPerformanceMode' => $isLowPerformance ? 'low' : 'normal',
        ]);
    }
} 