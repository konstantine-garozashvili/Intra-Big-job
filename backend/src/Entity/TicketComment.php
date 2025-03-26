<?php

namespace App\Entity;

use App\Repository\TicketCommentRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: TicketCommentRepository::class)]
class TicketComment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['ticket:read', 'comment:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'text')]
    #[Groups(['ticket:read', 'comment:read'])]
    private ?string $content = null;

    #[ORM\Column]
    #[Groups(['ticket:read', 'comment:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'comments')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Ticket $ticket = null;

    #[ORM\Column]
    #[Groups(['ticket:read', 'comment:read'])]
    private ?bool $isFromAdmin = false;

    #[ORM\ManyToOne]
    #[Groups(['comment:read'])]
    private ?User $author = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

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

    public function getTicket(): ?Ticket
    {
        return $this->ticket;
    }

    public function setTicket(?Ticket $ticket): static
    {
        $this->ticket = $ticket;

        return $this;
    }

    public function isIsFromAdmin(): ?bool
    {
        return $this->isFromAdmin;
    }

    public function setIsFromAdmin(bool $isFromAdmin): static
    {
        $this->isFromAdmin = $isFromAdmin;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }
} 