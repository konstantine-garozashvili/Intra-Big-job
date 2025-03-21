<?php

namespace App\Controller;

use App\Service\ProfilerToggleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Process\Process;
use Symfony\Component\HttpKernel\KernelInterface;

#[Route('/dev-tools', name: 'app_dev_tools_')]
class DevToolsController extends AbstractController
{
    private $projectDir;
    private $profilerToggleService;

    public function __construct(
        KernelInterface $kernel,
        ProfilerToggleService $profilerToggleService
    ) {
        $this->projectDir = $kernel->getProjectDir();
        $this->profilerToggleService = $profilerToggleService;
    }

    #[Route('/profiler', name: 'profiler_page', methods: ['GET'])]
    public function profilerPage(): Response
    {
        // Only allow in dev environment
        if ($this->getParameter('kernel.environment') !== 'dev') {
            throw $this->createAccessDeniedException('This page is only available in the dev environment');
        }

        // Get current profiler status from the service
        $status = $this->profilerToggleService->getProfilerStatus();

        return $this->render('dev_tools/toggle_profiler.html.twig', [
            'profiler_enabled' => $status['enabled'],
            'profiler_only_exceptions' => $status['only_exceptions'],
        ]);
    }

    #[Route('/toggle-profiler', name: 'toggle_profiler', methods: ['POST'])]
    public function toggleProfiler(Request $request): Response
    {
        // Only allow in dev environment
        if ($this->getParameter('kernel.environment') !== 'dev') {
            throw $this->createAccessDeniedException('This endpoint is only available in the dev environment');
        }

        // Get request parameter for enable/disable
        $enable = $request->request->getBoolean('enable', false);
        
        // Use the service to toggle profiler (only_exceptions is now managed by the service)
        $this->profilerToggleService->toggleProfiler($enable);
        
        // Clear the cache
        $this->profilerToggleService->clearCache();

        // Add a flash message
        $this->addFlash(
            'success',
            'Profiler settings updated successfully. ' . 
            ($enable ? 'Profiler is now ENABLED and will collect data on all requests.' : 
                    'Profiler is now DISABLED and will only collect data on exceptions.')
        );

        // Redirect back to the profiler page
        return $this->redirectToRoute('app_dev_tools_profiler_page');
    }

    #[Route('/profiler-status', name: 'profiler_status', methods: ['GET'])]
    public function profilerStatus(): JsonResponse
    {
        // Only allow in dev environment
        if ($this->getParameter('kernel.environment') !== 'dev') {
            return $this->json(['error' => 'This endpoint is only available in the dev environment'], 403);
        }

        // Get status from service
        $status = $this->profilerToggleService->getProfilerStatus();

        return $this->json([
            'profiler' => $status
        ]);
    }
} 