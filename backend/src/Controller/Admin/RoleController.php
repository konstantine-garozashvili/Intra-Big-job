<?php

namespace App\Controller\Admin;

use App\Entity\Role;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class RoleController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/roles', name: 'admin_get_roles', methods: ['GET'])]
    public function getRoles(): Response
    {
        try {
            $roles = $this->entityManager->getRepository(Role::class)
                ->createQueryBuilder('r')
                ->where('r.name != :superadmin')
                ->setParameter('superadmin', 'SUPERADMIN')
                ->getQuery()
                ->getResult();

            $formattedRoles = [];
            foreach ($roles as $role) {
                $formattedRoles[] = [
                    'id' => $role->getId(),
                    'name' => $role->getName(),
                    'description' => $role->getDescription()
                ];
            }

            return $this->json([
                'success' => true,
                'roles' => $formattedRoles
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération des rôles.',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 