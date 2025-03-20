<?php

namespace App\Entity;

use App\Repository\StatusRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: StatusRepository::class)]
class Status
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['status:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['status:read', 'user:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['status:read', 'user:read'])]
    private ?string $description = null;

    #[ORM\OneToMany(mappedBy: 'status', targetEntity: UserStatus::class)]
    private Collection $userStatuses;

    public function __construct()
    {
        $this->userStatuses = new ArrayCollection();
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

    /**
     * @return Collection<int, UserStatus>
     */
    public function getUserStatuses(): Collection
    {
        return $this->userStatuses;
    }

    public function addUserStatus(UserStatus $userStatus): static
    {
        if (!$this->userStatuses->contains($userStatus)) {
            $this->userStatuses->add($userStatus);
            $userStatus->setStatus($this);
        }
        return $this;
    }

    public function removeUserStatus(UserStatus $userStatus): static
    {
        if ($this->userStatuses->removeElement($userStatus)) {
            if ($userStatus->getStatus() === $this) {
                $userStatus->setStatus(null);
            }
        }
        return $this;
    }
}