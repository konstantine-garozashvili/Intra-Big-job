<?php

namespace App\Domains\Student\Entity;

use App\Entity\User;
use App\Entity\UserSituationType;
use App\Domains\Student\Repository\StudentProfileRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: StudentProfileRepository::class)]
#[ORM\HasLifecycleCallbacks]
class StudentProfile
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['student_profile:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: User::class, inversedBy: 'studentProfile')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['student_profile:read'])]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: UserSituationType::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['student_profile:read', 'user:read'])]
    private ?UserSituationType $situationType = null;

    #[ORM\Column]
    #[Groups(['student_profile:read', 'user:read'])]
    private bool $isSeekingInternship = false;

    #[ORM\Column]
    #[Groups(['student_profile:read', 'user:read'])]
    private bool $isSeekingApprenticeship = false;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['student_profile:read', 'user:read'])]
    private ?string $currentInternshipCompany = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['student_profile:read', 'user:read'])]
    private ?\DateTimeInterface $internshipStartDate = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['student_profile:read', 'user:read'])]
    private ?\DateTimeInterface $internshipEndDate = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['student_profile:read', 'user:read'])]
    private ?string $portfolioUrl = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['student_profile:read', 'user:read'])]
    private \DateTimeInterface $createdAt;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['student_profile:read', 'user:read'])]
    private \DateTimeInterface $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    // Getters and Setters
    public function getId(): ?int
    {
        return $this->id;
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

    public function getSituationType(): ?UserSituationType
    {
        return $this->situationType;
    }

    public function setSituationType(?UserSituationType $situationType): self
    {
        $this->situationType = $situationType;
        return $this;
    }

    public function isSeekingInternship(): bool
    {
        return $this->isSeekingInternship;
    }

    public function setIsSeekingInternship(bool $isSeekingInternship): self
    {
        $this->isSeekingInternship = $isSeekingInternship;
        return $this;
    }

    public function isSeekingApprenticeship(): bool
    {
        return $this->isSeekingApprenticeship;
    }

    public function setIsSeekingApprenticeship(bool $isSeekingApprenticeship): self
    {
        $this->isSeekingApprenticeship = $isSeekingApprenticeship;
        return $this;
    }

    public function getCurrentInternshipCompany(): ?string
    {
        return $this->currentInternshipCompany;
    }

    public function setCurrentInternshipCompany(?string $currentInternshipCompany): self
    {
        $this->currentInternshipCompany = $currentInternshipCompany;
        return $this;
    }

    public function getInternshipStartDate(): ?\DateTimeInterface
    {
        return $this->internshipStartDate;
    }

    public function setInternshipStartDate(?\DateTimeInterface $internshipStartDate): self
    {
        $this->internshipStartDate = $internshipStartDate;
        return $this;
    }

    public function getInternshipEndDate(): ?\DateTimeInterface
    {
        return $this->internshipEndDate;
    }

    public function setInternshipEndDate(?\DateTimeInterface $internshipEndDate): self
    {
        $this->internshipEndDate = $internshipEndDate;
        return $this;
    }

    public function getPortfolioUrl(): ?string
    {
        return $this->portfolioUrl;
    }

    public function setPortfolioUrl(?string $portfolioUrl): self
    {
        $this->portfolioUrl = $portfolioUrl;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}