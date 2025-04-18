<?php

namespace App\Repository;

use App\Entity\Address;
use App\Entity\City;
use App\Entity\PostalCode;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Address>
 *
 * @method Address|null find($id, $lockMode = null, $lockVersion = null)
 * @method Address|null findOneBy(array $criteria, array $orderBy = null)
 * @method Address[]    findAll()
 * @method Address[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AddressRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Address::class);
    }
    
    /**
     * Find a postal code by ID
     */
    public function findPostalCode(int $id): ?PostalCode
    {
        return $this->getEntityManager()
            ->getRepository(PostalCode::class)
            ->find($id);
    }
    
    /**
     * Find a city by ID
     */
    public function findCity(int $id): ?City
    {
        return $this->getEntityManager()
            ->getRepository(City::class)
            ->find($id);
    }
} 