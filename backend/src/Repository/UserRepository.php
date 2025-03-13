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
    public function findAutocompleteResults(string $searchTerm, ?array $allowedRoles = null): array
    {
        // Create the query builder
        $qb = $this->createQueryBuilder('u')
            ->where('u.lastName LIKE :term OR u.firstName LIKE :term')
            ->setParameter('term', '%' . $searchTerm . '%')
            ->orderBy('u.lastName', 'ASC')
            ->setMaxResults(10);
    
        // // If roles are defined, filter users based on allowed roles
        // if ($allowedRoles !== null && count($allowedRoles) > 0) {
        //     $qb->join('u.userRoles', 'ur')
        //         ->andWhere('u.id = ur.user')
        //         ->andWhere('ur.role IN (:allowedRoles)') // Match role from user_role
        //         ->setParameter('allowedRoles', $allowedRoles);
        // }
        return $qb->getQuery()->getResult();
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
