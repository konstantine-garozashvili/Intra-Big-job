<?php

namespace App\Domains\Global\Document\Entity;

use App\Domains\Global\Document\Repository\DocumentTypeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: DocumentTypeRepository::class)]
#[ORM\HasLifecycleCallbacks]
class DocumentType
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['document:read', 'document_type:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['document:read', 'document_type:read'])]
    private ?string $code = null;

    #[ORM\Column(length: 100)]
    #[Groups(['document:read', 'document_type:read'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['document:read', 'document_type:read'])]
    private ?string $description = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['document:read', 'document_type:read'])]
    private array $allowedMimeTypes = [];

    #[ORM\Column]
    #[Groups(['document:read', 'document_type:read'])]
    private int $maxFileSize = 10485760; // 10MB par défaut

    #[ORM\Column]
    #[Groups(['document:read', 'document_type:read'])]
    private bool $isRequired = false;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Groups(['document:read', 'document_type:read'])]
    private ?\DateTimeInterface $deadlineAt = null;

    #[ORM\Column]
    #[Groups(['document:read', 'document_type:read'])]
    private bool $isActive = true;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['document:read', 'document_type:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['document:read', 'document_type:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\ManyToMany(targetEntity: DocumentCategory::class, inversedBy: 'documentTypes')]
    #[ORM\JoinTable(name: 'document_type_category')]
    #[Groups(['document:read', 'document_type:read'])]
    private Collection $categories;

    #[ORM\OneToMany(mappedBy: 'documentType', targetEntity: Document::class)]
    private Collection $documents;

    public function __construct()
    {
        $this->categories = new ArrayCollection();
        $this->documents = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): self
    {
        $this->code = $code;
        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getAllowedMimeTypes(): array
    {
        return $this->allowedMimeTypes;
    }

    public function setAllowedMimeTypes(array $allowedMimeTypes): self
    {
        $this->allowedMimeTypes = $allowedMimeTypes;
        return $this;
    }

    public function getMaxFileSize(): int
    {
        return $this->maxFileSize;
    }

    public function setMaxFileSize(int $maxFileSize): self
    {
        $this->maxFileSize = $maxFileSize;
        return $this;
    }

    public function isRequired(): bool
    {
        return $this->isRequired;
    }

    public function setIsRequired(bool $isRequired): self
    {
        $this->isRequired = $isRequired;
        return $this;
    }

    public function getDeadlineAt(): ?\DateTimeInterface
    {
        return $this->deadlineAt;
    }

    public function setDeadlineAt(?\DateTimeInterface $deadlineAt): self
    {
        $this->deadlineAt = $deadlineAt;
        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): self
    {
        $this->isActive = $isActive;
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

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @return Collection<int, DocumentCategory>
     */
    public function getCategories(): Collection
    {
        return $this->categories;
    }

    public function addCategory(DocumentCategory $category): self
    {
        if (!$this->categories->contains($category)) {
            $this->categories->add($category);
        }

        return $this;
    }

    public function removeCategory(DocumentCategory $category): self
    {
        $this->categories->removeElement($category);
        return $this;
    }

    /**
     * @return Collection<int, Document>
     */
    public function getDocuments(): Collection
    {
        return $this->documents;
    }

    public function addDocument(Document $document): self
    {
        if (!$this->documents->contains($document)) {
            $this->documents->add($document);
            $document->setDocumentType($this);
        }

        return $this;
    }

    public function removeDocument(Document $document): self
    {
        if ($this->documents->removeElement($document)) {
            if ($document->getDocumentType() === $this) {
                $document->setDocumentType(null);
            }
        }

        return $this;
    }
} 