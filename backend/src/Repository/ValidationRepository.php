<?php

namespace App\Repository;

use App\Entity\Signature;
use App\Entity\User;
use App\Entity\Validation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Validation>
 *
 * @method Validation|null find($id, $lockMode = null, $lockVersion = null)
 * @method Validation|null findOneBy(array $criteria, array $orderBy = null)
 * @method Validation[]    findAll()
 * @method Validation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ValidationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Validation::class);
    }

    /**
     * Find validations by validator
     */
    public function findByValidator(User $validator)
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.validator = :validator')
            ->setParameter('validator', $validator)
            ->orderBy('v.date', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find validations by signature
     */
    public function findBySignature(Signature $signature)
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.signature = :signature')
            ->setParameter('signature', $signature)
            ->orderBy('v.date', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find recent validations
     */
    public function findRecent(\DateTimeImmutable $since = null)
    {
        if (!$since) {
            // Default to validations from the last 24 hours
            $since = new \DateTimeImmutable('-24 hours');
        }

        return $this->createQueryBuilder('v')
            ->andWhere('v.date >= :since')
            ->setParameter('since', $since)
            ->orderBy('v.date', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
