<?php

namespace App\Domains\Student\Controller;

use App\Domains\Student\Entity\StudentProfile;
use App\Domains\Student\Repository\StudentProfileRepository;
use App\Entity\User;
use App\Service\ValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/student/profile')]
class StudentProfileController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private StudentProfileRepository $studentProfileRepository,
        private SerializerInterface $serializer,
        private ValidationService $validationService
    ) {
    }

    /**
     * Get the student profile of the current authenticated user
     */
    #[Route('', methods: ['GET'])]
    #[IsGranted('ROLE_STUDENT')]
    public function getMyProfile(#[CurrentUser] User $user): JsonResponse
    {
        $profile = $this->studentProfileRepository->findByUserWithRelations($user->getId());
        
        if (!$profile) {
            return $this->json(['message' => 'Profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        return $this->json($profile, Response::HTTP_OK, [], ['groups' => ['student_profile:read']]);
    }

    /**
     * Update the job seeking status (internship/apprenticeship)
     */
    #[Route('/job-seeking-status', methods: ['PATCH', 'PUT'])]
    #[IsGranted('ROLE_STUDENT')]
    public function updateJobSeekingStatus(#[CurrentUser] User $user, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['isSeekingInternship']) && !isset($data['isSeekingApprenticeship'])) {
            return $this->json(['message' => 'At least one job seeking status must be provided'], Response::HTTP_BAD_REQUEST);
        }
        
        $profile = $this->studentProfileRepository->findByUserWithRelations($user->getId());
        
        if (!$profile) {
            return $this->json(['message' => 'Profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        if (isset($data['isSeekingInternship'])) {
            $profile->setIsSeekingInternship((bool) $data['isSeekingInternship']);
        }
        
        if (isset($data['isSeekingApprenticeship'])) {
            $profile->setIsSeekingApprenticeship((bool) $data['isSeekingApprenticeship']);
        }
        
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Job seeking status updated successfully',
            'profile' => $profile
        ], Response::HTTP_OK, [], ['groups' => ['student_profile:read']]);
    }

    /**
     * Update the portfolio URL for the student
     */
    #[Route('/portfolio-url', methods: ['PATCH', 'PUT'])]
    #[IsGranted('ROLE_STUDENT')]
    public function updatePortfolioUrl(#[CurrentUser] User $user, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['portfolioUrl'])) {
            return $this->json(['message' => 'Portfolio URL must be provided'], Response::HTTP_BAD_REQUEST);
        }
        
        $profile = $this->studentProfileRepository->findByUserWithRelations($user->getId());
        
        if (!$profile) {
            return $this->json(['message' => 'Profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        // Validate URL format if not empty
        if (!empty($data['portfolioUrl']) && !$this->validationService->isValidPortfolioUrl($data['portfolioUrl'])) {
            return $this->json([
                'success' => false,
                'message' => 'L\'URL du portfolio doit commencer par https://'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        $profile->setPortfolioUrl($data['portfolioUrl']);
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Portfolio URL updated successfully',
            'profile' => $profile
        ], Response::HTTP_OK, [], ['groups' => ['student_profile:read']]);
    }

    /**
     * Get all students seeking internship (for authorized roles)
     */
    #[Route('/seeking-internship', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN', 'ROLE_HR', 'ROLE_TEACHER')]
    public function getStudentsSeekingInternship(): JsonResponse
    {
        $profiles = $this->studentProfileRepository->findSeekingInternshipWithRelations();
        
        return $this->json($profiles, Response::HTTP_OK, [], ['groups' => ['student_profile:read']]);
    }

    /**
     * Get all students seeking apprenticeship (for authorized roles)
     */
    #[Route('/seeking-apprenticeship', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN', 'ROLE_HR', 'ROLE_TEACHER')]
    public function getStudentsSeekingApprenticeship(): JsonResponse
    {
        $profiles = $this->studentProfileRepository->findSeekingApprenticeshipWithRelations();
        
        return $this->json($profiles, Response::HTTP_OK, [], ['groups' => ['student_profile:read']]);
    }

    /**
     * Get all students seeking either internship or apprenticeship (for authorized roles)
     */
    #[Route('/seeking-jobs', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN', 'ROLE_HR', 'ROLE_TEACHER')]
    public function getStudentsSeekingJobs(): JsonResponse
    {
        $internshipProfiles = $this->studentProfileRepository->findSeekingInternshipWithRelations();
        $apprenticeshipProfiles = $this->studentProfileRepository->findSeekingApprenticeshipWithRelations();
        
        // Merge and remove duplicates
        $allProfiles = array_merge($internshipProfiles, $apprenticeshipProfiles);
        $uniqueProfiles = [];
        $ids = [];
        
        foreach ($allProfiles as $profile) {
            if (!in_array($profile->getId(), $ids)) {
                $uniqueProfiles[] = $profile;
                $ids[] = $profile->getId();
            }
        }
        
        return $this->json($uniqueProfiles, Response::HTTP_OK, [], ['groups' => ['student_profile:read']]);
    }

    /**
     * Toggle the student's internship seeking status
     */
    #[Route('/toggle-internship-seeking', methods: ['PATCH', 'PUT'])]
    #[IsGranted('ROLE_STUDENT')]
    public function toggleInternshipSeeking(#[CurrentUser] User $user): JsonResponse
    {
        $profile = $this->studentProfileRepository->findByUserWithRelations($user->getId());
        
        if (!$profile) {
            return $this->json(['message' => 'Profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        $profile->setIsSeekingInternship(!$profile->isSeekingInternship());
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Internship seeking status toggled successfully',
            'isSeekingInternship' => $profile->isSeekingInternship(),
            'profile' => $profile
        ], Response::HTTP_OK, [], ['groups' => ['student_profile:read']]);
    }

    /**
     * Toggle the student's apprenticeship seeking status
     */
    #[Route('/toggle-apprenticeship-seeking', methods: ['PATCH', 'PUT'])]
    #[IsGranted('ROLE_STUDENT')]
    public function toggleApprenticeshipSeeking(#[CurrentUser] User $user): JsonResponse
    {
        $profile = $this->studentProfileRepository->findByUserWithRelations($user->getId());
        
        if (!$profile) {
            return $this->json(['message' => 'Profile not found'], Response::HTTP_NOT_FOUND);
        }
        
        $profile->setIsSeekingApprenticeship(!$profile->isSeekingApprenticeship());
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Apprenticeship seeking status toggled successfully',
            'isSeekingApprenticeship' => $profile->isSeekingApprenticeship(),
            'profile' => $profile
        ], Response::HTTP_OK, [], ['groups' => ['student_profile:read']]);
    }
} 