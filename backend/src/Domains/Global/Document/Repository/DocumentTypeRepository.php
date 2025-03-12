<?php

namespace App\Domains\Global\Document\Repository;

use App\Domains\Global\Document\Entity\DocumentType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DocumentType>
 *
 * @method DocumentType|null find($id, $lockMode = null, $lockVersion = null)
 * @method DocumentType|null findOneBy(array $criteria, array $orderBy = null)
 * @method DocumentType[]    findAll()
 * @method DocumentType[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DocumentTypeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DocumentType::class);
    }

    /**
     * @return DocumentType[] Returns an array of active DocumentType objects
     */
    public function findActive(): array
    {
        return $this->createQueryBuilder('dt')
            ->andWhere('dt.isActive = :isActive')
            ->setParameter('isActive', true)
            ->orderBy('dt.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return DocumentType[] Returns an array of DocumentType objects by category
     */
    public function findByCategory($categoryId): array
    {
        return $this->createQueryBuilder('dt')
            ->join('dt.categories', 'c')
            ->andWhere('c.id = :categoryId')
            ->andWhere('dt.isActive = :isActive')
            ->setParameter('categoryId', $categoryId)
            ->setParameter('isActive', true)
            ->orderBy('dt.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return DocumentType[] Returns an array of required DocumentType objects
     */
    public function findRequired(): array
    {
        return $this->createQueryBuilder('dt')
            ->andWhere('dt.isRequired = :isRequired')
            ->andWhere('dt.isActive = :isActive')
            ->setParameter('isRequired', true)
            ->setParameter('isActive', true)
            ->orderBy('dt.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return DocumentType[] Returns an array of DocumentType objects with approaching deadlines
     */
    public function findWithApproachingDeadlines(): array
    {
        $now = new \DateTime();
        $futureDate = (new \DateTime())->modify('+30 days');

        return $this->createQueryBuilder('dt')
            ->andWhere('dt.deadlineAt IS NOT NULL')
            ->andWhere('dt.deadlineAt BETWEEN :now AND :futureDate')
            ->andWhere('dt.isActive = :isActive')
            ->setParameter('now', $now)
            ->setParameter('futureDate', $futureDate)
            ->setParameter('isActive', true)
            ->orderBy('dt.deadlineAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
} 