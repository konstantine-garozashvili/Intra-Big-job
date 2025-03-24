<?php

namespace App\Entity;

use App\Domains\Global\Repository\DomainRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: DomainRepository::class)]
class Domain
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['domain:read', 'specialization:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['domain:read', 'specialization:read'])]
    private ?string $name = null;

    #[ORM\OneToMany(mappedBy: 'domain', targetEntity: Specialization::class, orphanRemoval: true)]
    #[Groups(['domain:read'])]
    private Collection $specializations;

    public function __construct()
    {
        $this->specializations = new ArrayCollection();
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

    /**
     * @return Collection<int, Specialization>
     */
    public function getSpecializations(): Collection
    {
        return $this->specializations;
    }

    public function addSpecialization(Specialization $specialization): static
    {
        if (!$this->specializations->contains($specialization)) {
            $this->specializations->add($specialization);
            $specialization->setDomain($this);
        }

        return $this;
    }

    public function removeSpecialization(Specialization $specialization): static
    {
        if ($this->specializations->removeElement($specialization)) {
            // set the owning side to null (unless already changed)
            if ($specialization->getDomain() === $this) {
                $specialization->setDomain(null);
            }
        }

        return $this;
    }
} 