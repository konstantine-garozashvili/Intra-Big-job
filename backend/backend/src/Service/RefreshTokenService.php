<?php

namespace App\Service;

use App\Entity\RefreshToken;
use App\Repository\RefreshTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Psr\Log\LoggerInterface;

class RefreshTokenService
{
    private EntityManagerInterface $entityManager;
    private RefreshTokenRepository $refreshTokenRepository;
    private ParameterBagInterface $params;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        RefreshTokenRepository $refreshTokenRepository,
        ParameterBagInterface $params,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->refreshTokenRepository = $refreshTokenRepository;
        $this->params = $params;
        $this->logger = $logger;
    }

    public function create(string $username, string $deviceId = null, string $deviceName = null, string $deviceType = null): RefreshToken
    {
        // Rechercher d'abord un token existant sans device_id pour cet utilisateur
        $existingTokenWithoutDevice = $this->refreshTokenRepository->findOneBy([
            'username' => $username,
            'deviceId' => null
        ]);
        
        if ($existingTokenWithoutDevice && $deviceId) {
            // Mettre à jour avec les informations d'appareil
            $existingTokenWithoutDevice->setDeviceId($deviceId);
            $existingTokenWithoutDevice->setDeviceName($deviceName);
            $existingTokenWithoutDevice->setDeviceType($deviceType);
            
            // Mise à jour de la date de validité
            $validUntil = new \DateTime();
            $validUntil->modify('+' . intval($this->params->get('refresh_token.ttl')) . ' seconds');
            $existingTokenWithoutDevice->setValid($validUntil);
            $existingTokenWithoutDevice->setRefreshToken(RefreshToken::generateToken());
            
            $this->entityManager->persist($existingTokenWithoutDevice);
            $this->entityManager->flush();
            return $existingTokenWithoutDevice;
        }

        // Trouver TOUS les tokens existants pour cet utilisateur avec le même type d'appareil
        // (au lieu de se baser uniquement sur deviceId qui peut changer)
        $existingTokensQuery = [
            'username' => $username
        ];
        
        // Ajouter deviceType et deviceName comme critères s'ils sont fournis
        if ($deviceType) {
            $existingTokensQuery['deviceType'] = $deviceType;
        }
        
        // Si nous avons ces informations, chercher les tokens correspondants
        if (!empty($existingTokensQuery) && $existingTokensQuery != ['username' => $username]) {
            $existingTokens = $this->refreshTokenRepository->findBy($existingTokensQuery);

            // S'il y a des tokens existants pour ce type d'appareil
            if (count($existingTokens) > 0) {
                // Prendre le plus récent
                $mostRecentToken = $existingTokens[0];
                $mostRecentDate = $mostRecentToken->getValid();
                
                foreach ($existingTokens as $token) {
                    if ($token->getValid() > $mostRecentDate) {
                        $mostRecentToken = $token;
                        $mostRecentDate = $token->getValid();
                    }
                }
                
                // Supprimer tous les autres tokens pour ce type d'appareil
                foreach ($existingTokens as $token) {
                    if ($token->getId() !== $mostRecentToken->getId()) {
                        $this->entityManager->remove($token);
                    }
                }
                
                // Mettre à jour le token le plus récent avec les nouvelles informations
                $validUntil = new \DateTime();
                $validUntil->modify('+' . intval($this->params->get('refresh_token.ttl')) . ' seconds');
                $mostRecentToken->setValid($validUntil);
                $mostRecentToken->setRefreshToken(RefreshToken::generateToken());
                $mostRecentToken->setDeviceId($deviceId); // Mettre à jour deviceId
                $mostRecentToken->setDeviceName($deviceName);
                $mostRecentToken->setDeviceType($deviceType);
                
                $this->entityManager->persist($mostRecentToken);
                $this->entityManager->flush();
                return $mostRecentToken;
            }
        }

        // En complément, limiter le nombre de tokens par utilisateur
        $this->limitTokensPerUser($username);

        // Créer un nouveau token si aucun n'existe
        $refreshToken = new RefreshToken();
        $refreshToken->setUsername($username);
        $refreshToken->setRefreshToken(RefreshToken::generateToken());
        
        // Create a valid DateTime explicitly
        $validUntil = new \DateTime();
        $validUntil->modify('+' . intval($this->params->get('refresh_token.ttl')) . ' seconds');
        $refreshToken->setValid($validUntil);
        
        if ($deviceId) {
            $refreshToken->setDeviceId($deviceId);
        }
        
        if ($deviceName) {
            $refreshToken->setDeviceName($deviceName);
        }
        
        if ($deviceType) {
            $refreshToken->setDeviceType($deviceType);
        }

        $this->entityManager->persist($refreshToken);
        $this->entityManager->flush();

        return $refreshToken;
    }

    /**
     * Limiter le nombre de tokens par utilisateur (garder uniquement les 5 plus récents)
     */
    private function limitTokensPerUser(string $username, int $maxTokens = 5): void
    {
        $allUserTokens = $this->refreshTokenRepository->findBy(
            ['username' => $username],
            ['valid' => 'DESC']
        );
        
        if (count($allUserTokens) > $maxTokens) {
            // Supprimer les plus anciens tokens au-delà de la limite
            for ($i = $maxTokens; $i < count($allUserTokens); $i++) {
                $this->entityManager->remove($allUserTokens[$i]);
            }
            $this->entityManager->flush();
        }
    }

    public function findOneBy(array $criteria): ?RefreshToken
    {
        $this->logger->info('Recherche de token avec les critères: ' . json_encode($criteria));
        $token = $this->refreshTokenRepository->findOneBy($criteria);
        $this->logger->info('Résultat de la recherche: ' . ($token ? 'Token trouvé' : 'Token non trouvé'));
        return $token;
    }

    public function refresh(RefreshToken $refreshToken): RefreshToken
    {
        // Update the expiration if configured to do so
        if ($this->params->get('refresh_token.ttl_update')) {
            $validUntil = new \DateTime();
            $validUntil->modify('+' . intval($this->params->get('refresh_token.ttl')) . ' seconds');
            $refreshToken->setValid($validUntil);
        }

        // Generate a new token value if required
        $refreshToken->setRefreshToken(RefreshToken::generateToken());

        $this->entityManager->persist($refreshToken);
        $this->entityManager->flush();

        return $refreshToken;
    }

    public function remove(RefreshToken $refreshToken): void
    {
        $this->logger->info('Début de la suppression du token: ' . $refreshToken->getId());
        
        try {
            $this->logger->info('Token à supprimer - ID: ' . $refreshToken->getId() . ', Username: ' . $refreshToken->getUsername());
            
            // Nous ne faisons pas la vérification d'autorisation ici - elle devrait être faite dans le contrôleur
            // Le service est juste responsable de la suppression technique
            
            $this->logger->info('Suppression du token en cours...');
            $this->entityManager->remove($refreshToken);
            $this->entityManager->flush();
            $this->logger->info('Token supprimé avec succès');
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la suppression du token: ' . $e->getMessage());
            $this->logger->error('Stack trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }

    public function removeAllForUser(string $username): int
    {
        $tokens = $this->refreshTokenRepository->findBy(['username' => $username]);
        $count = count($tokens);
        
        foreach ($tokens as $token) {
            $this->entityManager->remove($token);
        }
        
        $this->entityManager->flush();
        
        return $count;
    }

    public function getDevicesForUser(string $username): array
    {
        $tokens = $this->refreshTokenRepository->findBy(['username' => $username]);
        $devices = [];
        
        foreach ($tokens as $token) {
            if ($token->getDeviceId() && $token->isValid()) {
                $devices[] = [
                    'id' => $token->getDeviceId(),
                    'name' => $token->getDeviceName() ?: 'Unknown Device',
                    'type' => $token->getDeviceType() ?: 'Unknown',
                    'lastUsed' => $token->getValid()->format('Y-m-d H:i:s'),
                    'tokenId' => $token->getId()
                ];
            }
        }
        
        return $devices;
    }

    /**
     * Nettoyer les tokens expirés
     * @return int Le nombre de tokens supprimés
     */
    public function cleanExpiredTokens(): int
    {
        $expiredTokens = $this->refreshTokenRepository->findExpiredTokens();
            
        $count = count($expiredTokens);
        
        foreach ($expiredTokens as $token) {
            $this->entityManager->remove($token);
        }
        
        $this->entityManager->flush();
        
        return $count;
    }
} 