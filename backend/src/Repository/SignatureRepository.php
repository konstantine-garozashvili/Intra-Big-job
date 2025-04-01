<?php

namespace App\Repository;

use App\Entity\Signature;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Signature>
 *
 * @method Signature|null find($id, $lockMode = null, $lockVersion = null)
 * @method Signature|null findOneBy(array $criteria, array $orderBy = null)
 * @method Signature[]    findAll()
 * @method Signature[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SignatureRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Signature::class);
    }

    /**
     * Find signatures by user
     */
    public function findByUser(User $user)
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.user = :user')
            ->setParameter('user', $user)
            ->orderBy('s.date', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find recent signatures
     */
    public function findRecent(\DateTimeImmutable $since = null)
    {
        if (!$since) {
            // Default to signatures from the last 24 hours
            $since = new \DateTimeImmutable('-24 hours');
        }

        return $this->createQueryBuilder('s')
            ->andWhere('s.date >= :since')
            ->setParameter('since', $since)
            ->orderBy('s.date', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
