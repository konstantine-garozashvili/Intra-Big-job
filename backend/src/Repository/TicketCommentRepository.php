<?php

namespace App\Repository;

use App\Entity\TicketComment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TicketComment>
 *
 * @method TicketComment|null find($id, $lockMode = null, $lockVersion = null)
 * @method TicketComment|null findOneBy(array $criteria, array $orderBy = null)
 * @method TicketComment[]    findAll()
 * @method TicketComment[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TicketCommentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TicketComment::class);
    }

    public function save(TicketComment $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(TicketComment $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find comments by ticket ID ordered by created date
     */
    public function findByTicket(int $ticketId): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.ticket = :ticketId')
            ->setParameter('ticketId', $ticketId)
            ->orderBy('c.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
} 