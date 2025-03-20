<?php

namespace App\Entity;

use App\Repository\SignatureRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: SignatureRepository::class)]
class Signature
{
    public const PERIOD_MORNING = 'morning';
    public const PERIOD_AFTERNOON = 'afternoon';

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

    #[ORM\Column(type: Types::STRING, length: 10)]
    #[Groups(['signature:read'])]
    private ?string $period = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['signature:read'])]
    private ?string $drawing = null;

    #[ORM\Column(type: Types::BOOLEAN, options: ['default' => false])]
    #[Groups(['signature:read'])]
    private bool $validated = false;

    public function __construct()
    {
        $this->date = new \DateTimeImmutable();
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

    public function getPeriod(): ?string
    {
        return $this->period;
    }

    public function setPeriod(string $period): static
    {
        if (!in_array($period, [self::PERIOD_MORNING, self::PERIOD_AFTERNOON])) {
            throw new \InvalidArgumentException('Invalid period');
        }
        $this->period = $period;
        return $this;
    }

    public function getDrawing(): ?string
    {
        return $this->drawing;
    }

    public function setDrawing(?string $drawing): static
    {
        $this->drawing = $drawing;
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

    public static function getAvailablePeriods(): array
    {
        return [
            self::PERIOD_MORNING => 'Matin (9h-12h)',
            self::PERIOD_AFTERNOON => 'Après-midi (13h-17h)'
        ];
    }
}
