<?php

namespace App\Repository;

use App\Entity\UserSituationType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserSituationType>
 *
 * @method UserSituationType|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserSituationType|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserSituationType[]    findAll()
 * @method UserSituationType[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserSituationTypeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserSituationType::class);
    }

    public function save(UserSituationType $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(UserSituationType $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
} 