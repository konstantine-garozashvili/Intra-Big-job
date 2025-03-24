<?php

namespace App\Entity;

use App\Repository\RefreshTokenRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RefreshTokenRepository::class)]
#[ORM\Table(name: "refresh_tokens")]
class RefreshToken
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 128, unique: true)]
    private ?string $refreshToken = null;

    #[ORM\Column(length: 255)]
    private ?string $username = null;

    #[ORM\Column(type: "datetime")]
    private ?\DateTimeInterface $valid = null;

    #[ORM\Column(length: 128, nullable: true)]
    private ?string $deviceId = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $deviceName = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $deviceType = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRefreshToken(): ?string
    {
        return $this->refreshToken;
    }

    public function setRefreshToken(string $refreshToken): static
    {
        $this->refreshToken = $refreshToken;

        return $this;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    public function getValid(): ?\DateTimeInterface
    {
        return $this->valid;
    }

    public function setValid(\DateTimeInterface $valid): static
    {
        $this->valid = $valid;

        return $this;
    }

    public function getDeviceId(): ?string
    {
        return $this->deviceId;
    }

    public function setDeviceId(?string $deviceId): static
    {
        $this->deviceId = $deviceId;

        return $this;
    }

    public function getDeviceName(): ?string
    {
        return $this->deviceName;
    }

    public function setDeviceName(?string $deviceName): static
    {
        $this->deviceName = $deviceName;

        return $this;
    }

    public function getDeviceType(): ?string
    {
        return $this->deviceType;
    }

    public function setDeviceType(?string $deviceType): static
    {
        $this->deviceType = $deviceType;

        return $this;
    }

    /**
     * Check if the refresh token is valid
     */
    public function isValid(): bool
    {
        return $this->valid > new \DateTime();
    }

    /**
     * Generate a unique refresh token
     */
    public static function generateToken(): string
    {
        return bin2hex(random_bytes(64));
    }
} 