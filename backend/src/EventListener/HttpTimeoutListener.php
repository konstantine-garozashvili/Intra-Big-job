<?php

namespace App\EventListener;

use App\Service\TimeoutService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class HttpTimeoutListener implements EventSubscriberInterface
{
    private TimeoutService $timeoutService;
    
    public function __construct(TimeoutService $timeoutService)
    {
        $this->timeoutService = $timeoutService;
    }
    
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 100],
        ];
    }
    
    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }
        
        $request = $event->getRequest();
        
        // Set timeout value based on request type
        $isProfileRequest = $this->isProfileRequest($request->getPathInfo());
        $timeout = $this->timeoutService->getTimeout($isProfileRequest);
        
        // Store timeout in request attributes so it can be accessed by controllers/services
        $request->attributes->set('_timeout', $timeout);
        
        // Set PHP script execution time limit based on the adaptive timeout
        // Add a buffer to the script timeout to ensure proper response handling
        $scriptTimeout = min($timeout + 5, 120); // Cap at 120 seconds maximum
        ini_set('max_execution_time', $scriptTimeout);
    }
    
    /**
     * Check if the request is for profile data
     */
    private function isProfileRequest(string $path): bool
    {
        return str_contains($path, '/profile/')
            || str_contains($path, '/me')
            || str_contains($path, '/user/')
            || str_contains($path, '/users/');
    }
} 