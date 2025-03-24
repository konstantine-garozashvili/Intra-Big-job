<?php

namespace App\Domains\Global\Document\Repository;

use App\Domains\Global\Document\Entity\DocumentCategory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DocumentCategory>
 *
 * @method DocumentCategory|null find($id, $lockMode = null, $lockVersion = null)
 * @method DocumentCategory|null findOneBy(array $criteria, array $orderBy = null)
 * @method DocumentCategory[]    findAll()
 * @method DocumentCategory[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DocumentCategoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DocumentCategory::class);
    }

    /**
     * @return DocumentCategory[] Returns an array of active DocumentCategory objects
     */
    public function findActive(): array
    {
        return $this->createQueryBuilder('dc')
            ->andWhere('dc.isActive = :isActive')
            ->setParameter('isActive', true)
            ->orderBy('dc.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return DocumentCategory[] Returns an array of DocumentCategory objects with active document types
     */
    public function findWithActiveDocumentTypes(): array
    {
        return $this->createQueryBuilder('dc')
            ->join('dc.documentTypes', 'dt')
            ->andWhere('dc.isActive = :isActive')
            ->andWhere('dt.isActive = :dtIsActive')
            ->setParameter('isActive', true)
            ->setParameter('dtIsActive', true)
            ->orderBy('dc.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find a category by its code
     */
    public function findByCode(string $code): ?DocumentCategory
    {
        return $this->createQueryBuilder('dc')
            ->andWhere('dc.code = :code')
            ->setParameter('code', $code)
            ->getQuery()
            ->getOneOrNullResult();
    }
} 