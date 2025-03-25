<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserRole;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Service\UserService;

#[Route('/api')]
class UserAdminController extends AbstractController
{
    private $userRepository;
    
    public function __construct(
        UserRepository $userRepository
    ) {
        $this->userRepository = $userRepository;
    }
    
    /**
     * Récupère tous les utilisateurs avec leurs relations
     * Endpoint utilisé par le tableau de bord administrateur
     */
    #[Route('/users', name: 'api_get_all_users', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getAllUsers(): JsonResponse
    {
        try {
            $users = $this->userRepository->findAllWithRoles();
            
            return $this->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération des utilisateurs: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Met à jour un utilisateur existant
     * Les administrateurs peuvent modifier tous les utilisateurs sauf les SuperAdmin
     * Les SuperAdmin peuvent modifier tous les utilisateurs, y compris d'autres SuperAdmin
     */
    #[Route('/users/{id}', name: 'api_update_user', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateUser(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        try {
            $user = $entityManager->getRepository(User::class)->find($id);

            if (!$user) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }
            
            // Vérifier si l'utilisateur cible est un SuperAdmin
            $isSuperAdmin = $this->hasRoleInternal($user, 'SUPERADMIN');
            
            // Si l'utilisateur cible est SuperAdmin et que l'utilisateur courant n'est pas SuperAdmin
            if ($isSuperAdmin && !$this->hasRole('SUPERADMIN')) {
                return $this->json([
                    'success' => false,
                    'message' => 'Seul un Super Admin peut modifier un compte Super Admin'
                ], 403);
            }

            $data = json_decode($request->getContent(), true);

            // Mise à jour des informations de base
            if (isset($data['firstName'])) {
                $user->setFirstName($data['firstName']);
            }

            if (isset($data['lastName'])) {
                $user->setLastName($data['lastName']);
            }

            if (isset($data['email'])) {
                $existingUser = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
                if ($existingUser && $existingUser->getId() !== $user->getId()) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Cet email est déjà utilisé par un autre utilisateur.'
                    ], 400);
                }
                $user->setEmail($data['email']);
            }

            if (isset($data['phoneNumber'])) {
                $user->setPhoneNumber($data['phoneNumber']);
            }

            if (isset($data['birthDate'])) {
                $user->setBirthDate(new \DateTime($data['birthDate']));
            }

            if (isset($data['nationality']) && is_numeric($data['nationality'])) {
                $nationality = $entityManager->getRepository('App\Entity\Nationality')->find($data['nationality']);
                if ($nationality) {
                    $user->setNationality($nationality);
                }
            }

            // Mise à jour des rôles si spécifiés
            if (isset($data['roles']) && is_array($data['roles'])) {
                // Vérifier si on tente d'attribuer le rôle SUPERADMIN alors qu'on n'est pas SUPERADMIN
                $willHaveSuperAdmin = false;
                $roleRepository = $entityManager->getRepository('App\Entity\Role');
                
                foreach ($data['roles'] as $roleId) {
                    $role = $roleRepository->find($roleId);
                    if ($role && ($role->getName() === 'SUPERADMIN' || $role->getName() === 'ROLE_SUPERADMIN')) {
                        $willHaveSuperAdmin = true;
                        break;
                    }
                }
                
                if ($willHaveSuperAdmin && !$this->hasRole('SUPERADMIN')) {
                    return $this->json([
                        'success' => false,
                        'message' => 'Seul un Super Admin peut attribuer le rôle Super Admin'
                    ], 403);
                }
                
                // Supprimer les rôles existants
                foreach ($user->getUserRoles() as $userRole) {
                    $entityManager->remove($userRole);
                }

                // Ajouter les nouveaux rôles
                foreach ($data['roles'] as $roleId) {
                    $role = $roleRepository->find($roleId);
                    if ($role) {
                        $userRole = new UserRole();
                        $userRole->setUser($user);
                        $userRole->setRole($role);
                        $entityManager->persist($userRole);
                    }
                }
            }

            $user->setUpdatedAt(new \DateTimeImmutable());

            $errors = $validator->validate($user);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[$error->getPropertyPath()] = $error->getMessage();
                }

                return $this->json([
                    'success' => false,
                    'message' => 'Erreurs de validation',
                    'errors' => $errorMessages
                ], 400);
            }

            $entityManager->flush();

            // Formater les rôles pour la réponse
            $roles = [];
            foreach ($user->getUserRoles() as $userRole) {
                $roles[] = [
                    'id' => $userRole->getRole()->getId(),
                    'name' => $userRole->getRole()->getName(),
                ];
            }

            return $this->json([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'email' => $user->getEmail(),
                    'roles' => $roles
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Supprime un utilisateur spécifique
     * Les administrateurs peuvent supprimer tous les utilisateurs sauf les SuperAdmin
     * Les SuperAdmin peuvent supprimer tous les utilisateurs, y compris d'autres SuperAdmin
     */
    #[Route('/users/{id}', name: 'api_delete_user', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteUser(
        int $id,
        EntityManagerInterface $entityManager,
        UserService $userService
    ): JsonResponse {
        try {
            // Debug - Étape 1: Log du début de la méthode
            error_log("Début de la suppression de l'utilisateur ID: " . $id);
            
            // Récupérer l'utilisateur à supprimer
            $user = $entityManager->getRepository(User::class)->find($id);

            if (!$user) {
                error_log("Utilisateur non trouvé: " . $id);
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }
            
            error_log("Utilisateur trouvé: " . $user->getId() . " - " . $user->getEmail());
            
            // Vérifier si l'utilisateur cible est un SuperAdmin
            $isSuperAdmin = $this->hasRoleInternal($user, 'SUPERADMIN');
            error_log("Utilisateur est SuperAdmin: " . ($isSuperAdmin ? 'Oui' : 'Non'));
            
            // Si l'utilisateur cible est SuperAdmin et que l'utilisateur courant n'est pas SuperAdmin
            if ($isSuperAdmin && !$this->hasRole('SUPERADMIN')) {
                error_log("Tentative non autorisée de supprimer un SuperAdmin");
                return $this->json([
                    'success' => false,
                    'message' => 'Seul un Super Admin peut supprimer un compte Super Admin'
                ], 403);
            }
            
            // Utiliser le service pour gérer la suppression complexe de l'utilisateur
            $userService->deleteUser($id);
            
            return $this->json([
                'success' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ]);
            
        } catch (NotFoundHttpException $e) {
            error_log("Utilisateur non trouvé: " . $e->getMessage());
            return $this->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        } catch (\Exception $e) {
            error_log("Exception finale: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Vérifie si l'utilisateur courant a le rôle spécifié
     * Cette méthode gère aussi les variations avec ou sans préfixe ROLE_
     */
    private function hasRole(string $roleName): bool
    {
        $user = $this->getUser();
        if (!$user) {
            return false;
        }
        
        return $this->hasRoleInternal($user, $roleName);
    }
    
    /**
     * Vérifie si un utilisateur spécifique a le rôle indiqué
     * Cette méthode gère aussi les variations avec ou sans préfixe ROLE_
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