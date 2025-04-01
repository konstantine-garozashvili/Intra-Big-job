<?php

namespace App\Entity;

use App\Repository\GroupRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: GroupRepository::class)]
#[ORM\Table(name: '`group`')]
class Group
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['group:read', 'message:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['group:read', 'message:read'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['group:read', 'message:read'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['group:read', 'message:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'createdGroups')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['group:read', 'message:read'])]
    private ?User $creator = null;

    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'groups')]
    #[Groups(['group:read', 'message:read'])]
    private Collection $members;

    #[ORM\OneToMany(mappedBy: 'group', targetEntity: Message::class, orphanRemoval: true)]
    private Collection $messages;

    public function __construct()
    {
        $this->members = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCreator(): ?User
    {
        return $this->creator;
    }

    public function setCreator(?User $creator): static
    {
        $this->creator = $creator;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getMembers(): Collection
    {
        return $this->members;
    }

    public function addMember(User $member): static
    {
        if (!$this->members->contains($member)) {
            $this->members->add($member);
        }

        return $this;
    }

    public function removeMember(User $member): static
    {
        $this->members->removeElement($member);

        return $this;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Message $message): static
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setGroup($this);
        }

        return $this;
    }

    public function removeMessage(Message $message): static
    {
        if ($this->messages->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getGroup() === $this) {
                $message->setGroup(null);
            }
        }

        return $this;
    }

    /**
     * Check if a user is a member of this group
     */
    public function isMember(User $user): bool
    {
        return $this->members->contains($user);
    }

    /**
     * Check if a user is the creator of this group
     */
    public function isCreator(User $user): bool
    {
        return $this->creator === $user;
    }

    /**
     * Check if a user can manage this group (creator or teacher)
     */
    public function canManage(User $user): bool
    {
        return $this->isCreator($user) || in_array('ROLE_TEACHER', $user->getRoles());
    }
}
