<?php

namespace App\Domains\Global\Notification\Repository;

use App\Domains\Global\Notification\Entity\Notification;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notification>
 *
 * @method Notification|null find($id, $lockMode = null, $lockVersion = null)
 * @method Notification|null findOneBy(array $criteria, array $orderBy = null)
 * @method Notification[]    findAll()
 * @method Notification[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    /**
     * Find notifications by user
     *
     * @param int $userId The user ID
     * @param int|null $limit Optional limit
     * @param bool $includeRead Whether to include read notifications
     * @return Notification[] Returns an array of Notification objects
     */
    public function findByUser(int $userId, ?int $limit = null, bool $includeRead = true): array
    {
        $qb = $this->createQueryBuilder('n')
            ->andWhere('n.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('n.createdAt', 'DESC');

        if (!$includeRead) {
            $qb->andWhere('n.isRead = :isRead')
                ->setParameter('isRead', false);
        }

        if ($limit !== null) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * Find unread notifications by user
     *
     * @param int $userId The user ID
     * @param int|null $limit Optional limit
     * @return Notification[] Returns an array of unread Notification objects
     */
    public function findUnreadByUser(int $userId, ?int $limit = null): array
    {
        return $this->findByUser($userId, $limit, false);
    }

    /**
     * Count unread notifications for a user
     *
     * @param int $userId The user ID
     * @return int Number of unread notifications
     */
    public function countUnreadByUser(int $userId): int
    {
        return $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->andWhere('n.user = :userId')
            ->andWhere('n.isRead = :isRead')
            ->setParameter('userId', $userId)
            ->setParameter('isRead', false)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Mark notifications as read for a user
     *
     * @param int $userId The user ID
     * @param array|null $notificationIds Optional array of notification IDs to mark as read
     * @return int Number of updated notifications
     */
    public function markAsRead(int $userId, ?array $notificationIds = null): int
    {
        $qb = $this->getEntityManager()->createQueryBuilder()
            ->update(Notification::class, 'n')
            ->set('n.isRead', ':isRead')
            ->set('n.readAt', ':readAt')
            ->where('n.user = :userId')
            ->andWhere('n.isRead = :notRead')
            ->setParameter('isRead', true)
            ->setParameter('readAt', new \DateTime())
            ->setParameter('userId', $userId)
            ->setParameter('notRead', false);

        if ($notificationIds !== null && count($notificationIds) > 0) {
            $qb->andWhere('n.id IN (:ids)')
                ->setParameter('ids', $notificationIds);
        }

        return $qb->getQuery()->execute();
    }
} 