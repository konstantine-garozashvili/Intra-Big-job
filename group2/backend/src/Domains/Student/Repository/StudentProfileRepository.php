<?php

namespace App\Domains\Student\Repository;

use App\Domains\Student\Entity\StudentProfile;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<StudentProfile>
 *
 * @method StudentProfile|null find($id, $lockMode = null, $lockVersion = null)
 * @method StudentProfile|null findOneBy(array $criteria, array $orderBy = null)
 * @method StudentProfile[]    findAll()
 * @method StudentProfile[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class StudentProfileRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StudentProfile::class);
    }

    public function save(StudentProfile $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(StudentProfile $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
    
    /**
     * Find all student profiles with eager loading of related entities
     * 
     * @return StudentProfile[] Returns an array of StudentProfile objects with related entities
     */
    public function findAllWithRelations(): array
    {
        return $this->createQueryBuilder('sp')
            ->select('sp', 'u', 'st')
            ->leftJoin('sp.user', 'u')
            ->leftJoin('sp.situationType', 'st')
            ->orderBy('sp.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
    
    /**
     * Find a student profile by user ID with eager loading
     * 
     * @param int $userId User ID
     * @return StudentProfile|null StudentProfile with related entities or null
     */
    public function findByUserWithRelations(int $userId): ?StudentProfile
    {
        return $this->createQueryBuilder('sp')
            ->select('sp', 'u', 'st')
            ->leftJoin('sp.user', 'u')
            ->leftJoin('sp.situationType', 'st')
            ->andWhere('u.id = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getOneOrNullResult();
    }
    
    /**
     * Find student profiles by situation type with eager loading
     * 
     * @param int $situationTypeId Situation type ID
     * @return StudentProfile[] Returns an array of StudentProfile objects with the specified situation type
     */
    public function findBySituationTypeWithRelations(int $situationTypeId): array
    {
        return $this->createQueryBuilder('sp')
            ->select('sp', 'u', 'st')
            ->leftJoin('sp.user', 'u')
            ->leftJoin('sp.situationType', 'st')
            ->andWhere('sp.situationType = :situationTypeId')
            ->setParameter('situationTypeId', $situationTypeId)
            ->orderBy('sp.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
    
    /**
     * Find student profiles seeking internship with eager loading
     * 
     * @return StudentProfile[] Returns an array of StudentProfile objects seeking internship
     */
    public function findSeekingInternshipWithRelations(): array
    {
        return $this->createQueryBuilder('sp')
            ->select('sp', 'u', 'st')
            ->leftJoin('sp.user', 'u')
            ->leftJoin('sp.situationType', 'st')
            ->andWhere('sp.isSeekingInternship = :isSeekingInternship')
            ->setParameter('isSeekingInternship', true)
            ->orderBy('sp.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
    
    /**
     * Find student profiles seeking apprenticeship with eager loading
     * 
     * @return StudentProfile[] Returns an array of StudentProfile objects seeking apprenticeship
     */
    public function findSeekingApprenticeshipWithRelations(): array
    {
        return $this->createQueryBuilder('sp')
            ->select('sp', 'u', 'st')
            ->leftJoin('sp.user', 'u')
            ->leftJoin('sp.situationType', 'st')
            ->andWhere('sp.isSeekingApprenticeship = :isSeekingApprenticeship')
            ->setParameter('isSeekingApprenticeship', true)
            ->orderBy('sp.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
} 