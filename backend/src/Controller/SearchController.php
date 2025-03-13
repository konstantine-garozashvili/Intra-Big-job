<?php
// src/Controller/SearchController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\UserRepository;

class SearchController extends AbstractController
{
    #[Route('/api/user-autocomplete', name: 'user_autocomplete', methods: ['GET'])]
    public function autocomplete(Request $request, UserRepository $userRepository): JsonResponse
    {
        $query = $request->query->get('q', '');

        // Do not run search for very short terms
        if (strlen($query) < 2) {
            return $this->json([]);
        }

        // Determine allowed roles based on current user's role
        $currentUser = $this->getUser();
        $allowedRoles = null;
        if (!$currentUser) {
            // Guest: limit to students and recruiters only.
            $allowedRoles = ["ROLE_STUDENT", "ROLE_RECRUITER", ];
        } else {
            $userRoles = $currentUser->getRoles();
            if (in_array('ROLE_STUDENT', $userRoles, true)) {
                // Student: restrict access to admins and superadmins.
                // (Allowed: students, teachers, recruiters, etc.)
                $allowedRoles = ["ROLE_STUDENT", "ROLE_TEACHER", "ROLE_RECRUITER", ];
            }
            // For teachers and others, no restrictions (allowedRoles remains null).
        }

        // Use a custom repository method to search users with optional role restrictions.
        $results = $userRepository->findAutocompleteResults($query, $allowedRoles ?? []);

        // Prepare JSON data (returning id, lastName and firstName)
        $data = [];
        foreach ($results as $user) {
            $role = $user->getRoles()[0];
            if ($allowedRoles !== null && !in_array($role, $allowedRoles, true)) {
                continue;
            }
            $data[] = [
                'id'        => $user->getId(),
                'lastName'  => $user->getLastName(),
                'firstName' => $user->getFirstName(),
                'role' => $role
            ];
        }

        return $this->json($data);
    }
}
?>
