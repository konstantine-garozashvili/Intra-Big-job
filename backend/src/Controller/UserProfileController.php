<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\UserProfileService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api')]
class UserProfileController extends AbstractController
{
    public function __construct(
        private readonly Security $security,
        private readonly SerializerInterface $serializer,
        private readonly UserRepository $userRepository,
        private readonly UserProfileService $userProfileService,
    ) {
    }
    
    /**
     * Récupère le profil complet de l'utilisateur connecté
     */
    #[Route('/profile', name: 'api_user_profile', methods: ['GET'])]
    public function getUserProfile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $userData = $this->userProfileService->getUserProfileData($user);
        
        return $this->json([
            'success' => true,
            'data' => $userData
        ]);
    }
    
    /**
     * Met à jour le profil de l'utilisateur connecté
     */
    #[Route('/profile', name: 'api_user_profile_update', methods: ['PUT'])]
    public function updateUserProfile(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
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
        
        // Mettre à jour les champs de base de l'utilisateur
        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }
        
        if (isset($data['phoneNumber'])) {
            $user->setPhoneNumber($data['phoneNumber']);
        }
        
        if (isset($data['birthDate']) && $data['birthDate']) {
            try {
                $birthDate = new \DateTimeImmutable($data['birthDate']);
                $user->setBirthDate($birthDate);
            } catch (\Exception $e) {
                return $this->json([
                    'success' => false,
                    'message' => 'Format de date de naissance invalide'
                ], 400);
            }
        }
        
        if (isset($data['linkedinUrl'])) {
            // Debug log for linkedinUrl value
            error_log('Received linkedinUrl: ' . var_export($data['linkedinUrl'], true));
            // Treat empty string as null for deletion
            $user->setLinkedinUrl($data['linkedinUrl'] ?: null);
        }
        
        // Mettre à jour la date de modification
        $user->setUpdatedAt(new \DateTimeImmutable());
        
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
        $entityManager->flush();
        
        // Retourner les données mises à jour
        $userData = $this->userProfileService->getUserProfileData($user);
        
        return $this->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'data' => $userData
        ]);
    }

}