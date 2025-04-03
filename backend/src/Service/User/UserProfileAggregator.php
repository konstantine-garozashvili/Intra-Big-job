<?php

namespace App\Service\User;

use App\Entity\User;
use App\Repository\UserDiplomaRepository;
use App\Repository\UserRepository;
use App\Service\UserProfileService;
use App\Service\UserService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserProfileAggregator
{
    private array $sectionPermissions = [
        'basic' => [],  // Accessible à tous les utilisateurs authentifiés
        'profile' => [], // Données de profil de base
        'diplomas' => [], // Diplômes de l'utilisateur
        'portfolio' => ['ROLE_STUDENT'], // Portfolio, uniquement pour les étudiants
        'teaching_data' => ['ROLE_TEACHER'], // Données d'enseignement, uniquement pour les enseignants
        'hr_data' => ['ROLE_HR'], // Données RH, uniquement pour les RH
        'admin_data' => ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'], // Données d'administration
    ];

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly UserDiplomaRepository $userDiplomaRepository,
        private readonly UserProfileService $userProfileService,
        private readonly UserService $userService
    ) {
    }

    /**
     * Récupère toutes les données utilisateur en fonction des sections demandées
     * 
     * @param UserInterface $user L'utilisateur authentifié
     * @param array $sections Les sections de données demandées (vide = toutes les sections autorisées)
     * @return array Les données utilisateur structurées par sections
     */
    public function getUserData(UserInterface $user, array $sections = []): array
    {
        // Si aucune section spécifiée, on retourne les sections de base
        if (empty($sections)) {
            $sections = ['basic', 'profile'];
        }

        $data = [];
        
        // Filtrer les sections auxquelles l'utilisateur a accès
        $authorizedSections = $this->filterAuthorizedSections($user, $sections);
        
        // Charger les données pour chaque section autorisée
        foreach ($authorizedSections as $section) {
            $data[$section] = $this->loadSectionData($user, $section);
        }
        
        return $data;
    }

    /**
     * Vérifie si l'utilisateur peut accéder à une section spécifique
     */
    public function canAccessSection(UserInterface $user, string $section): bool
    {
        // Si la section n'existe pas dans les permissions, accès refusé
        if (!isset($this->sectionPermissions[$section])) {
            return false;
        }

        // Si la section n'a pas de rôles requis, accès autorisé pour tous les utilisateurs authentifiés
        if (empty($this->sectionPermissions[$section])) {
            return true;
        }

        // Vérifier si l'utilisateur a au moins un des rôles requis
        foreach ($this->sectionPermissions[$section] as $requiredRole) {
            if ($user->getRoles() && in_array($requiredRole, $user->getRoles())) {
                return true;
            }
        }

        return false;
    }

    /**
     * Filtre les sections auxquelles l'utilisateur a accès
     */
    private function filterAuthorizedSections(UserInterface $user, array $sections): array
    {
        return array_filter($sections, fn($section) => $this->canAccessSection($user, $section));
    }

    /**
     * Charge les données pour une section spécifique
     */
    private function loadSectionData(UserInterface $user, string $section): array
    {
        return match($section) {
            'basic' => $this->getBasicData($user),
            'profile' => $this->getProfileData($user),
            'diplomas' => $this->getDiplomaData($user),
            'portfolio' => $this->getPortfolioData($user),
            'teaching_data' => $this->getTeachingData($user),
            'hr_data' => $this->getHrData($user),
            'admin_data' => $this->getAdminData($user),
            default => []
        };
    }

    /**
     * Récupère les données de base de l'utilisateur
     */
    private function getBasicData(UserInterface $user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'first_name' => $user->getFirstName(),
            'last_name' => $user->getLastName(),
            'user_identifier' => $user->getUserIdentifier(),
        ];
    }

    /**
     * Récupère les données de profil de l'utilisateur
     */
    private function getProfileData(UserInterface $user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        // Utiliser le service existant pour récupérer les données de profil
        return $this->userProfileService->getUserProfileData($user);
    }

    /**
     * Récupère les données de diplôme de l'utilisateur
     */
    private function getDiplomaData(UserInterface $user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        $userDiplomas = $this->userDiplomaRepository->findBy(['user' => $user]);
        $result = [];

        foreach ($userDiplomas as $userDiploma) {
            $diploma = $userDiploma->getDiploma();
            if ($diploma) {
                $result[] = [
                    'id' => $userDiploma->getId(),
                    'name' => $diploma->getName(),
                    'institution' => $diploma->getInstitution(),
                    'obtainedDate' => $userDiploma->getObtainedDate() ? $userDiploma->getObtainedDate()->format('Y-m-d') : null,
                ];
            }
        }

        return $result;
    }

    /**
     * Récupère les données de portfolio (pour les étudiants)
     */
    private function getPortfolioData(UserInterface $user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        // Logique spécifique pour récupérer les données de portfolio d'un étudiant
        // À adapter selon la structure de votre base de données
        return [
            'projects' => [], // À compléter avec les données réelles
            'skills' => [],   // À compléter avec les données réelles
        ];
    }

    /**
     * Récupère les données d'enseignement (pour les enseignants)
     */
    private function getTeachingData(UserInterface $user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        // Logique spécifique pour récupérer les données d'enseignement
        return [
            'courses' => [], // À compléter avec les données réelles
            'students' => [], // À compléter avec les données réelles
        ];
    }

    /**
     * Récupère les données RH (pour les RH)
     */
    private function getHrData(UserInterface $user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        // Logique spécifique pour récupérer les données RH
        return [
            'hr_specific_data' => [], // À compléter avec les données réelles
        ];
    }

    /**
     * Récupère les données d'administration (pour les admins)
     */
    private function getAdminData(UserInterface $user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        // Logique spécifique pour récupérer les données d'administration
        return [
            'admin_specific_data' => [], // À compléter avec les données réelles
        ];
    }
} 