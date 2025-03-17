<?php

namespace App\Controller;

use App\Service\UserRoleService;
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
    
    public function __construct(UserRoleService $userRoleService)
    {
        $this->userRoleService = $userRoleService;
    }
    
    /**
     * Récupère tous les utilisateurs ayant un rôle spécifique
     */
    #[Route('/users/{roleName}', name: 'api_users_by_role', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getUsersByRole(string $roleName): JsonResponse
    {
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
     */
    #[Route('/change-role', name: 'api_change_user_role', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function changeUserRole(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            // Validation des données
            if (!isset($data['userId']) || !isset($data['oldRoleName']) || !isset($data['newRoleName'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Données incomplètes. userId, oldRoleName et newRoleName sont requis.'
                ], 400);
            }
            
            $this->userRoleService->changeUserRole(
                (int) $data['userId'],
                $data['oldRoleName'],
                $data['newRoleName']
            );
            
            return $this->json([
                'success' => true,
                'message' => 'Rôle modifié avec succès'
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
     * Récupère tous les rôles disponibles
     */
    #[Route('/roles', name: 'api_all_roles', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function getAllRoles(): JsonResponse
    {
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
}
