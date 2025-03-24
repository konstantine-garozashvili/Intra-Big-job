<?php

namespace App\Domains\Global\Document\Repository;

use App\Domains\Global\Document\Entity\DocumentHistory;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DocumentHistory>
 *
 * @method DocumentHistory|null find($id, $lockMode = null, $lockVersion = null)
 * @method DocumentHistory|null findOneBy(array $criteria, array $orderBy = null)
 * @method DocumentHistory[]    findAll()
 * @method DocumentHistory[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DocumentHistoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DocumentHistory::class);
    }

    /**
     * @return DocumentHistory[] Returns an array of DocumentHistory objects by document
     */
    public function findByDocument($documentId): array
    {
        return $this->createQueryBuilder('dh')
            ->andWhere('dh.document = :documentId')
            ->setParameter('documentId', $documentId)
            ->orderBy('dh.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return DocumentHistory[] Returns an array of DocumentHistory objects by user
     */
    public function findByUser($userId): array
    {
        return $this->createQueryBuilder('dh')
            ->andWhere('dh.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('dh.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return DocumentHistory[] Returns an array of DocumentHistory objects by action
     */
    public function findByAction(string $action): array
    {
        return $this->createQueryBuilder('dh')
            ->andWhere('dh.action = :action')
            ->setParameter('action', $action)
            ->orderBy('dh.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return DocumentHistory[] Returns an array of recent DocumentHistory objects
     */
    public function findRecent(int $limit = 10): array
    {
        return $this->createQueryBuilder('dh')
            ->orderBy('dh.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
} 