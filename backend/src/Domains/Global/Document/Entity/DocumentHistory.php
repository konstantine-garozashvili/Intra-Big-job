<?php

namespace App\Domains\Global\Document\Entity;

use App\Enum\DocumentAction;
use App\Domains\Global\Document\Repository\DocumentHistoryRepository;
use App\Entity\User;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: DocumentHistoryRepository::class)]
#[ORM\HasLifecycleCallbacks]
class DocumentHistory
{
    public const ACTION_UPLOAD = 'UPLOAD';
    public const ACTION_UPDATE = 'UPDATE';
    public const ACTION_APPROVE = 'APPROVE';
    public const ACTION_REJECT = 'REJECT';
    public const ACTION_DELETE = 'DELETE';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['document:read', 'document_history:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Document::class, inversedBy: 'history')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['document_history:read'])]
    private ?Document $document = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['document:read', 'document_history:read'])]
    private ?User $user = null;

    #[ORM\Column(type: 'string', enumType: DocumentAction::class)]
    #[Groups(['document:read', 'document_history:read'])]
    private DocumentAction $action;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['document:read', 'document_history:read'])]
    private ?array $details = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['document:read', 'document_history:read'])]
    private ?\DateTimeInterface $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDocument(): ?Document
    {
        return $this->document;
    }

    public function setDocument(?Document $document): self
    {
        $this->document = $document;
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

    public function getAction(): DocumentAction
    {
        return $this->action;
    }

    public function setAction(DocumentAction $action): self
    {
        $this->action = $action;
        return $this;
    }

    public function getDetails(): ?array
    {
        return $this->details;
    }

    public function setDetails(?array $details): self
    {
        $this->details = $details;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }
} 