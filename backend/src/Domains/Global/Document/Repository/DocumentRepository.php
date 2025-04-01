<?php

namespace App\Domains\Global\Document\Repository;

use App\Domains\Global\Document\Entity\Document;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Document>
 *
 * @method Document|null find($id, $lockMode = null, $lockVersion = null)
 * @method Document|null findOneBy(array $criteria, array $orderBy = null)
 * @method Document[]    findAll()
 * @method Document[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DocumentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Document::class);
    }

    /**
     * @return Document[] Returns an array of Document objects
     */
    public function findByUser($userId): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('d.uploadedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Document[] Returns an array of Document objects
     */
    public function findByStatus(string $status): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.status = :status')
            ->setParameter('status', $status)
            ->orderBy('d.uploadedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Document[] Returns an array of Document objects
     */
    public function findByUserAndStatus($userId, string $status): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.user = :userId')
            ->andWhere('d.status = :status')
            ->setParameter('userId', $userId)
            ->setParameter('status', $status)
            ->orderBy('d.uploadedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Document[] Returns an array of Document objects
     */
    public function findByDocumentType($documentTypeId): array
    {
        return $this->createQueryBuilder('d')
            ->andWhere('d.documentType = :documentTypeId')
            ->setParameter('documentTypeId', $documentTypeId)
            ->orderBy('d.uploadedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
} 