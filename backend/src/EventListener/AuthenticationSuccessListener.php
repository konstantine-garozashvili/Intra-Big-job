<?php

namespace App\EventListener;

use App\Service\RefreshTokenService;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\User\UserInterface;

class AuthenticationSuccessListener
{
    private RefreshTokenService $refreshTokenService;
    private RequestStack $requestStack;
    private string $tokenParameterName;

    public function __construct(
        RefreshTokenService $refreshTokenService,
        RequestStack $requestStack,
        string $tokenParameterName = 'refresh_token'
    ) {
        $this->refreshTokenService = $refreshTokenService;
        $this->requestStack = $requestStack;
        $this->tokenParameterName = $tokenParameterName;
    }

    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $data = $event->getData();
        $user = $event->getUser();

        if (!$user instanceof UserInterface) {
            return;
        }

        $request = $this->requestStack->getCurrentRequest();
        if (null === $request) {
            return;
        }

        // Get device information from the request
        $content = json_decode($request->getContent(), true) ?? [];
        $deviceId = $content['device_id'] ?? null;
        $deviceName = $content['device_name'] ?? null;
        $deviceType = $content['device_type'] ?? null;

        // Create or update refresh token
        $refreshToken = $this->refreshTokenService->create(
            $user->getUserIdentifier(),
            $deviceId,
            $deviceName,
            $deviceType
        );

        // Add the refresh token to the response
        $data[$this->tokenParameterName] = $refreshToken->getRefreshToken();
        
        $event->setData($data);
    }
} 