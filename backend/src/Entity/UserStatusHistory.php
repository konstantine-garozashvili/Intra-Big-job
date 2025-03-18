<?php

namespace App\Entity;

use App\Repository\UserStatusHistoryRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserStatusHistoryRepository::class)]
class UserStatusHistory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user_status_history:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'statusHistories')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_status_history:read'])]
    private ?UserStatus $userStatus = null;

    #[ORM\Column]
    #[Groups(['user_status_history:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserStatus(): ?UserStatus
    {
        return $this->userStatus;
    }

    public function setUserStatus(?UserStatus $userStatus): static
    {
        $this->userStatus = $userStatus;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }
} 