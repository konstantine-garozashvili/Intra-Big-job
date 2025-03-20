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
        // Normalize search term for role name matching
        $normalizedSearchTerm = strtolower(trim($searchTerm));
        
        // Get role alias from centralized function
        $roleSearchTerm = $this->matchRoleFromSearchTerm($normalizedSearchTerm);
        
        // Create the base query builder - using the simplest approach
        $qb = $this->createQueryBuilder('u')
            ->select('u')
            ->leftJoin('u.userRoles', 'ur')
            ->leftJoin('ur.role', 'r');
        
        // Build the query based on whether we have a role alias match
        if ($roleSearchTerm) {
            // If we have a role alias match, search for users with that role
            $qb->where('r.name = :roleName')
               ->orWhere('u.lastName LIKE :term OR u.firstName LIKE :term')
               ->setParameter('roleName', $roleSearchTerm)
               ->setParameter('term', '%' . $searchTerm . '%');
        } else {
            // Standard search for names or role names
            $qb->where('u.lastName LIKE :term OR u.firstName LIKE :term OR LOWER(r.name) LIKE :roleTerm')
               ->setParameter('term', '%' . $searchTerm . '%')
               ->setParameter('roleTerm', '%' . $normalizedSearchTerm . '%');
        }
        
        // Apply role filtering if specified
        if ($allowedRoles !== null && count($allowedRoles) > 0) {
            // Add a role filter condition
            $qb->andWhere('r.name IN (:roleNames)')
               ->setParameter('roleNames', $allowedRoles);
        }
        
        // Finalize and execute the query
        $qb->orderBy('u.lastName', 'ASC')
           ->setMaxResults(20); // Increase max results for better chances of finding matches
           
        // Execute the query and handle duplicates manually
        $results = $qb->getQuery()->getResult();
        
        // Remove duplicates manually
        $uniqueUsers = [];
        $uniqueIds = [];
        
        foreach ($results as $user) {
            if (!in_array($user->getId(), $uniqueIds)) {
                $uniqueIds[] = $user->getId();
                $uniqueUsers[] = $user;
                
                // If we're doing a role search, prioritize users with that role
                if ($roleSearchTerm) {
                    $hasRole = false;
                    foreach ($user->getUserRoles() as $userRole) {
                        if ($userRole->getRole()->getName() === $roleSearchTerm) {
                            $hasRole = true;
                            break;
                        }
                    }
                    
                    // Move users with the role to the beginning of the array
                    if ($hasRole && count($uniqueUsers) > 1) {
                        $userWithRole = array_pop($uniqueUsers);
                        array_unshift($uniqueUsers, $userWithRole);
                    }
                }
            }
        }
        
        return $uniqueUsers;
    }
    
    /**
     * Match a search term to a role name using various matching strategies
     * @param string $searchTerm - The search term to check
     * @return string|null - The matched role name or null if no match
     */
    private function matchRoleFromSearchTerm(string $searchTerm): ?string
    {
        // Role alias mapping (for translation and common terms)
        $roleAliases = [
            // Super Admin aliases
            'superadmin' => 'SUPER_ADMIN',
            'super admin' => 'SUPER_ADMIN',
            'super' => 'SUPER_ADMIN',
            
            // Student aliases
            'etudiant' => 'STUDENT',
            'étudiant' => 'STUDENT',
            'etud' => 'STUDENT',
            'étud' => 'STUDENT',
            'student' => 'STUDENT', // Keep English for compatibility
            
            // Admin aliases
            'admin' => 'ADMIN',
            'adm' => 'ADMIN',
            
            // Teacher aliases
            'formateur' => 'TEACHER',
            'forma' => 'TEACHER',
            'form' => 'TEACHER',
            
            // HR aliases
            'ressources humaines' => 'HR',
            'ressources' => 'HR',
            'rh' => 'HR',
            
            // Guest aliases
            'invité' => 'GUEST',
            'invite' => 'GUEST',
            'inv' => 'GUEST',
            
            // Recruiter aliases
            'recruteur' => 'RECRUITER',
            'recru' => 'RECRUITER',
            'rec' => 'RECRUITER'
        ];
        
        // Check if the search term matches any role alias - improved detection with more lenient matching
        $roleSearchTerm = null;
        
        // First try exact match
        if (isset($roleAliases[$searchTerm])) {
            $roleSearchTerm = $roleAliases[$searchTerm];
        } else {
            // Then try word boundary match
            foreach ($roleAliases as $alias => $roleName) {
                if (preg_match('/\b' . preg_quote($alias, '/') . '\b/i', $searchTerm)) {
                    $roleSearchTerm = $roleName;
                    break;
                }
            }
            
            // If still no match, try partial match (starts with)
            if (!$roleSearchTerm) {
                foreach ($roleAliases as $alias => $roleName) {
                    if (strpos($alias, $searchTerm) === 0 || strpos($searchTerm, $alias) === 0) {
                        $roleSearchTerm = $roleName;
                        break;
                    }
                }
            }
            
            // If still no match, try contains match
            if (!$roleSearchTerm) {
                foreach ($roleAliases as $alias => $roleName) {
                    if (strpos($alias, $searchTerm) !== false || strpos($searchTerm, $alias) !== false) {
                        $roleSearchTerm = $roleName;
                        break;
                    }
                }
            }
        }
        
        // Map standardized role names to database role names
        if ($roleSearchTerm) {
            // Map from standardized format to database format
            $roleNameMapping = [
                'SUPER_ADMIN' => 'SUPERADMIN',
                // Add other mappings if needed
            ];
            
            if (isset($roleNameMapping[$roleSearchTerm])) {
                $roleSearchTerm = $roleNameMapping[$roleSearchTerm];
            }
        }
        
        return $roleSearchTerm;
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

    /**
     * Find all users with their roles for admin dashboard
     * 
     * @return array Returns an array of User objects with their roles
     */
    public function findAllWithRoles(): array
    {
        $users = $this->createQueryBuilder('u')
            ->select('u', 'ur', 'r')
            ->leftJoin('u.userRoles', 'ur')
            ->leftJoin('ur.role', 'r')
            ->orderBy('u.lastName', 'ASC')
            ->addOrderBy('u.firstName', 'ASC')
            ->getQuery()
            ->getResult();
            
        $result = [];
        
        foreach ($users as $user) {
            $roles = [];
            foreach ($user->getUserRoles() as $userRole) {
                $roles[] = [
                    'id' => $userRole->getRole()->getId(),
                    'name' => $userRole->getRole()->getName(),
                ];
            }
            
            $userData = [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'phoneNumber' => $user->getPhoneNumber(),
                'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
                'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'roles' => $roles
            ];
            
            $result[] = $userData;
        }
        
        return $result;
    }

    /**
     * Find all users except the specified one
     * 
     * @param int $userId ID of the user to exclude
     * @return User[] Returns an array of User objects except the specified one
     */
    public function findAllExcept(int $userId): array
    {
        return $this->createQueryBuilder('u')
            ->select('u', 'n', 't', 'ur', 'r')
            ->leftJoin('u.nationality', 'n')
            ->leftJoin('u.theme', 't')
            ->leftJoin('u.userRoles', 'ur')
            ->leftJoin('ur.role', 'r')
            ->where('u.id != :userId')
            ->setParameter('userId', $userId)
            ->orderBy('u.firstName', 'ASC')
            ->addOrderBy('u.lastName', 'ASC')
            ->getQuery()
            ->getResult();
    }
}