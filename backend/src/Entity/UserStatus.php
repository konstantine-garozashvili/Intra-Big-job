<?php

namespace App\Entity;

use App\Repository\UserStatusRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: UserStatusRepository::class)]
class UserStatus
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user_status:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user_status:read', 'user:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user_status:read', 'user:read'])]
    private ?string $description = null;

    #[ORM\ManyToOne(targetEntity: Role::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user_status:read'])]
    private ?Role $associatedRole = null;

    #[ORM\OneToMany(mappedBy: 'status', targetEntity: UserStatusHistory::class)]
    private Collection $statusHistories;

    public function __construct()
    {
        $this->statusHistories = new ArrayCollection();
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getAssociatedRole(): ?Role
    {
        return $this->associatedRole;
    }

    public function setAssociatedRole(?Role $associatedRole): static
    {
        $this->associatedRole = $associatedRole;
        return $this;
    }

    /**
     * @return Collection<int, UserStatusHistory>
     */
    public function getStatusHistories(): Collection
    {
        return $this->statusHistories;
    }

    public function addStatusHistory(UserStatusHistory $statusHistory): static
    {
        if (!$this->statusHistories->contains($statusHistory)) {
            $this->statusHistories->add($statusHistory);
            $statusHistory->setStatus($this);
        }

        return $this;
    }

    public function removeStatusHistory(UserStatusHistory $statusHistory): static
    {
        if ($this->statusHistories->removeElement($statusHistory)) {
            if ($statusHistory->getStatus() === $this) {
                $statusHistory->setStatus(null);
            }
        }

        return $this;
    }
} 