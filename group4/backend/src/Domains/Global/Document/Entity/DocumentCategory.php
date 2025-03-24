<?php

namespace App\Domains\Global\Document\Entity;

use App\Domains\Global\Document\Repository\DocumentCategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: DocumentCategoryRepository::class)]
#[ORM\HasLifecycleCallbacks]
class DocumentCategory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['document:read', 'document_type:read', 'document_category:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['document:read', 'document_type:read', 'document_category:read'])]
    private ?string $code = null;

    #[ORM\Column(length: 100)]
    #[Groups(['document:read', 'document_type:read', 'document_category:read'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['document:read', 'document_type:read', 'document_category:read'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['document:read', 'document_type:read', 'document_category:read'])]
    private bool $isActive = true;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['document:read', 'document_type:read', 'document_category:read'])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['document:read', 'document_type:read', 'document_category:read'])]
    private ?\DateTimeInterface $updatedAt = null;

    #[ORM\ManyToMany(targetEntity: DocumentType::class, mappedBy: 'categories')]
    private Collection $documentTypes;

    public function __construct()
    {
        $this->documentTypes = new ArrayCollection();
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
     * @return Collection<int, DocumentType>
     */
    public function getDocumentTypes(): Collection
    {
        return $this->documentTypes;
    }

    public function addDocumentType(DocumentType $documentType): self
    {
        if (!$this->documentTypes->contains($documentType)) {
            $this->documentTypes->add($documentType);
            $documentType->addCategory($this);
        }

        return $this;
    }

    public function removeDocumentType(DocumentType $documentType): self
    {
        if ($this->documentTypes->removeElement($documentType)) {
            $documentType->removeCategory($this);
        }

        return $this;
    }
} 