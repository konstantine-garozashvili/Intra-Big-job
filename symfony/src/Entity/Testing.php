<?php

namespace App\Entity;

use App\Repository\TestingRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TestingRepository::class)]
class Testing
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $kk = null;

    #[ORM\Column(length: 2555)]
    private ?string $kkk = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getKk(): ?string
    {
        return $this->kk;
    }

    public function setKk(string $kk): static
    {
        $this->kk = $kk;

        return $this;
    }

    public function getKkk(): ?string
    {
        return $this->kkk;
    }

    public function setKkk(string $kkk): static
    {
        $this->kkk = $kkk;

        return $this;
    }
}
