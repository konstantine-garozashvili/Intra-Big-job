<?php

namespace App\Entity;

use App\Repository\DiplomaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: DiplomaRepository::class)]
class Diploma
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['diploma:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['diploma:read', 'user:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Groups(['diploma:read', 'user:read'])]
    private ?string $institution = null;

    #[ORM\OneToMany(mappedBy: 'diploma', targetEntity: UserDiploma::class, orphanRemoval: true)]
    private Collection $userDiplomas;

    public function __construct()
    {
        $this->userDiplomas = new ArrayCollection();
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

    public function getInstitution(): ?string
    {
        return $this->institution;
    }

    public function setInstitution(string $institution): static
    {
        $this->institution = $institution;

        return $this;
    }

    /**
     * @return Collection<int, UserDiploma>
     */
    public function getUserDiplomas(): Collection
    {
        return $this->userDiplomas;
    }

    public function addUserDiploma(UserDiploma $userDiploma): static
    {
        if (!$this->userDiplomas->contains($userDiploma)) {
            $this->userDiplomas->add($userDiploma);
            $userDiploma->setDiploma($this);
        }

        return $this;
    }

    public function removeUserDiploma(UserDiploma $userDiploma): static
    {
        if ($this->userDiplomas->removeElement($userDiploma)) {
            // set the owning side to null (unless already changed)
            if ($userDiploma->getDiploma() === $this) {
                $userDiploma->setDiploma(null);
            }
        }

        return $this;
    }
}