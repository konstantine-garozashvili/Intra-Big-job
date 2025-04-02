<?php

namespace App\Controller\User;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/users')]
class UserMeController extends AbstractController
{
    private $security;
    private $entityManager;
    
    public function __construct(
        Security $security,
        EntityManagerInterface $entityManager
    ) {
        $this->security = $security;
        $this->entityManager = $entityManager;
    }
    
    /**
     * Récupère les données basiques de l'utilisateur connecté
     */
    #[Route('/me', name: 'api_user_me', methods: ['GET'])]
    public function getMe(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Retourner uniquement les données basiques
        return $this->json([
            'success' => true,
            'data' => [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'roles' => $this->getUserRolesAsArray($user),
                'profilePicturePath' => $user->getProfilePicturePath()
            ]
        ]);
    }
    
    /**
     * Met à jour les données basiques de l'utilisateur connecté
     */
    #[Route('/me', name: 'api_user_me_update', methods: ['PUT'])]
    public function updateMe(Request $request, ValidatorInterface $validator): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Récupérer les données de la requête
        $data = json_decode($request->getContent(), true);
        
        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides'
            ], 400);
        }
        
        // Mise à jour uniquement des données basiques autorisées
        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }
        
        if (isset($data['email']) && $this->isGranted('ROLE_ADMIN')) {
            $user->setEmail($data['email']);
        }
        
        // Mettre à jour la date de modification
        if (method_exists($user, 'setUpdatedAt')) {
            $user->setUpdatedAt(new \DateTimeImmutable());
        }
        
        // Valider l'entité
        $errors = $validator->validate($user);
        
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            
            return $this->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $errorMessages
            ], 400);
        }
        
        // Persister les changements
        $this->entityManager->flush();
        
        // Retourner les données mises à jour
        return $this->json([
            'success' => true,
            'message' => 'Données utilisateur mises à jour avec succès',
            'data' => [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'roles' => $this->getUserRolesAsArray($user),
                'profilePicturePath' => $user->getProfilePicturePath()
            ]
        ]);
    }
    
    /**
     * Get user roles as array
     */
    private function getUserRolesAsArray(User $user): array
    {
        return array_map(function($role) {
            return is_string($role) ? $role : $role->getName();
        }, $user->getRoles());
    }
} 