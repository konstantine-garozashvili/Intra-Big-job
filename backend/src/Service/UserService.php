<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\UserRole;
use App\Entity\Group;
use App\Entity\Diploma;
use App\Entity\Address;
use App\Entity\Signature;
use App\Entity\UserDiploma;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UserService
{
    private EntityManagerInterface $entityManager;
    
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }
    
    /**
     * Supprime un utilisateur en gérant correctement toutes ses relations
     * 
     * @param int $userId L'ID de l'utilisateur à supprimer
     * @return bool True si la suppression a réussi
     * @throws NotFoundHttpException Si l'utilisateur n'existe pas
     * @throws \Exception Si une erreur survient pendant la suppression
     */
    public function deleteUser(int $userId): bool
    {
        try {
            $user = $this->entityManager->getReference(User::class, $userId);
            if (!$user) {
                return false;
            }

            // Remove user from all groups
            foreach ($user->getGroups() as $group) {
                $group->removeUser($user);
            }

            // Remove all user roles
            foreach ($user->getUserRoles() as $userRole) {
                $this->entityManager->remove($userRole);
            }

            // Remove the user
            $this->entityManager->remove($user);
            $this->entityManager->flush();

            return true;
        } catch (\Exception $e) {
            // Log the error
            error_log("Error deleting user: " . $e->getMessage());
            return false;
        }
    }
} 