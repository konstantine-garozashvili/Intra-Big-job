<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Role;
use App\Entity\UserRole;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UserRoleService
{
    private EntityManagerInterface $entityManager;
    
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }
    
    /**
     * Récupère tous les utilisateurs avec un rôle spécifique
     */
    public function getUsersByRole(string $roleName): array
    {
        $role = $this->entityManager->getRepository(Role::class)->findOneBy(['name' => $roleName]);
        
        if (!$role) {
            throw new NotFoundHttpException(sprintf('Le rôle "%s" n\'existe pas.', $roleName));
        }
        
        // Récupérer tous les UserRole liés à ce rôle
        $userRoles = $this->entityManager->getRepository(UserRole::class)->findBy(['role' => $role]);
        
        // Récupérer les utilisateurs correspondants
        $users = [];
        foreach ($userRoles as $userRole) {
            $user = $userRole->getUser();
            $userData = [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'phoneNumber' => $user->getPhoneNumber(),
                'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
                'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null
            ];
            
            // Ajouter les rôles de l'utilisateur
            $userRolesData = [];
            foreach ($user->getUserRoles() as $ur) {
                $userRolesData[] = [
                    'id' => $ur->getRole()->getId(),
                    'name' => $ur->getRole()->getName()
                ];
            }
            $userData['roles'] = $userRolesData;
            
            $users[] = $userData;
        }
        
        return $users;
    }
    
    /**
     * Change le rôle d'un utilisateur
     */
    public function changeUserRole(int $userId, string $oldRoleName, string $newRoleName): void
    {
        $user = $this->entityManager->getRepository(User::class)->find($userId);
        
        if (!$user) {
            throw new NotFoundHttpException(sprintf('L\'utilisateur avec ID "%d" n\'existe pas.', $userId));
        }
        
        // Vérifier si l'utilisateur a déjà ce rôle
        $newRoleCriteria = $this->buildRoleNameCriteria($newRoleName);
        $existingRole = $this->entityManager->getRepository(Role::class)
            ->createQueryBuilder('r')
            ->innerJoin('r.userRoles', 'ur')
            ->where('ur.user = :user')
            ->andWhere('(LOWER(r.name) = LOWER(:name1) OR LOWER(r.name) = LOWER(:name2))')
            ->setParameter('user', $user)
            ->setParameter('name1', $newRoleCriteria['simple'])
            ->setParameter('name2', $newRoleCriteria['prefixed'])
            ->getQuery()
            ->getOneOrNullResult();

        if ($existingRole) {
            throw new \InvalidArgumentException('L\'utilisateur possède déjà ce rôle.');
        }
        
        // Rechercher l'ancien rôle avec différentes variations du nom
        $oldRoleCriteria = $this->buildRoleNameCriteria($oldRoleName);
        $oldRole = $this->entityManager->getRepository(Role::class)
            ->createQueryBuilder('r')
            ->where('LOWER(r.name) = LOWER(:name1) OR LOWER(r.name) = LOWER(:name2)')
            ->setParameter('name1', $oldRoleCriteria['simple'])
            ->setParameter('name2', $oldRoleCriteria['prefixed'])
            ->getQuery()
            ->getOneOrNullResult();
        
        // Rechercher le nouveau rôle avec différentes variations du nom
        $newRoleCriteria = $this->buildRoleNameCriteria($newRoleName);
        $newRole = $this->entityManager->getRepository(Role::class)
            ->createQueryBuilder('r')
            ->where('LOWER(r.name) = LOWER(:name1) OR LOWER(r.name) = LOWER(:name2)')
            ->setParameter('name1', $newRoleCriteria['simple'])
            ->setParameter('name2', $newRoleCriteria['prefixed'])
            ->getQuery()
            ->getOneOrNullResult();
        
        if (!$oldRole) {
            throw new NotFoundHttpException(sprintf('Le rôle "%s" n\'existe pas.', $oldRoleName));
        }
        
        if (!$newRole) {
            throw new NotFoundHttpException(sprintf('Le rôle "%s" n\'existe pas.', $newRoleName));
        }
        
        // Chercher l'entrée UserRole existante pour l'ancien rôle
        $userRole = $this->entityManager->getRepository(UserRole::class)->findOneBy([
            'user' => $user,
            'role' => $oldRole
        ]);
        
        if (!$userRole) {
            throw new NotFoundHttpException(sprintf('L\'utilisateur n\'a pas le rôle "%s".', $oldRoleName));
        }
        
        // Vérifier si l'utilisateur a déjà le nouveau rôle
        $existingNewRole = $this->entityManager->getRepository(UserRole::class)->findOneBy([
            'user' => $user,
            'role' => $newRole
        ]);
        
        if ($existingNewRole) {
            // Si l'utilisateur a déjà le nouveau rôle, supprimer simplement l'ancien
            $this->entityManager->remove($userRole);
        } else {
            // Sinon, modifier le rôle existant
            $userRole->setRole($newRole);
        }
        
        // Si le rôle change de GUEST à STUDENT, créer un profil étudiant
        if (strtoupper($oldRoleName) === 'ROLE_GUEST' && strtoupper($newRoleName) === 'ROLE_STUDENT') {
            $studentProfileService = $this->entityManager->getContainer()->get('App\Domains\Student\Service\StudentProfileService');
            $studentProfileService->createProfile($user);
        }
        
        $this->entityManager->flush();
    }
    
    /**
     * Récupère tous les rôles disponibles
     */
    public function getAllRoles(): array
    {
        $roles = $this->entityManager->getRepository(Role::class)->findAll();
        $rolesData = [];
        
        foreach ($roles as $role) {
            $rolesData[] = [
                'id' => $role->getId(),
                'name' => $role->getName(),
                'description' => $role->getDescription()
            ];
        }
        
        return $rolesData;
    }
    
    /**
     * Construit les critères pour rechercher un rôle avec ou sans le préfixe "ROLE_"
     */
    private function buildRoleNameCriteria(string $roleName): array
    {
        $roleName = trim(strtolower($roleName));
        $simple = str_replace('role_', '', $roleName);
        $prefixed = 'role_' . $simple;
        
        return [
            'simple' => $simple,
            'prefixed' => $prefixed
        ];
    }
}
