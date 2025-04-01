<?php

namespace App\Domains\Student\Service;

use App\Domains\Student\Entity\StudentProfile;
use App\Domains\Student\Repository\StudentProfileRepository;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class StudentProfileService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private StudentProfileRepository $studentProfileRepository
    ) {
    }

    /**
     * Get a student profile by user ID
     */
    public function getProfileByUser(User $user): ?StudentProfile
    {
        return $this->studentProfileRepository->findByUserWithRelations($user->getId());
    }

    /**
     * Update job seeking statuses
     */
    public function updateJobSeekingStatus(
        StudentProfile $profile, 
        ?bool $isSeekingInternship = null, 
        ?bool $isSeekingApprenticeship = null
    ): StudentProfile {
        if ($isSeekingInternship !== null) {
            $profile->setIsSeekingInternship($isSeekingInternship);
        }
        
        if ($isSeekingApprenticeship !== null) {
            $profile->setIsSeekingApprenticeship($isSeekingApprenticeship);
        }
        
        $this->entityManager->flush();
        
        return $profile;
    }

    /**
     * Toggle internship seeking status
     */
    public function toggleInternshipSeeking(StudentProfile $profile): StudentProfile
    {
        $profile->setIsSeekingInternship(!$profile->isSeekingInternship());
        $this->entityManager->flush();
        
        return $profile;
    }
    
    /**
     * Toggle apprenticeship seeking status
     */
    public function toggleApprenticeshipSeeking(StudentProfile $profile): StudentProfile
    {
        $profile->setIsSeekingApprenticeship(!$profile->isSeekingApprenticeship());
        $this->entityManager->flush();
        
        return $profile;
    }

    /**
     * Get all students seeking internship
     */
    public function getStudentsSeekingInternship(): array
    {
        return $this->studentProfileRepository->findSeekingInternshipWithRelations();
    }

    /**
     * Get all students seeking apprenticeship
     */
    public function getStudentsSeekingApprenticeship(): array
    {
        return $this->studentProfileRepository->findSeekingApprenticeshipWithRelations();
    }
    
    /**
     * Get all students seeking any job opportunity (internship or apprenticeship)
     */
    public function getStudentsSeekingJobs(): array
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
        
        return $uniqueProfiles;
    }
} 