<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Service\UserProfileService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/profile')]
class ProfileMeController extends AbstractController
{
    private $security;
    private $userProfileService;
    private $entityManager;
    
    public function __construct(
        Security $security,
        UserProfileService $userProfileService,
        EntityManagerInterface $entityManager
    ) {
        $this->security = $security;
        $this->userProfileService = $userProfileService;
        $this->entityManager = $entityManager;
    }
    
    /**
     * Récupère le profil complet de l'utilisateur connecté avec les données spécifiques à son rôle
     */
    #[Route('/me', name: 'api_profile_me', methods: ['GET'])]
    public function getProfile(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        try {
            // Récupérer les données de base du profil
            $userData = $this->userProfileService->getUserProfileData($user);
            $roles = $this->getUserRolesAsArray($user);
            
            // Données de base
            $profileData = [
                'user' => $userData,
                'roles' => $roles
            ];
            
            // Ajouter les données spécifiques au rôle étudiant si applicable
            if (in_array('ROLE_STUDENT', $roles) && $user->getStudentProfile()) {
                $studentProfile = $user->getStudentProfile();
                $profileData['studentData'] = [
                    'id' => $studentProfile->getId(),
                    'isSeekingInternship' => $studentProfile->isSeekingInternship(),
                    'isSeekingApprenticeship' => $studentProfile->isSeekingApprenticeship(),
                    'portfolioUrl' => $studentProfile->getPortfolioUrl(),
                    'currentInternshipCompany' => $studentProfile->getCurrentInternshipCompany(),
                    'internshipStartDate' => $studentProfile->getInternshipStartDate() ? 
                                            $studentProfile->getInternshipStartDate()->format('Y-m-d') : null,
                    'internshipEndDate' => $studentProfile->getInternshipEndDate() ? 
                                          $studentProfile->getInternshipEndDate()->format('Y-m-d') : null,
                    'situationType' => $studentProfile->getSituationType() ? [
                        'id' => $studentProfile->getSituationType()->getId(),
                        'name' => $studentProfile->getSituationType()->getName()
                    ] : null
                ];
            }
            
            // Ajouter les données spécifiques au rôle enseignant si applicable
            if (in_array('ROLE_TEACHER', $roles)) {
                $profileData['teacherData'] = [
                    'specialization' => $user->getSpecialization() ? [
                        'id' => $user->getSpecialization()->getId(),
                        'name' => $user->getSpecialization()->getName(),
                        'domain' => $user->getSpecialization()->getDomain() ? [
                            'id' => $user->getSpecialization()->getDomain()->getId(),
                            'name' => $user->getSpecialization()->getDomain()->getName()
                        ] : null
                    ] : null
                ];
            }
            
            // Ajouter les données spécifiques au rôle admin si applicable
            if (in_array('ROLE_ADMIN', $roles) || in_array('ROLE_SUPER_ADMIN', $roles)) {
                $profileData['adminData'] = [
                    'adminSince' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d') : null,
                    'userRoles' => $user->getUserRoles()->count()
                ];
            }
            
            return $this->json([
                'success' => true,
                'data' => $profileData
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données du profil: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Met à jour le profil complet de l'utilisateur avec vérification des permissions selon le rôle
     */
    #[Route('/me', name: 'api_profile_me_update', methods: ['PUT'])]
    public function updateProfile(Request $request, ValidatorInterface $validator): JsonResponse
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
        
        $roles = $this->getUserRolesAsArray($user);
        
        try {
            // Mise à jour des données communes
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
                $user->setLinkedinUrl($data['linkedinUrl']);
            }
            
            // Mise à jour données étudiant
            if (in_array('ROLE_STUDENT', $roles) && $user->getStudentProfile() && isset($data['studentData'])) {
                $studentData = $data['studentData'];
                $studentProfile = $user->getStudentProfile();
                
                if (isset($studentData['isSeekingInternship'])) {
                    $studentProfile->setIsSeekingInternship($studentData['isSeekingInternship']);
                }
                
                if (isset($studentData['isSeekingApprenticeship'])) {
                    $studentProfile->setIsSeekingApprenticeship($studentData['isSeekingApprenticeship']);
                }
                
                if (isset($studentData['portfolioUrl'])) {
                    $studentProfile->setPortfolioUrl($studentData['portfolioUrl']);
                }
                
                if (isset($studentData['currentInternshipCompany'])) {
                    $studentProfile->setCurrentInternshipCompany($studentData['currentInternshipCompany']);
                }
                
                if (isset($studentData['internshipStartDate']) && $studentData['internshipStartDate']) {
                    try {
                        $startDate = new \DateTime($studentData['internshipStartDate']);
                        $studentProfile->setInternshipStartDate($startDate);
                    } catch (\Exception $e) {
                        // Ignorer si le format est invalide
                    }
                }
                
                if (isset($studentData['internshipEndDate']) && $studentData['internshipEndDate']) {
                    try {
                        $endDate = new \DateTime($studentData['internshipEndDate']);
                        $studentProfile->setInternshipEndDate($endDate);
                    } catch (\Exception $e) {
                        // Ignorer si le format est invalide
                    }
                }
                
                $this->entityManager->persist($studentProfile);
            }
            
            // Mise à jour du thème
            if (isset($data['theme']) && is_array($data['theme']) && isset($data['theme']['id'])) {
                $themeRepo = $this->entityManager->getRepository(\App\Entity\Theme::class);
                $theme = $themeRepo->find($data['theme']['id']);
                
                if ($theme) {
                    $user->setTheme($theme);
                }
            }
            
            // Mise à jour de la date de modification
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
            $updatedUserData = $this->userProfileService->getUserProfileData($user);
            
            // Construction de la réponse
            $profileData = [
                'user' => $updatedUserData,
                'roles' => $roles
            ];
            
            // Ajouter les données spécifiques au rôle
            if (in_array('ROLE_STUDENT', $roles) && $user->getStudentProfile()) {
                $studentProfile = $user->getStudentProfile();
                $profileData['studentData'] = [
                    'id' => $studentProfile->getId(),
                    'isSeekingInternship' => $studentProfile->isSeekingInternship(),
                    'isSeekingApprenticeship' => $studentProfile->isSeekingApprenticeship(),
                    'portfolioUrl' => $studentProfile->getPortfolioUrl(),
                    'currentInternshipCompany' => $studentProfile->getCurrentInternshipCompany(),
                    'internshipStartDate' => $studentProfile->getInternshipStartDate() ? 
                                          $studentProfile->getInternshipStartDate()->format('Y-m-d') : null,
                    'internshipEndDate' => $studentProfile->getInternshipEndDate() ? 
                                        $studentProfile->getInternshipEndDate()->format('Y-m-d') : null
                ];
            }
            
            return $this->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => $profileData
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil: ' . $e->getMessage()
            ], 500);
        }
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