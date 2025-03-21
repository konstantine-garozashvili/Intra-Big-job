<?php

namespace App\Repository;

use App\Entity\UserStatusHistory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserStatusHistory>
 *
 * @method UserStatusHistory|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserStatusHistory|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserStatusHistory[]    findAll()
 * @method UserStatusHistory[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserStatusHistoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserStatusHistory::class);
    }

    /**
     * Find current status history entry for a user with eager loading
     */
    public function findCurrentByUser($userId): ?UserStatusHistory
    {
        return $this->createQueryBuilder('ush')
            ->select('ush', 'u', 's')
            ->leftJoin('ush.user', 'u')
            ->leftJoin('ush.status', 's')
            ->andWhere('ush.user = :userId')
            ->andWhere('ush.endDate IS NULL')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find all status history entries for a user with eager loading
     * @return UserStatusHistory[]
     */
    public function findByUser($userId): array
    {
        return $this->createQueryBuilder('ush')
            ->select('ush', 'u', 's')
            ->leftJoin('ush.user', 'u')
            ->leftJoin('ush.status', 's')
            ->andWhere('ush.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('ush.startDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all active status histories for a specific status with eager loading
     * @return UserStatusHistory[]
     */
    public function findCurrentByStatus($statusId): array
    {
        return $this->createQueryBuilder('ush')
            ->select('ush', 'u', 's')
            ->leftJoin('ush.user', 'u')
            ->leftJoin('ush.status', 's')
            ->andWhere('ush.status = :statusId')
            ->andWhere('ush.endDate IS NULL')
            ->setParameter('statusId', $statusId)
            ->orderBy('ush.startDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find status histories within a date range with eager loading
     * @return UserStatusHistory[]
     */
    public function findByDateRange(\DateTime $startDate, \DateTime $endDate): array
    {
        return $this->createQueryBuilder('ush')
            ->select('ush', 'u', 's')
            ->leftJoin('ush.user', 'u')
            ->leftJoin('ush.status', 's')
            ->andWhere('ush.startDate >= :startDate')
            ->andWhere('(ush.endDate <= :endDate OR ush.endDate IS NULL)')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('ush.startDate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find status histories by user and status with eager loading
     * @return UserStatusHistory[]
     */
    public function findByUserAndStatus($userId, $statusId): array
    {
        return $this->createQueryBuilder('ush')
            ->select('ush', 'u', 's')
            ->leftJoin('ush.user', 'u')
            ->leftJoin('ush.status', 's')
            ->andWhere('ush.user = :userId')
            ->andWhere('ush.status = :statusId')
            ->setParameter('userId', $userId)
            ->setParameter('statusId', $statusId)
            ->orderBy('ush.startDate', 'DESC')
            ->getQuery()
            ->getResult();
    }
} 