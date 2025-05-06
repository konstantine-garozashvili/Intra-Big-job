<?php

namespace App\Entity;

use App\Repository\FormationTeacherRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: FormationTeacherRepository::class)]
#[ORM\HasLifecycleCallbacks]
class FormationTeacher
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['formation_teacher:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Formation::class, inversedBy: 'formationTeachers')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['formation_teacher:read'])]
    private ?Formation $formation = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'teacherFormations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['formation_teacher:read'])]
    private ?User $user = null;

    #[ORM\Column]
    #[Groups(['formation_teacher:read'])]
    private bool $isMainTeacher = false;

    #[ORM\Column]
    #[Groups(['formation_teacher:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(nullable: true)]
    #[Groups(['formation_teacher:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFormation(): ?Formation
    {
        return $this->formation;
    }

    public function setFormation(?Formation $formation): self
    {
        $this->formation = $formation;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function isMainTeacher(): bool
    {
        return $this->isMainTeacher;
    }

    public function setIsMainTeacher(bool $isMainTeacher): self
    {
        $this->isMainTeacher = $isMainTeacher;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
} 