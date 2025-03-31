<?php

namespace App\EventListener;

use App\Entity\User;
use App\Domains\Student\Entity\StudentProfile;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;

class UserRoleListener
{
    public function preUpdate(User $user, PreUpdateEventArgs $event): void
    {
        // Check if the 'roles' field is being updated
        if ($event->hasChangedField('roles')) {
            $newRoles = $event->getNewValue('roles');
            $oldRoles = $event->getOldValue('roles');

            // Check if the new roles include 'ROLE_STUDENT' and the old roles did not
            if (in_array('ROLE_STUDENT', $newRoles) && !in_array('ROLE_STUDENT', $oldRoles)) {
                // Create a new StudentProfile if it doesn't exist
                if (!$user->getStudentProfile()) {
                    $studentProfile = new StudentProfile();
                    $studentProfile->setUser($user);
                    $studentProfile->setIsSeekingInternship(false);
                    $studentProfile->setIsSeekingApprenticeship(false);
                    $studentProfile->setCreatedAt(new \DateTimeImmutable());

                    $user->setStudentProfile($studentProfile);
                }
            }
        }
    }
}