<?php
// src/Controller/SearchController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\UserRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Psr\Log\LoggerInterface;
use App\Entity\User;
use App\Service\DocumentStorageFactory;

class SearchController extends AbstractController
{
    private $security;
    private $userRepository;
    private $logger;
    private $documentStorageFactory;
    
    public function __construct(
        Security $security,
        UserRepository $userRepository,
        LoggerInterface $logger,
        DocumentStorageFactory $documentStorageFactory
    ) {
        $this->security = $security;
        $this->userRepository = $userRepository;
        $this->logger = $logger;
        $this->documentStorageFactory = $documentStorageFactory;
    }

    #[Route('/api/user-autocomplete', name: 'user_autocomplete', methods: ['GET'])]
    public function autocomplete(Request $request): JsonResponse
    {
        $query = $request->query->get('q', '');
        
        // Vérifier si l'utilisateur est connecté
        $currentUser = $this->security->getUser();
        if (!$currentUser) {
            return $this->json(['error' => 'Vous devez être connecté pour effectuer une recherche.'], 401);
        }

        // Do not run search for very short terms
        if (strlen($query) < 1) {
            return $this->json([]);
        }

        // Determine allowed roles based on current user's role
        $allowedRoles = $this->getAllowedSearchRoles($currentUser);
        
        // Use a custom repository method to search users
        $results = $this->userRepository->findAutocompleteResults($query, $allowedRoles, $currentUser->getId());

        // Prepare JSON data
        $data = [];
        foreach ($results as $user) {
            if ($user->getId() === $currentUser->getId()) {
                continue;
            }
            
            $roles = [];
            foreach ($user->getUserRoles() as $userRole) {
                $roles[] = $userRole->getRole()->getName();
            }
            
            if (empty($roles)) {
                $roles[] = 'ROLE_USER';
            }

            // Generate profile picture URL
            $profilePictureUrl = null;
            if ($user->getProfilePicturePath()) {
                try {
                    $profilePictureUrl = $this->documentStorageFactory->getDocumentUrl($user->getProfilePicturePath());
                } catch (\Exception $e) {
                    $profilePictureUrl = null;
                }
            }
            
            $data[] = [
                'id'        => $user->getId(),
                'lastName'  => $user->getLastName(),
                'firstName' => $user->getFirstName(),
                'roles'     => $roles,
                'profilePictureUrl' => $profilePictureUrl,
            ];
        }

        return $this->json($data);
    }

    #[Route('/api/user-autocomplete-debug', name: 'user_autocomplete_debug', methods: ['GET'])]
    public function autocompleteDebug(Request $request): JsonResponse
    {
        $query = $request->query->get('q', '');
        $this->logger->info('User autocomplete debug initiated', ['query' => $query]);

        // Get all users for debugging
        $allUsers = $this->userRepository->findAll();
        $userCount = count($allUsers);
        
        // Get sample users with their roles
        $sampleUsers = [];
        foreach (array_slice($allUsers, 0, 5) as $user) {
            $roles = [];
            foreach ($user->getUserRoles() as $userRole) {
                $roles[] = [
                    'id' => $userRole->getRole()->getId(),
                    'name' => $userRole->getRole()->getName()
                ];
            }
            
            $sampleUsers[] = [
                'id' => $user->getId(),
                'lastName' => $user->getLastName(),
                'firstName' => $user->getFirstName(),
                'email' => $user->getEmail(),
                'roles' => $roles,
                'getRolesMethod' => $user->getRoles()
            ];
        }
        
        // Test the search with a specific query
        $searchResults = $this->userRepository->findAutocompleteResults($query ?: 'a', null);
        $searchResultsCount = count($searchResults);
        
        // Return debug information
        return $this->json([
            'debug' => true,
            'totalUserCount' => $userCount,
            'sampleUsers' => $sampleUsers,
            'searchQuery' => $query ?: 'a',
            'searchResultsCount' => $searchResultsCount,
            'allowedRolesTest' => [
                'withRoles' => count($this->userRepository->findAutocompleteResults($query ?: 'a', ['ROLE_STUDENT', 'ROLE_TEACHER'])),
                'withoutRoles' => count($this->userRepository->findAutocompleteResults($query ?: 'a', null))
            ]
        ]);
    }

    /**
     * @Route("/api/user-autocomplete", name="api_user_autocomplete", methods={"GET"})
     */
    public function userAutocomplete(Request $request, UserRepository $userRepository): JsonResponse
    {
        $query = $request->query->get('q', '');
        
        // Get current user
        $user = $this->getUser();
        
        // Determine allowed roles based on current user's role
        $allowedRoles = $this->getAllowedSearchRoles($user);
        
        // Get autocomplete results with role filtering
        $users = $userRepository->findAutocompleteResults($query, $allowedRoles);
        
        // Format the results
        $formattedUsers = [];
        foreach ($users as $user) {
            $roles = [];
            foreach ($user->getUserRoles() as $userRole) {
                $roles[] = $userRole->getRole()->getName();
            }
            
            $formattedUsers[] = [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'roles' => $roles
            ];
        }
        
        return $this->json($formattedUsers);
    }

    /**
     * Determine which roles the current user is allowed to search for
     * 
     * @param User|null $user The current user
     * @return array Array of allowed role names
     */
    private function getAllowedSearchRoles(?User $user): array
    {
        // Default - guest can only search recruiters
        $allowedRoles = ['RECRUITER'];
        
        if (!$user) {
            // Not logged in - treat as guest
            $this->logger->debug('Guest user detected, applying role restrictions', ['allowedRoles' => $allowedRoles]);
            return $allowedRoles;
        }
        
        // Get user roles
        $userRoles = $user->getRoles();
        $this->logger->debug('Current user roles', ['roles' => $userRoles]);
        
        // Check if user has any of these roles (with or without ROLE_ prefix)
        $superAdminRoles = ['SUPERADMIN', 'ROLE_SUPERADMIN', 'SUPER_ADMIN', 'ROLE_SUPER_ADMIN'];
        $adminRoles = ['ADMIN', 'ROLE_ADMIN'];
        $teacherRoles = ['TEACHER', 'ROLE_TEACHER'];
        $hrRoles = ['HR', 'ROLE_HR'];
        $recruiterRoles = ['RECRUITER', 'ROLE_RECRUITER'];
        $studentRoles = ['STUDENT', 'ROLE_STUDENT'];
        $guestRoles = ['GUEST', 'ROLE_GUEST'];
        
        $hasSuperAdminRole = count(array_intersect($superAdminRoles, $userRoles)) > 0;
        $hasAdminRole = count(array_intersect($adminRoles, $userRoles)) > 0 && !$hasSuperAdminRole;
        $hasTeacherRole = count(array_intersect($teacherRoles, $userRoles)) > 0 && !$hasAdminRole && !$hasSuperAdminRole;
        $hasHrRole = count(array_intersect($hrRoles, $userRoles)) > 0 && !$hasAdminRole && !$hasSuperAdminRole;
        $hasRecruiterRole = count(array_intersect($recruiterRoles, $userRoles)) > 0 && !$hasAdminRole && !$hasSuperAdminRole && !$hasTeacherRole && !$hasHrRole;
        $hasStudentRole = count(array_intersect($studentRoles, $userRoles)) > 0;
        $hasGuestRole = count(array_intersect($guestRoles, $userRoles)) > 0;
        
        if ($hasSuperAdminRole) {
            // Super Admin peut chercher absolument tous les rôles
            $allowedRoles = [
                'SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'SUPERADMIN', 'ROLE_SUPERADMIN',
                'ADMIN', 'ROLE_ADMIN', 
                'TEACHER', 'ROLE_TEACHER', 
                'STUDENT', 'ROLE_STUDENT', 
                'RECRUITER', 'ROLE_RECRUITER', 
                'HR', 'ROLE_HR', 
                'GUEST', 'ROLE_GUEST'
            ];
            $this->logger->debug('Super Admin user detected, allowing ALL roles', ['allowedRoles' => $allowedRoles]);
        }
        else if ($hasAdminRole) {
            // Admin peut chercher tous les rôles SAUF superadmin
            $allowedRoles = [
                'ADMIN', 'ROLE_ADMIN', 
                'TEACHER', 'ROLE_TEACHER', 
                'STUDENT', 'ROLE_STUDENT', 
                'RECRUITER', 'ROLE_RECRUITER', 
                'HR', 'ROLE_HR', 
                'GUEST', 'ROLE_GUEST'
            ];
            $this->logger->debug('Admin user detected, allowing all roles except superadmin', ['allowedRoles' => $allowedRoles]);
        }
        else if ($hasTeacherRole) {
            // Les formateurs ne peuvent chercher que les étudiants et les RH
            $allowedRoles = ['STUDENT', 'ROLE_STUDENT', 'HR', 'ROLE_HR'];
            $this->logger->debug('Teacher user detected, restricting to STUDENT and HR roles', ['allowedRoles' => $allowedRoles]);
        }
        else if ($hasHrRole) {
            // Les RH peuvent chercher les étudiants, formateurs et recruteurs
            $allowedRoles = ['TEACHER', 'ROLE_TEACHER', 'STUDENT', 'ROLE_STUDENT', 'RECRUITER', 'ROLE_RECRUITER'];
            $this->logger->debug('HR user detected, restricting to TEACHER, STUDENT and RECRUITER roles', ['allowedRoles' => $allowedRoles]);
        }
        else if ($hasRecruiterRole) {
            // Les recruteurs ne peuvent chercher que les étudiants et les formateurs
            $allowedRoles = ['TEACHER', 'ROLE_TEACHER', 'STUDENT', 'ROLE_STUDENT'];
            $this->logger->debug('Recruiter user detected, restricting to TEACHER and STUDENT roles', ['allowedRoles' => $allowedRoles]);
        }
        else if ($hasStudentRole) {
            // Students can only search for students, teachers, recruiters, and HR
            $allowedRoles = ['TEACHER', 'ROLE_TEACHER', 'STUDENT', 'ROLE_STUDENT', 'RECRUITER', 'ROLE_RECRUITER', 'HR', 'ROLE_HR'];
            $this->logger->debug('Student user detected, applying role restrictions', ['allowedRoles' => $allowedRoles]);
        } else if ($hasGuestRole) {
            // Guests can only search recruiters
            $allowedRoles = ['RECRUITER', 'ROLE_RECRUITER'];
            $this->logger->debug('Guest user detected, applying role restrictions', ['allowedRoles' => $allowedRoles]);
        }
        
        return $allowedRoles;
    }
}
?>
