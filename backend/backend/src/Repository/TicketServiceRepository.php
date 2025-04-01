<?php

namespace App\Repository;

use App\Entity\TicketService;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TicketService>
 *
 * @method TicketService|null find($id, $lockMode = null, $lockVersion = null)
 * @method TicketService|null findOneBy(array $criteria, array $orderBy = null)
 * @method TicketService[]    findAll()
 * @method TicketService[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TicketServiceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TicketService::class);
    }

    public function save(TicketService $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(TicketService $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
} 