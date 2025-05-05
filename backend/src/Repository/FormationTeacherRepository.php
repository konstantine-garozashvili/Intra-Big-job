<?php

namespace App\Repository;

use App\Entity\FormationTeacher;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FormationTeacher>
 *
 * @method FormationTeacher|null find($id, $lockMode = null, $lockVersion = null)
 * @method FormationTeacher|null findOneBy(array $criteria, array $orderBy = null)
 * @method FormationTeacher[]    findAll()
 * @method FormationTeacher[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FormationTeacherRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FormationTeacher::class);
    }

    public function findMainTeacherByFormation(int $formationId): ?FormationTeacher
    {
        return $this->createQueryBuilder('ft')
            ->andWhere('ft.formation = :formationId')
            ->andWhere('ft.isMainTeacher = true')
            ->setParameter('formationId', $formationId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findTeachersByFormation(int $formationId): array
    {
        return $this->createQueryBuilder('ft')
            ->andWhere('ft.formation = :formationId')
            ->setParameter('formationId', $formationId)
            ->getQuery()
            ->getResult();
    }

    public function findFormationsByTeacher(int $userId): array
    {
        return $this->createQueryBuilder('ft')
            ->andWhere('ft.user = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getResult();
    }

    public function countTotalTeachers(): int
    {
        return $this->createQueryBuilder('ft')
            ->select('COUNT(DISTINCT ft.user)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countTotalFormations(): int
    {
        return $this->createQueryBuilder('ft')
            ->select('COUNT(DISTINCT ft.formation)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countMainTeachers(): int
    {
        return $this->createQueryBuilder('ft')
            ->select('COUNT(ft.id)')
            ->andWhere('ft.isMainTeacher = true')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getTeachersPerFormationStats(): array
    {
        $results = $this->createQueryBuilder('ft')
            ->select('f.id', 'f.name', 'COUNT(ft.id) as teacherCount')
            ->leftJoin('ft.formation', 'f')
            ->groupBy('f.id')
            ->getQuery()
            ->getResult();

        return array_map(function($row) {
            return [
                'formation_id' => $row['id'],
                'formation_name' => $row['name'],
                'teacher_count' => $row['teacherCount']
            ];
        }, $results);
    }
} 