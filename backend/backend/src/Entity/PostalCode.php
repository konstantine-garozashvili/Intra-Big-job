<?php

namespace App\Entity;

use App\Repository\PostalCodeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PostalCodeRepository::class)]
class PostalCode
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['postal_code:read', 'city:read', 'address:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 10)]
    #[Groups(['postal_code:read', 'city:read', 'address:read'])]
    private ?string $code = null;

    #[ORM\ManyToOne(inversedBy: 'postalCodes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['postal_code:read', 'address:read'])]
    private ?City $city = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['postal_code:read', 'city:read', 'address:read'])]
    private ?string $district = null;

    #[ORM\OneToMany(mappedBy: 'postalCode', targetEntity: Address::class)]
    private Collection $addresses;

    public function __construct()
    {
        $this->addresses = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getCity(): ?City
    {
        return $this->city;
    }

    public function setCity(?City $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function getDistrict(): ?string
    {
        return $this->district;
    }

    public function setDistrict(?string $district): static
    {
        $this->district = $district;

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
            $address->setPostalCode($this);
        }

        return $this;
    }

    public function removeAddress(Address $address): static
    {
        if ($this->addresses->removeElement($address)) {
            // set the owning side to null (unless already changed)
            if ($address->getPostalCode() === $this) {
                $address->setPostalCode(null);
            }
        }

        return $this;
    }
} 