<?php

namespace App\Repository;

use App\Entity\Formation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Formation>
 *
 * @method Formation|null find($id, $lockMode = null, $lockVersion = null)
 * @method Formation|null findOneBy(array $criteria, array $orderBy = null)
 * @method Formation[]    findAll()
 * @method Formation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FormationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Formation::class);
    }

    public function searchByName(?string $search, int $limit, int $offset): array
    {
        $qb = $this->createQueryBuilder('f')
            ->orderBy('f.id', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ($search) {
            $qb->andWhere('LOWER(f.name) LIKE :search')
               ->setParameter('search', '%' . strtolower($search) . '%');
        }

        return $qb->getQuery()->getResult();
    }

    public function countByName(?string $search): int
    {
        $qb = $this->createQueryBuilder('f')
            ->select('COUNT(f.id)');

        if ($search) {
            $qb->andWhere('LOWER(f.name) LIKE :search')
               ->setParameter('search', '%' . strtolower($search) . '%');
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
} 