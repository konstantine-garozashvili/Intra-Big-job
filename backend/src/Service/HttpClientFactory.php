<?php

namespace App\Service;

use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Factory to create HttpClient instances with adaptive timeout
 */
class HttpClientFactory
{
    private TimeoutService $timeoutService;
    private RequestStack $requestStack;
    
    public function __construct(
        TimeoutService $timeoutService,
        RequestStack $requestStack
    ) {
        $this->timeoutService = $timeoutService;
        $this->requestStack = $requestStack;
    }
    
    /**
     * Create a new HttpClient with adaptive timeout settings
     */
    public function create(array $options = [], bool $isProfileRequest = false): HttpClientInterface
    {
        // Try to get timeout from current request (if set by HttpTimeoutListener)
        $timeout = null;
        $currentRequest = $this->requestStack->getCurrentRequest();
        
        if ($currentRequest && $currentRequest->attributes->has('_timeout')) {
            $timeout = $currentRequest->attributes->get('_timeout');
        } else {
            // Otherwise get timeout from service
            $timeout = $this->timeoutService->getTimeout($isProfileRequest);
        }
        
        // Merge timeout with provided options, giving precedence to any explicitly set timeout
        $defaultOptions = [
            'timeout' => $timeout,
            'max_duration' => $timeout + 5, // Add small buffer for total request duration
        ];
        
        $mergedOptions = array_merge($defaultOptions, $options);
        
        return HttpClient::create($mergedOptions);
    }
    
    /**
     * Create a new HttpClient optimized for profile/user data requests
     */
    public function createForProfile(array $options = []): HttpClientInterface
    {
        return $this->create($options, true);
    }
    
    /**
     * Create a new HttpClient for large data transfers (longer timeout)
     */
    public function createForLargeData(array $options = []): HttpClientInterface
    {
        // Start with regular client but extend timeout
        $client = $this->create($options);
        $timeout = $this->timeoutService->getTimeout() * 2; // Double the regular timeout
        
        // Override with extended timeout
        $options = array_merge([
            'timeout' => $timeout,
            'max_duration' => $timeout + 10,
        ], $options);
        
        return HttpClient::create($options);
    }
} 