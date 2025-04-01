<?php

namespace App\Repository;

use App\Entity\UserStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserStatus>
 *
 * @method UserStatus|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserStatus|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserStatus[]    findAll()
 * @method UserStatus[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserStatusRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserStatus::class);
    }

    /**
     * @return UserStatus[] Returns an array of UserStatus objects by role
     */
    public function findByRole($roleId): array
    {
        return $this->createQueryBuilder('us')
            ->andWhere('us.associatedRole = :roleId')
            ->setParameter('roleId', $roleId)
            ->orderBy('us.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find a status by its name
     */
    public function findByName(string $name): ?UserStatus
    {
        return $this->createQueryBuilder('us')
            ->andWhere('us.name = :name')
            ->setParameter('name', $name)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find all statuses associated with a set of roles
     * @param array $roleIds
     * @return UserStatus[]
     */
    public function findByRoles(array $roleIds): array
    {
        return $this->createQueryBuilder('us')
            ->andWhere('us.associatedRole IN (:roleIds)')
            ->setParameter('roleIds', $roleIds)
            ->orderBy('us.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
} 