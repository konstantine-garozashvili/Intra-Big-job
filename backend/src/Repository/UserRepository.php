<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    /**
     * Find all users with eager loading of common related entities
     * This prevents N+1 query problems when accessing related entities
     * 
     * @return User[] Returns an array of User objects with related entities
     */
    public function findAllWithRelations(): array
    {
        return $this->createQueryBuilder('u')
            ->select('u', 'n', 't', 'ur', 'r', 's')
            ->leftJoin('u.nationality', 'n')
            ->leftJoin('u.theme', 't')
            ->leftJoin('u.userRoles', 'ur')
            ->leftJoin('ur.role', 'r')
            ->leftJoin('u.specialization', 's')
            ->orderBy('u.lastName', 'ASC')
            ->addOrderBy('u.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find a single user with all related entities loaded
     * 
     * @param int $id User ID
     * @return User|null User with related entities or null
     */
    public function findOneWithAllRelations(int $id): ?User
    {
        return $this->createQueryBuilder('u')
            ->select('u', 'n', 't', 'ur', 'r', 's', 'ud', 'd', 'a', 'sp')
            ->leftJoin('u.nationality', 'n')
            ->leftJoin('u.theme', 't')
            ->leftJoin('u.userRoles', 'ur')
            ->leftJoin('ur.role', 'r')
            ->leftJoin('u.specialization', 's')
            ->leftJoin('u.userDiplomas', 'ud')
            ->leftJoin('ud.diploma', 'd')
            ->leftJoin('u.addresses', 'a')
            ->leftJoin('u.studentProfile', 'sp')
            ->andWhere('u.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find users by role with eager loading of related entities
     * 
     * @param string $roleName Role name
     * @return User[] Returns an array of User objects with the specified role
     */
    public function findByRoleWithRelations(string $roleName): array
    {
        return $this->createQueryBuilder('u')
            ->select('u', 'n', 't', 'ur', 'r', 's')
            ->leftJoin('u.nationality', 'n')
            ->leftJoin('u.theme', 't')
            ->leftJoin('u.userRoles', 'ur')
            ->leftJoin('ur.role', 'r')
            ->leftJoin('u.specialization', 's')
            ->andWhere('r.name = :roleName')
            ->setParameter('roleName', $roleName)
            ->orderBy('u.lastName', 'ASC')
            ->addOrderBy('u.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find users by specialization with eager loading of related entities
     * 
     * @param int $specializationId Specialization ID
     * @return User[] Returns an array of User objects with the specified specialization
     */
    public function findBySpecializationWithRelations(int $specializationId): array
    {
        return $this->createQueryBuilder('u')
            ->select('u', 'n', 't', 'ur', 'r', 's')
            ->leftJoin('u.nationality', 'n')
            ->leftJoin('u.theme', 't')
            ->leftJoin('u.userRoles', 'ur')
            ->leftJoin('ur.role', 'r')
            ->leftJoin('u.specialization', 's')
            ->andWhere('u.specialization = :specializationId')
            ->setParameter('specializationId', $specializationId)
            ->orderBy('u.lastName', 'ASC')
            ->addOrderBy('u.firstName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    //    /**
    //     * @return User[] Returns an array of User objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('u.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?User
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
