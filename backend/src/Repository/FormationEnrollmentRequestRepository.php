<?php

namespace App\Repository;

use App\Entity\FormationEnrollmentRequest;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FormationEnrollmentRequest>
 *
 * @method FormationEnrollmentRequest|null find($id, $lockMode = null, $lockVersion = null)
 * @method FormationEnrollmentRequest|null findOneBy(array $criteria, array $orderBy = null)
 * @method FormationEnrollmentRequest[]    findAll()
 * @method FormationEnrollmentRequest[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FormationEnrollmentRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FormationEnrollmentRequest::class);
    }

    public function save(FormationEnrollmentRequest $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(FormationEnrollmentRequest $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Find pending enrollment requests for a formation
     */
    public function findPendingByFormation($formationId): array
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.formation = :formationId')
            ->andWhere('e.status IS NULL')
            ->setParameter('formationId', $formationId)
            ->orderBy('e.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find enrollment requests by user
     */
    public function findByUser($userId): array
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.user = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('e.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
} 