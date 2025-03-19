<?php

namespace App\Entity;

use App\Repository\CityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CityRepository::class)]
class City
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['city:read', 'address:read', 'postal_code:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['city:read', 'address:read', 'postal_code:read'])]
    private ?string $name = null;

    #[ORM\OneToMany(mappedBy: 'city', targetEntity: Address::class)]
    private Collection $addresses;

    #[ORM\OneToMany(mappedBy: 'city', targetEntity: PostalCode::class, orphanRemoval: true)]
    #[Groups(['city:read'])]
    private Collection $postalCodes;

    public function __construct()
    {
        $this->addresses = new ArrayCollection();
        $this->postalCodes = new ArrayCollection();
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

    /**
     * @return Collection<int, Address>
     */
    public function getAddresses(): Collection
    {
        return $this->addresses;
    }

    public function addAddress(Address $address): static
    {
        if (!$this->addresses->contains($address)) {
            $this->addresses->add($address);
            $address->setCity($this);
        }

        return $this;
    }

    public function removeAddress(Address $address): static
    {
        if ($this->addresses->removeElement($address)) {
            // set the owning side to null (unless already changed)
            if ($address->getCity() === $this) {
                $address->setCity(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, PostalCode>
     */
    public function getPostalCodes(): Collection
    {
        return $this->postalCodes;
    }

    public function addPostalCode(PostalCode $postalCode): static
    {
        if (!$this->postalCodes->contains($postalCode)) {
            $this->postalCodes->add($postalCode);
            $postalCode->setCity($this);
        }

        return $this;
    }

    public function removePostalCode(PostalCode $postalCode): static
    {
        if ($this->postalCodes->removeElement($postalCode)) {
            // set the owning side to null (unless already changed)
            if ($postalCode->getCity() === $this) {
                $postalCode->setCity(null);
            }
        }

        return $this;
    }
} 