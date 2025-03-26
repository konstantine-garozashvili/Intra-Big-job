<?php

namespace App\Entity;

use App\Repository\UserDiplomaRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserDiplomaRepository::class)]
class UserDiploma
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['diploma:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'userDiplomas')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['diploma:read'])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'userDiplomas')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user:read'])]
    private ?Diploma $diploma = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['diploma:read', 'user:read'])]
    private ?\DateTimeInterface $obtainedDate = null;

    // Vous pouvez ajouter d'autres champs spécifiques à l'obtention du diplôme
    // comme la note, les mentions, etc.

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

    public function getDiploma(): ?Diploma
    {
        return $this->diploma;
    }

    public function setDiploma(?Diploma $diploma): static
    {
        $this->diploma = $diploma;

        return $this;
    }

    public function getObtainedDate(): ?\DateTimeInterface
    {
        return $this->obtainedDate;
    }

    public function setObtainedDate(\DateTimeInterface $obtainedDate): static
    {
        $this->obtainedDate = $obtainedDate;

        return $this;
    }
} 