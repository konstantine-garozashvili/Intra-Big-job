<?php

namespace App\Event;

use App\Entity\User;
use Symfony\Contracts\EventDispatcher\Event;

class UserProfileUpdatedEvent extends Event
{
    public const NAME = 'user.profile.updated';

    public function __construct(private readonly User $user, private readonly array $updatedData = [])
    {
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getUpdatedData(): array
    {
        return $this->updatedData;
    }
} 