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
     */
    public function findGlobalMessages(int $limit = 50, int $offset = 0)
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.isGlobal = :isGlobal')
            ->setParameter('isGlobal', true)
            ->orderBy('m.createdAt', 'ASC')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find recent global messages
     */
    public function findRecentGlobalMessages(int $limit = 20)
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.isGlobal = :isGlobal')
            ->setParameter('isGlobal', true)
            ->orderBy('m.createdAt', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find messages older than a specific date
     */
    public function findMessagesOlderThan(\DateTimeInterface $date): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.createdAt < :date')
            ->setParameter('date', $date)
            ->getQuery()
            ->getResult();
    }
}
