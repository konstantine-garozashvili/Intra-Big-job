<?php

namespace App\Entity;

use App\Repository\FormationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use App\Entity\User;
use App\Entity\Specialization;

#[ORM\Entity(repositoryClass: FormationRepository::class)]
class Formation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['formation:read'])]
    private ?int $id = null;
    
    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['formation:read'])]
    private ?string $name = null;
    
    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['formation:read'])]
    private ?string $promotion = null;
    
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['formation:read'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Assert\NotBlank]
    #[Assert\Positive]
    #[Groups(['formation:read'])]
    private ?int $capacity = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Assert\NotBlank]
    #[Groups(['formation:read'])]
    private ?\DateTimeInterface $dateStart = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['formation:read'])]
    private ?string $location = null;

    #[ORM\Column]
    #[Assert\NotBlank]
    #[Assert\Positive]
    #[Groups(['formation:read'])]
    private ?int $duration = null;
    
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'formations')]
    #[ORM\JoinTable(name: 'formation_student')]
    #[Groups(['formation:read'])]
    private Collection $students;

    #[ORM\OneToMany(mappedBy: 'formation', targetEntity: FormationEnrollmentRequest::class)]
    private Collection $enrollmentRequests;

    #[ORM\ManyToOne(targetEntity: Specialization::class, inversedBy: 'formations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['formation:read', 'specialization:item'])]
    private ?Specialization $specialization = null;
    
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['formation:read'])]
    private ?string $imageUrl = null;
    
    public function __construct()
    {
        $this->students = new ArrayCollection();
        $this->enrollmentRequests = new ArrayCollection();
    }
    
    public function getId(): ?int
    {
        return $this->id;
    }
    
    public function getName(): ?string
    {
        return $this->name;
    }
    
    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }
    
    public function getPromotion(): ?string
    {
        return $this->promotion;
    }
    
    public function setPromotion(string $promotion): static
    {
        $this->promotion = $promotion;
        return $this;
    }
    
    public function getDescription(): ?string
    {
        return $this->description;
    }
    
    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getCapacity(): ?int
    {
        return $this->capacity;
    }

    public function setCapacity(int $capacity): static
    {
        $this->capacity = $capacity;
        return $this;
    }

    public function getDateStart(): ?\DateTimeInterface
    {
        return $this->dateStart;
    }

    public function setDateStart(\DateTimeInterface $dateStart): static
    {
        $this->dateStart = $dateStart;
        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;
        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): static
    {
        $this->duration = $duration;
        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getStudents(): Collection
    {
        return $this->students;
    }
    // Ajoute un étudiant à la formation
    public function addStudent(User $student): self
    {
        if (!$this->students->contains($student)) {
            $this->students->add($student);
        }
        return $this;
    }
    
    public function removeStudent(User $student): self
    {
        $this->students->removeElement($student);
        return $this;
    }

    /**
     * @return Collection<int, FormationEnrollmentRequest>
     */
    public function getEnrollmentRequests(): Collection
    {
        return $this->enrollmentRequests;
    }

    public function addEnrollmentRequest(FormationEnrollmentRequest $enrollmentRequest): static
    {
        if (!$this->enrollmentRequests->contains($enrollmentRequest)) {
            $this->enrollmentRequests->add($enrollmentRequest);
            $enrollmentRequest->setFormation($this);
        }
        return $this;
    }

    public function removeEnrollmentRequest(FormationEnrollmentRequest $enrollmentRequest): static
    {
        if ($this->enrollmentRequests->removeElement($enrollmentRequest)) {
            // set the owning side to null (unless already changed)
            if ($enrollmentRequest->getFormation() === $this) {
                $enrollmentRequest->setFormation(null);
            }
        }
        return $this;
    }

    public function getSpecialization(): ?Specialization
    {
        return $this->specialization;
    }

    public function setSpecialization(?Specialization $specialization): static
    {
        $this->specialization = $specialization;
        return $this;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): static
    {
        $this->imageUrl = $imageUrl;
        return $this;
    }
}
