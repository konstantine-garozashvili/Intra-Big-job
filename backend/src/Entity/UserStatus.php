<?php

namespace App\Entity;

use App\Repository\UserStatusRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserStatusRepository::class)]
class UserStatus
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user_status:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'userStatuses')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_status:read'])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'userStatuses')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_status:read'])]
    private ?Status $status = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getStatus(): ?Status
    {
        return $this->status;
    }

    public function setStatus(?Status $status): static
    {
        $this->status = $status;
        return $this;
    }
} 