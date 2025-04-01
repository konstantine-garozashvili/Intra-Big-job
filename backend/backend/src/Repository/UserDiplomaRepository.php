<?php

namespace App\Repository;

use App\Entity\UserDiploma;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserDiploma>
 */
class UserDiplomaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserDiploma::class);
    }

    /**
     * Find all user diplomas with eager loading of related entities
     * 
     * @param User $user The user to find diplomas for
     * @return UserDiploma[] Returns an array of UserDiploma objects with related entities
     */
    public function findByUserWithRelations(User $user): array
    {
        return $this->createQueryBuilder('ud')
            ->select('ud', 'd')
            ->leftJoin('ud.diploma', 'd')
            ->andWhere('ud.user = :user')
            ->setParameter('user', $user)
            ->orderBy('ud.obtainedDate', 'DESC')
            ->getQuery()
            ->getResult();
    }
} 