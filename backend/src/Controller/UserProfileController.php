<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\DocumentStorageFactory;
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
    private $security;
    private $serializer;
    private $userRepository;
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        UserRepository $userRepository
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->userRepository = $userRepository;
    }
    
    /**
     * Récupère le profil complet de l'utilisateur connecté
     */
    #[Route('/profile', name: 'api_user_profile', methods: ['GET'])]
    public function getUserProfile(DocumentStorageFactory $storageFactory): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Récupérer l'utilisateur avec toutes ses relations chargées
        $user = $this->userRepository->findOneWithAllRelations($user->getId());
        
        // Récupérer les données utilisateur avec les relations
        $userData = [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'phoneNumber' => $user->getPhoneNumber(),
            'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null,
            'isEmailVerified' => $user->isEmailVerified(),
            'linkedinUrl' => $user->getLinkedinUrl(),
            'pictureProfilePath' => $user->getProfilePicturePath(),
            'nationality' => $user->getNationality() ? [
                'id' => $user->getNationality()->getId(),
                'name' => $user->getNationality()->getName(),
            ] : null,
            'theme' => $user->getTheme() ? [
                'id' => $user->getTheme()->getId(),
                'name' => $user->getTheme()->getName(),
            ] : null,
            'profilePicture' => null,
        ];

        // Ajouter le profile étudiant
        if ($user->getStudentProfile()) {
            $studentProfile = $user->getStudentProfile();
            $userData['studentProfile'] = [
                'id' => $studentProfile->getId(),
                'isSeekingInternship' => $studentProfile->isSeekingInternship(),
                'isSeekingApprenticeship' => $studentProfile->isSeekingApprenticeship(),
            ];
        } else {
            $userData['studentProfile'] = null;
        }

        // Ajouter les spécialisations
        $specialization = $user->getSpecialization();
        if ($specialization) {
            $userData['specialization'] = [
                'id' => $specialization->getId(),
                'name' => $specialization->getName(),
                'domain' => $specialization->getDomain() ? [
                    'id' => $specialization->getDomain()->getId(),
                    'name' => $specialization->getDomain()->getName(),
                ] : null,
            ];
        } else {
            $userData['specialization'] = null; // Si l'utilisateur n'a pas de spécialisation
        }
        
        
        // Ajouter l'URL de la photo de profil si elle existe
        if ($user->getProfilePicturePath()) {
            $userData['profilePicture'] = [
                'path' => $user->getProfilePicturePath(),
                'url' => $storageFactory->getDocumentUrl($user->getProfilePicturePath())
            ];
        }
        
        // Ajouter les rôles
        $roles = [];
        foreach ($user->getUserRoles() as $userRole) {
            $roles[] = [
                'id' => $userRole->getRole()->getId(),
                'name' => $userRole->getRole()->getName(),
            ];
        }
        $userData['roles'] = $roles;
        
        // Ajouter les diplômes
        $diplomas = [];
        foreach ($user->getDiplomas() as $diploma) {
            $diplomas[] = [
                'id' => $diploma->getId(),
                'name' => $diploma->getName(),
                'obtainedAt' => $diploma->obtainedAt ? $diploma->obtainedAt->format('Y-m-d') : null,
            ];
        }
        $userData['diplomas'] = $diplomas;
        
        // Ajouter les adresses
        $addresses = [];
        foreach ($user->getAddresses() as $address) {
            $addresses[] = [
                'id' => $address->getId(),
                'name' => $address->getName(),
                'complement' => $address->getComplement(),
                'postalCode' => $address->getPostalCode() ? [
                    'id' => $address->getPostalCode()->getId(),
                    'code' => $address->getPostalCode()->getCode(),
                ] : null,
                'city' => $address->getCity() ? [
                    'id' => $address->getCity()->getId(),
                    'name' => $address->getCity()->getName(),
                ] : null,
            ];
        }
        $userData['addresses'] = $addresses;
        
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
        ValidatorInterface $validator,
        DocumentStorageFactory $storageFactory
    ): JsonResponse {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        try {
            $data = json_decode($request->getContent(), true);
            
            // Mise à jour des champs simples
            if (isset($data['firstName'])) {
                $user->setFirstName($data['firstName']);
            }
            
            if (isset($data['lastName'])) {
                $user->setLastName($data['lastName']);
            }
            
            if (isset($data['phoneNumber'])) {
                $user->setPhoneNumber($data['phoneNumber']);
            }
            
            if (isset($data['birthDate'])) {
                $user->setBirthDate(new \DateTime($data['birthDate']));
            }

            
            if (isset($data['linkedinUrl'])) {
                $user->setLinkedinUrl($data['linkedinUrl']);
            }

            if(isset($data['profilePicturePath'])) {
                $user->setProfilePicturePath($data['profilePicturePath']);
            }
            
            // Mise à jour des relations
            if (isset($data['nationality']) && is_numeric($data['nationality'])) {
                $nationality = $entityManager->getRepository('App:Nationality')->find($data['nationality']);
                if ($nationality) {
                    $user->setNationality($nationality);
                }
            }
            
            // Mise à jour du thème
            if (isset($data['theme']) && is_numeric($data['theme'])) {
                $theme = $entityManager->getRepository('App:Theme')->find($data['theme']);
                if ($theme) {
                    $user->setTheme($theme);
                }
            }

            // Mise à jour du profil étudiant
            if ($user->getStudentProfile()) {
                $studentProfile = $user->getStudentProfile();
                if (isset($data['isSeekingInternship'])) {
                    $studentProfile->setIsSeekingInternship($data['isSeekingInternship']);
                }
                if (isset($data['isSeekingApprenticeship'])) {
                    $studentProfile->setIsSeekingApprenticeship($data['isSeekingApprenticeship']);
                }
            }
            
            // Marquer la date de mise à jour
            $user->setUpdatedAt(new \DateTimeImmutable());
            
            // Valider les données
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
            
            // Sauvegarder les modifications
            $entityManager->flush();
            
            // Récupérer l'utilisateur mis à jour avec toutes ses relations
            $updatedUser = $this->userRepository->findOneWithAllRelations($user->getId());
            
            $responseData = [
                'id' => $updatedUser->getId(),
                'firstName' => $updatedUser->getFirstName(),
                'lastName' => $updatedUser->getLastName(),
                'email' => $updatedUser->getEmail(),
                'phoneNumber' => $updatedUser->getPhoneNumber(),
                'birthDate' => $updatedUser->getBirthDate() ? $updatedUser->getBirthDate()->format('Y-m-d') : null,
                'updatedAt' => $updatedUser->getUpdatedAt() ? $updatedUser->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'profilePicture' => null
            ];
            
            // Ajouter l'URL de la photo de profil si elle existe
            if ($updatedUser->getProfilePicturePath()) {
                $responseData['profilePicture'] = [
                    'path' => $updatedUser->getProfilePicturePath(),
                    'url' => $storageFactory->getDocumentUrl($updatedUser->getProfilePicturePath())
                ];
            }
            
            return $this->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => $responseData
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour du profil: ' . $e->getMessage()
            ], 500);
        }
    }
} 