<?php

namespace App\Repository;

use App\Entity\Nationality;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Nationality>
 *
 * @method Nationality|null find($id, $lockMode = null, $lockVersion = null)
 * @method Nationality|null findOneBy(array $criteria, array $orderBy = null)
 * @method Nationality[]    findAll()
 * @method Nationality[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class NationalityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Nationality::class);
    }
} 