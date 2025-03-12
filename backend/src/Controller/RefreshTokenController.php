<?php

namespace App\Controller;

use App\Entity\RefreshToken;
use App\Service\RefreshTokenService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api', name: 'api_refresh_token_')]
class RefreshTokenController extends AbstractController
{
    private RefreshTokenService $refreshTokenService;
    private JWTTokenManagerInterface $jwtManager;
    private TokenStorageInterface $tokenStorage;
    private ParameterBagInterface $params;

    public function __construct(
        RefreshTokenService $refreshTokenService,
        JWTTokenManagerInterface $jwtManager,
        TokenStorageInterface $tokenStorage,
        ParameterBagInterface $params
    ) {
        $this->refreshTokenService = $refreshTokenService;
        $this->jwtManager = $jwtManager;
        $this->tokenStorage = $tokenStorage;
        $this->params = $params;
    }

    #[Route('/refresh', name: 'refresh_token', methods: ['POST'])]
    public function refresh(Request $request): JsonResponse
    {
        $content = json_decode($request->getContent(), true);
        $refreshTokenString = $content[$this->params->get('refresh_token.token_parameter_name')] ?? null;
        
        if (!$refreshTokenString) {
            return new JsonResponse(['message' => 'Refresh token not provided'], Response::HTTP_BAD_REQUEST);
        }
        
        $refreshToken = $this->refreshTokenService->findOneBy(['refreshToken' => $refreshTokenString]);
        
        if (!$refreshToken || !$refreshToken->isValid()) {
            return new JsonResponse(['message' => 'Invalid refresh token'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Refresh the token
        $refreshToken = $this->refreshTokenService->refresh($refreshToken);
        
        // Generate a new JWT for the user
        $user = $this->getUserByUsername($refreshToken->getUsername());
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], Response::HTTP_UNAUTHORIZED);
        }
        
        $jwt = $this->jwtManager->create($user);
        
        return new JsonResponse([
            'token' => $jwt,
            'refresh_token' => $refreshToken->getRefreshToken(),
        ]);
    }

    #[Route('/revoke', name: 'revoke_token', methods: ['POST'])]
    public function revoke(Request $request): JsonResponse
    {
        $content = json_decode($request->getContent(), true);
        $refreshTokenString = $content[$this->params->get('refresh_token.token_parameter_name')] ?? null;
        
        if (!$refreshTokenString) {
            return new JsonResponse(['message' => 'Refresh token not provided'], Response::HTTP_BAD_REQUEST);
        }
        
        $refreshToken = $this->refreshTokenService->findOneBy(['refreshToken' => $refreshTokenString]);
        
        if ($refreshToken) {
            $this->refreshTokenService->remove($refreshToken);
            return new JsonResponse(['message' => 'Token revoked']);
        }
        
        return new JsonResponse(['message' => 'Invalid token'], Response::HTTP_BAD_REQUEST);
    }

    #[Route('/refresh-token/devices', name: 'devices', methods: ['GET'])]
    public function getDevices(#[CurrentUser] UserInterface $user): JsonResponse
    {
        $devices = $this->refreshTokenService->getDevicesForUser($user->getUserIdentifier());
        
        return $this->json([
            'success' => true,
            'devices' => $devices
        ]);
    }

    #[Route('/refresh-token/remove/{tokenId}', name: 'remove_device', methods: ['DELETE'])]
    public function removeDevice(#[CurrentUser] UserInterface $user, string $tokenId): JsonResponse
    {
        $token = $this->refreshTokenService->findOneBy(['id' => $tokenId, 'username' => $user->getUserIdentifier()]);
        
        if (!$token) {
            return $this->json([
                'success' => false,
                'message' => 'Token non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        $this->refreshTokenService->remove($token);
        
        return $this->json([
            'success' => true,
            'message' => 'Appareil déconnecté avec succès'
        ]);
    }

    #[Route('/refresh-token/clean', name: 'clean', methods: ['POST'])]
    public function cleanTokens(#[CurrentUser] UserInterface $user): JsonResponse
    {
        $count = $this->refreshTokenService->removeAllForUser($user->getUserIdentifier());
        
        return $this->json([
            'success' => true,
            'message' => sprintf('%d tokens ont été supprimés.', $count)
        ]);
    }

    #[Route('/refresh-token/clean-all', name: 'clean_all', methods: ['POST'])]
    public function cleanAllTokens(Request $request): JsonResponse
    {
        // Cette route est réservée aux admins
        if (!$this->isGranted('ROLE_ADMIN')) {
            return $this->json([
                'success' => false,
                'message' => 'Accès refusé'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $count = $this->refreshTokenService->cleanExpiredTokens();
        
        return $this->json([
            'success' => true,
            'message' => sprintf('%d tokens expirés ont été supprimés.', $count)
        ]);
    }

    /**
     * Get the user for a username
     */
    protected function getUserByUsername(string $username): ?UserInterface
    {
        // You need to implement this based on your user provider
        // For example:
        $userProvider = $this->container->get('security.user.provider.concrete.app_user_provider');
        try {
            return $userProvider->loadUserByIdentifier($username);
        } catch (\Exception $e) {
            return null;
        }
    }
} 