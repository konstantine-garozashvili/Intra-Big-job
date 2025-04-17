<?php

namespace App\Controller;

use App\Entity\Role;
use App\Entity\User;
use App\Service\UserRoleService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

#[Route('/api/user-roles')]
class UserRoleController extends AbstractController
{
    private UserRoleService $userRoleService;
    private EntityManagerInterface $entityManager;
    
    public function __construct(
        UserRoleService $userRoleService,
        EntityManagerInterface $entityManager
    ) {
        $this->userRoleService = $userRoleService;
        $this->entityManager = $entityManager;
    }
    
    /**
     * Récupère tous les utilisateurs ayant un rôle spécifique
     */
    #[Route('/users/{roleName}', name: 'api_users_by_role', methods: ['GET'])]
    public function getUsersByRole(string $roleName): JsonResponse
    {
        // Vérification des permissions
        if (!$this->hasRequiredRole(['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_RECRUITER'])) {
            return $this->json([
                'success' => false,
                'message' => 'Accès refusé'
            ], 403);
        }
        
        try {
            $users = $this->userRoleService->getUsersByRole($roleName);
            
            return $this->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (NotFoundHttpException $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Change le rôle d'un utilisateur
     * Les Admin peuvent modifier tous les rôles sauf attribuer/modifier SUPERADMIN
     * Les SuperAdmin peuvent modifier tous les rôles sans restriction
     */
    #[Route('/change-role', name: 'api_change_user_role', methods: ['POST'])]
    public function changeUserRole(Request $request): JsonResponse
    {
        // Vérification des permissions
        if (!$this->hasRequiredRole(['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_RECRUITER'])) {
            return $this->json([
                'success' => false,
                'message' => 'Accès refusé'
            ], 403);
        }
        
        try {
            $data = json_decode($request->getContent(), true);
            
            // Validation des données
            if (!isset($data['userId']) || !isset($data['oldRoleName']) || !isset($data['newRoleName'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Données incomplètes. userId, oldRoleName et newRoleName sont requis.'
                ], 400);
            }
            
            // Vérification spéciale pour le rôle SUPERADMIN
            $newRoleName = strtoupper($data['newRoleName']);
            $oldRoleName = strtoupper($data['oldRoleName']);
            
            $newRoleIsSuperAdmin = ($newRoleName === 'SUPERADMIN' || $newRoleName === 'ROLE_SUPERADMIN');
            $oldRoleIsSuperAdmin = ($oldRoleName === 'SUPERADMIN' || $oldRoleName === 'ROLE_SUPERADMIN');
            
            // Vérifier si l'utilisateur cible est un SuperAdmin
            $user = $this->entityManager->getRepository(User::class)->find($data['userId']);
            if (!$user) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }
            
            $isSuperAdmin = $this->hasRoleInternal($user, 'SUPERADMIN');
            
            // Seul un SuperAdmin peut modifier un utilisateur qui est SuperAdmin
            if ($isSuperAdmin && !$this->hasRequiredRole(['ROLE_SUPERADMIN'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Seul un Super Admin peut modifier un utilisateur qui a le rôle Super Admin'
                ], 403);
            }
            
            // Seul un SuperAdmin peut attribuer le rôle SuperAdmin
            if ($newRoleIsSuperAdmin && !$this->hasRequiredRole(['ROLE_SUPERADMIN'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Seul un Super Admin peut attribuer le rôle Super Admin'
                ], 403);
            }
            
            $this->userRoleService->changeUserRole(
                (int) $data['userId'],
                $data['oldRoleName'],
                $data['newRoleName']
            );

            // Send SSE notification
            $message = json_encode([
                'type' => 'role_changed',
                'message' => "Votre rôle a été modifié de {$data['oldRoleName']} à {$data['newRoleName']}",
                'timestamp' => (new \DateTime())->format('c')
            ]);
            
            file_put_contents(
                sys_get_temp_dir() . "/sse_{$data['userId']}.txt",
                "data: {$message}\n\n",
                FILE_APPEND
            );
            
            // Return success response with notification data
            return $this->json([
                'success' => true,
                'message' => 'Role changed successfully',
                'notification' => true,
                'notificationMessage' => 'Votre rôle a été modifié de ' . $data['oldRoleName'] . ' à ' . $data['newRoleName'],
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'roles' => $user->getRoles()
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Récupère tous les rôles disponibles
     */
    #[Route('/roles', name: 'api_all_roles', methods: ['GET'])]
    public function getAllRoles(): JsonResponse
    {
        // Vérification des permissions
        if (!$this->hasRequiredRole(['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_RECRUITER'])) {
            return $this->json([
                'success' => false,
                'message' => 'Accès refusé'
            ], 403);
        }
        
        try {
            $roles = $this->userRoleService->getAllRoles();
            
            return $this->json([
                'success' => true,
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Vérifie si l'utilisateur courant a au moins un des rôles requis
     */
    private function hasRequiredRole(array $requiredRoles): bool
    {
        $user = $this->getUser();
        if (!$user) {
            return false;
        }
        
        $userRoles = $user->getRoles();
        
        foreach ($requiredRoles as $requiredRole) {
            // Normaliser le rôle requis
            $requiredRole = strtoupper($requiredRole);
            $simpleRequiredRole = str_replace('ROLE_', '', $requiredRole);
            $prefixedRequiredRole = 'ROLE_' . $simpleRequiredRole;
            
            foreach ($userRoles as $userRole) {
                $userRole = strtoupper($userRole);
                
                if ($userRole === $requiredRole || $userRole === $simpleRequiredRole || $userRole === $prefixedRequiredRole) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Vérifie si un utilisateur spécifique a le rôle indiqué
     */
    private function hasRoleInternal(User $user, string $roleName): bool
    {
        $roleName = strtoupper($roleName);
        $simpleName = str_replace('ROLE_', '', $roleName);
        $prefixedName = 'ROLE_' . $simpleName;
        
        foreach ($user->getUserRoles() as $userRole) {
            $role = $userRole->getRole()->getName();
            $roleUpper = strtoupper($role);
            
            if ($roleUpper === $roleName || $roleUpper === $simpleName || $roleUpper === $prefixedName) {
                return true;
            }
        }
        
        return false;
    }
}
