<?php

namespace App\Entity;

use App\Repository\SignatureRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: SignatureRepository::class)]
class Signature
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['signature:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'signatures')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['signature:read'])]
    private ?User $user = null;

    #[ORM\Column]
    #[Groups(['signature:read'])]
    private ?\DateTimeImmutable $date = null;

    #[ORM\Column(length: 255)]
    #[Groups(['signature:read'])]
    private ?string $location = null;

    #[ORM\Column]
    #[Groups(['signature:read'])]
    private bool $validated = false;

    #[ORM\OneToMany(mappedBy: 'signature', targetEntity: Validation::class, orphanRemoval: true)]
    private Collection $validations;

    public function __construct()
    {
        $this->date = new \DateTimeImmutable();
        $this->validations = new ArrayCollection();
    }

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

    public function getDate(): ?\DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(string $location): static
    {
        $this->location = $location;

        return $this;
    }

    public function isValidated(): bool
    {
        return $this->validated;
    }

    public function setValidated(bool $validated): static
    {
        $this->validated = $validated;

        return $this;
    }

    /**
     * @return Collection<int, Validation>
     */
    public function getValidations(): Collection
    {
        return $this->validations;
    }

    public function addValidation(Validation $validation): static
    {
        if (!$this->validations->contains($validation)) {
            $this->validations->add($validation);
            $validation->setSignature($this);
        }

        return $this;
    }

    public function removeValidation(Validation $validation): static
    {
        if ($this->validations->removeElement($validation)) {
            // set the owning side to null (unless already changed)
            if ($validation->getSignature() === $this) {
                $validation->setSignature(null);
            }
        }

        return $this;
    }
}
