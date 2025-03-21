<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Diploma;
use App\Entity\UserDiploma;
use App\Repository\DiplomaRepository;
use App\Repository\UserDiplomaRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/user-diplomas')]
class UserDiplomaController extends AbstractController
{
    private $security;
    private $serializer;
    private $entityManager;
    private $userRepository;
    private $diplomaRepository;
    private $userDiplomaRepository;
    private $validator;
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        DiplomaRepository $diplomaRepository,
        UserDiplomaRepository $userDiplomaRepository,
        ValidatorInterface $validator
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->diplomaRepository = $diplomaRepository;
        $this->userDiplomaRepository = $userDiplomaRepository;
        $this->validator = $validator;
    }

    /**
     * Get all available diplomas
     */
    #[Route('/available', name: 'api_user_diplomas_available', methods: ['GET'])]
    public function getAvailableDiplomas(): JsonResponse
    {
        $diplomas = $this->diplomaRepository->findAll();
        
        $diplomasData = [];
        foreach ($diplomas as $diploma) {
            $diplomasData[] = [
                'id' => $diploma->getId(),
                'name' => $diploma->getName(),
                'institution' => $diploma->getInstitution(),
            ];
        }
        
        return $this->json([
            'success' => true,
            'data' => $diplomasData
        ]);
    }

    /**
     * Get all diplomas for the current user
     */
    #[Route('', name: 'api_user_diplomas_list', methods: ['GET'])]
    public function getUserDiplomas(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $userDiplomas = $this->userDiplomaRepository->findByUserWithRelations($user);
        
        $diplomasData = [];
        foreach ($userDiplomas as $userDiploma) {
            $diplomasData[] = [
                'id' => $userDiploma->getId(),
                'diploma' => [
                    'id' => $userDiploma->getDiploma()->getId(),
                    'name' => $userDiploma->getDiploma()->getName(),
                    'institution' => $userDiploma->getDiploma()->getInstitution(),
                ],
                'obtainedDate' => $userDiploma->getObtainedDate()->format('Y-m-d')
            ];
        }
        
        return $this->json([
            'success' => true,
            'data' => $diplomasData
        ]);
    }

    /**
     * Add a diploma to the current user
     */
    #[Route('', name: 'api_user_diplomas_add', methods: ['POST'])]
    public function addUserDiploma(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['diplomaId']) || !isset($data['obtainedDate'])) {
            return $this->json([
                'success' => false,
                'message' => 'Données manquantes: diplomaId et obtainedDate sont requis'
            ], 400);
        }
        
        $diploma = $this->diplomaRepository->find($data['diplomaId']);
        
        if (!$diploma) {
            return $this->json([
                'success' => false,
                'message' => 'Diplôme non trouvé'
            ], 404);
        }
        
        // Check if user already has this diploma
        $existingUserDiploma = $this->userDiplomaRepository->findOneBy([
            'user' => $user,
            'diploma' => $diploma
        ]);
        
        if ($existingUserDiploma) {
            return $this->json([
                'success' => false,
                'message' => 'Ce diplôme est déjà associé à votre profil'
            ], 400);
        }
        
        try {
            $obtainedDate = new \DateTime($data['obtainedDate']);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Format de date invalide. Utilisez le format YYYY-MM-DD'
            ], 400);
        }
        
        $userDiploma = new UserDiploma();
        $userDiploma->setUser($user);
        $userDiploma->setDiploma($diploma);
        $userDiploma->setObtainedDate($obtainedDate);
        
        $errors = $this->validator->validate($userDiploma);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            
            return $this->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $errorMessages
            ], 400);
        }
        
        $this->entityManager->persist($userDiploma);
        $this->entityManager->flush();
        
        return $this->json([
            'success' => true,
            'message' => 'Diplôme ajouté avec succès',
            'data' => [
                'id' => $userDiploma->getId(),
                'diploma' => [
                    'id' => $diploma->getId(),
                    'name' => $diploma->getName(),
                    'institution' => $diploma->getInstitution(),
                ],
                'obtainedDate' => $obtainedDate->format('Y-m-d')
            ]
        ], 201);
    }

    /**
     * Update a user diploma
     */
    #[Route('/{id}', name: 'api_user_diplomas_update', methods: ['PUT'])]
    public function updateUserDiploma(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $userDiploma = $this->userDiplomaRepository->find($id);
        
        if (!$userDiploma) {
            return $this->json([
                'success' => false,
                'message' => 'Diplôme utilisateur non trouvé'
            ], 404);
        }
        
        // Security check: ensure the diploma belongs to the current user
        if ($userDiploma->getUser()->getId() !== $user->getId()) {
            return $this->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à modifier ce diplôme'
            ], 403);
        }
        
        $data = json_decode($request->getContent(), true);
        
        // Update diploma if provided
        if (isset($data['diplomaId'])) {
            $diploma = $this->diplomaRepository->find($data['diplomaId']);
            
            if (!$diploma) {
                return $this->json([
                    'success' => false,
                    'message' => 'Diplôme non trouvé'
                ], 404);
            }
            
            // Check if user already has this diploma (except the current one)
            $existingUserDiploma = $this->userDiplomaRepository->findOneBy([
                'user' => $user,
                'diploma' => $diploma
            ]);
            
            if ($existingUserDiploma && $existingUserDiploma->getId() !== $userDiploma->getId()) {
                return $this->json([
                    'success' => false,
                    'message' => 'Ce diplôme est déjà associé à votre profil'
                ], 400);
            }
            
            $userDiploma->setDiploma($diploma);
        }
        
        // Update obtained date if provided
        if (isset($data['obtainedDate'])) {
            try {
                $obtainedDate = new \DateTime($data['obtainedDate']);
                $userDiploma->setObtainedDate($obtainedDate);
            } catch (\Exception $e) {
                return $this->json([
                    'success' => false,
                    'message' => 'Format de date invalide. Utilisez le format YYYY-MM-DD'
                ], 400);
            }
        }
        
        $errors = $this->validator->validate($userDiploma);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            
            return $this->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $errorMessages
            ], 400);
        }
        
        $this->entityManager->flush();
        
        return $this->json([
            'success' => true,
            'message' => 'Diplôme mis à jour avec succès',
            'data' => [
                'id' => $userDiploma->getId(),
                'diploma' => [
                    'id' => $userDiploma->getDiploma()->getId(),
                    'name' => $userDiploma->getDiploma()->getName(),
                    'institution' => $userDiploma->getDiploma()->getInstitution(),
                ],
                'obtainedDate' => $userDiploma->getObtainedDate()->format('Y-m-d')
            ]
        ]);
    }

    /**
     * Delete a user diploma
     */
    #[Route('/{id}', name: 'api_user_diplomas_delete', methods: ['DELETE'])]
    public function deleteUserDiploma(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $userDiploma = $this->userDiplomaRepository->find($id);
        
        if (!$userDiploma) {
            return $this->json([
                'success' => false,
                'message' => 'Diplôme utilisateur non trouvé'
            ], 404);
        }
        
        // Security check: ensure the diploma belongs to the current user
        if ($userDiploma->getUser()->getId() !== $user->getId()) {
            return $this->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à supprimer ce diplôme'
            ], 403);
        }
        
        $this->entityManager->remove($userDiploma);
        $this->entityManager->flush();
        
        return $this->json([
            'success' => true,
            'message' => 'Diplôme supprimé avec succès'
        ]);
    }
} 