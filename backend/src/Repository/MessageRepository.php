<?php

namespace App\Repository;

use App\Entity\Message;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Message>
 *
 * @method Message|null find($id, $lockMode = null, $lockVersion = null)
 * @method Message|null findOneBy(array $criteria, array $orderBy = null)
 * @method Message[]    findAll()
 * @method Message[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    /**
     * Find global messages with pagination
     *
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function findGlobalMessages(int $limit = 50, int $offset = 0): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.isGlobal = :isGlobal')
            ->setParameter('isGlobal', true)
            ->orderBy('m.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find recent messages (last 24 hours)
     *
     * @return array
     */
    public function findRecentMessages(): array
    {
        $yesterday = new \DateTimeImmutable('-24 hours');
        
        return $this->createQueryBuilder('m')
            ->where('m.createdAt >= :yesterday')
            ->setParameter('yesterday', $yesterday)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find unread messages for a user
     *
     * @param int $userId
     * @return array
     */
    public function findUnreadMessagesForUser(int $userId): array
    {
        $qb = $this->createQueryBuilder('m');
        
        return $qb->where('m.isGlobal = :isGlobal')
            ->andWhere($qb->expr()->notIn(':userId', 'm.readBy'))
            ->setParameter('isGlobal', true)
            ->setParameter('userId', $userId)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
