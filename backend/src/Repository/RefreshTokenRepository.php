<?php

namespace App\Repository;

use App\Entity\RefreshToken;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<RefreshToken>
 *
 * @method RefreshToken|null find($id, $lockMode = null, $lockVersion = null)
 * @method RefreshToken|null findOneBy(array $criteria, array $orderBy = null)
 * @method RefreshToken[]    findAll()
 * @method RefreshToken[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class RefreshTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RefreshToken::class);
    }

    /**
     * Récupère tous les tokens expirés
     */
    public function findExpiredTokens(): array
    {
        $now = new \DateTime();
        
        return $this->createQueryBuilder('t')
            ->where('t.valid < :now')
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();
    }

    /**
     * Récupère tous les tokens pour un appareil donné
     */
    public function findAllByDeviceId(string $deviceId): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.deviceId = :deviceId')
            ->setParameter('deviceId', $deviceId)
            ->orderBy('t.valid', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findInvalid(): array
    {
        return $this->createQueryBuilder('r')
            ->where('r.valid < :now')
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getResult();
    }

    public function findOneByToken(string $refreshToken): ?RefreshToken
    {
        return $this->findOneBy(['refreshToken' => $refreshToken]);
    }
} 