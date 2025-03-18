<?php

namespace App\Entity;

use App\Domains\Student\Entity\StudentProfile;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements PasswordAuthenticatedUserInterface, UserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read'])]
    private ?string $lastName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read'])]
    private ?string $firstName = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['user:read'])]
    private ?\DateTimeInterface $birthDate = null;

    #[ORM\Column(length: 255, unique: true)]
    #[Groups(['user:read'])]
    private ?string $email = null;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user:read'])]
    private ?Nationality $nationality = null;

    #[ORM\Column(length: 20)]
    #[Groups(['user:read'])]
    #[Assert\NotBlank(message: "Le numéro de téléphone ne peut pas être vide")]
    #[Assert\Regex(
        pattern: "/^\+?[0-9]{10,15}$/",
        message: "Le numéro de téléphone doit contenir entre 10 et 15 chiffres, éventuellement précédé d'un +"
    )]
    private ?string $phoneNumber = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['user:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['user:read'])]
    private bool $isEmailVerified = false;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $verificationToken = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $resetPasswordToken = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $resetPasswordExpires = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: UserRole::class, orphanRemoval: true)]
    private Collection $userRoles;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user:read'])]
    private ?Theme $theme = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Address::class, orphanRemoval: true)]
    private Collection $addresses;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read'])]
    private ?string $profilePicturePath = null;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[Groups(['user:read'])]
    private ?Specialization $specialization = null;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    #[Groups(['user:read'])]
    private ?StudentProfile $studentProfile = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:read'])]
    #[Assert\Regex(
        pattern: "/^https:\/\/www\.linkedin\.com\/in\/.+/",
        message: "Le lien LinkedIn doit commencer par 'https://www.linkedin.com/in/'"
    )]
    private ?string $linkedinUrl = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: UserDiploma::class, orphanRemoval: true)]
    private Collection $userDiplomas;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: UserStatus::class, orphanRemoval: true)]
    private Collection $userStatuses;


    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->userRoles = new ArrayCollection();
        $this->addresses = new ArrayCollection();
        $this->userDiplomas = new ArrayCollection();
        $this->userStatuses = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getBirthDate(): ?\DateTimeInterface
    {
        return $this->birthDate;
    }

    public function setBirthDate(\DateTimeInterface $birthDate): static
    {
        $this->birthDate = $birthDate;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getNationality(): ?Nationality
    {
        return $this->nationality;
    }

    public function setNationality(?Nationality $nationality): static
    {
        $this->nationality = $nationality;

        return $this;
    }

    public function getPhoneNumber(): ?string
    {
        return $this->phoneNumber;
    }

    public function setPhoneNumber(string $phoneNumber): static
    {
        $this->phoneNumber = $phoneNumber;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }


    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function isEmailVerified(): bool
    {
        return $this->isEmailVerified;
    }

    public function setIsEmailVerified(bool $isEmailVerified): static
    {
        $this->isEmailVerified = $isEmailVerified;

        return $this;
    }

    public function getVerificationToken(): ?string
    {
        return $this->verificationToken;
    }

    public function setVerificationToken(?string $verificationToken): static
    {
        $this->verificationToken = $verificationToken;

        return $this;
    }

    public function getResetPasswordToken(): ?string
    {
        return $this->resetPasswordToken;
    }

    public function setResetPasswordToken(?string $resetPasswordToken): static
    {
        $this->resetPasswordToken = $resetPasswordToken;

        return $this;
    }

    public function getResetPasswordExpires(): ?\DateTimeImmutable
    {
        return $this->resetPasswordExpires;
    }

    public function setResetPasswordExpires(?\DateTimeImmutable $resetPasswordExpires): static
    {
        $this->resetPasswordExpires = $resetPasswordExpires;

        return $this;
    }

    /**
     * @return Collection<int, UserRole>
     */
    public function getUserRoles(): Collection
    {
        return $this->userRoles;
    }

    public function addUserRole(UserRole $userRole): static
    {
        if (!$this->userRoles->contains($userRole)) {
            $this->userRoles->add($userRole);
            $userRole->setUser($this);
        }

        return $this;
    }

    public function removeUserRole(UserRole $userRole): static
    {
        if ($this->userRoles->removeElement($userRole)) {
            // set the owning side to null (unless already changed)
            if ($userRole->getUser() === $this) {
                $userRole->setUser(null);
            }
        }

        return $this;
    }

    public function getTheme(): ?Theme
    {
        return $this->theme;
    }

    public function setTheme(?Theme $theme): static
    {
        $this->theme = $theme;

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
            $address->setUser($this);
        }

        return $this;
    }

    public function removeAddress(Address $address): static
    {
        if ($this->addresses->removeElement($address)) {
            // set the owning side to null (unless already changed)
            if ($address->getUser() === $this) {
                $address->setUser(null);
            }
        }

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = [];
        
        foreach ($this->userRoles as $userRole) {
            $roleName = $userRole->getRole()->getName();
            
            // Vérifier si le préfixe ROLE_ est déjà présent
            if (strpos($roleName, 'ROLE_') === 0) {
                $roles[] = strtoupper($roleName);
            } else {
                $roles[] = 'ROLE_' . strtoupper($roleName);
            }
        }
        
        // S'assurer qu'il y a au moins un rôle (utiliser ROLE_GUEST si aucun rôle n'est défini)
        if (empty($roles)) {
            $roles[] = 'ROLE_GUEST';
        }

        return array_unique($roles);
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getProfilePicturePath(): ?string
    {
        return $this->profilePicturePath;
    }

    public function setProfilePicturePath(?string $profilePicturePath): static
    {
        $this->profilePicturePath = $profilePicturePath;
        return $this;
    }

    public function getSpecialization(): ?Specialization
    {
        return $this->specialization;
    }

    public function setSpecialization(?Specialization $specialization): static
    {
        $this->specialization = $specialization;
        return $this;
    }

    public function getStudentProfile(): ?StudentProfile
    {
        return $this->studentProfile;
    }

    public function setStudentProfile(?StudentProfile $studentProfile): static
    {
        // unset the owning side of the relation if necessary
        if ($studentProfile === null && $this->studentProfile !== null) {
            $this->studentProfile->setUser(null);
        }

        // set the owning side of the relation if necessary
        if ($studentProfile !== null && $studentProfile->getUser() !== $this) {
            $studentProfile->setUser($this);
        }

        $this->studentProfile = $studentProfile;

        return $this;
    }

    public function getLinkedinUrl(): ?string
    {
        return $this->linkedinUrl;
    }

    public function setLinkedinUrl(?string $linkedinUrl): static
    {
        $this->linkedinUrl = $linkedinUrl;
        return $this;
    }

    /**
     * @return Collection<int, UserDiploma>
     */
    public function getUserDiplomas(): Collection
    {
        return $this->userDiplomas;
    }

    public function addUserDiploma(UserDiploma $userDiploma): static
    {
        if (!$this->userDiplomas->contains($userDiploma)) {
            $this->userDiplomas->add($userDiploma);
            $userDiploma->setUser($this);
        }

        return $this;
    }

    public function removeUserDiploma(UserDiploma $userDiploma): static
    {
        if ($this->userDiplomas->removeElement($userDiploma)) {
            // set the owning side to null (unless already changed)
            if ($userDiploma->getUser() === $this) {
                $userDiploma->setUser(null);
            }
        }

        return $this;
    }

    /**
     * Get all diplomas associated with this user
     * 
     * @return array An array of diploma objects with their obtained dates
     */
    public function getDiplomas(): array
    {
        $diplomas = [];
        foreach ($this->userDiplomas as $userDiploma) {
            $diploma = $userDiploma->getDiploma();
            // Add the obtained date to the diploma object
            $diploma->obtainedAt = $userDiploma->getObtainedDate();
            $diplomas[] = $diploma;
        }
        
        // Trier les diplômes par date d'obtention (du plus récent au plus ancien)
        usort($diplomas, function($a, $b) {
            if (!$a->obtainedAt || !$b->obtainedAt) {
                return 0;
            }
            return $b->obtainedAt <=> $a->obtainedAt;
        });
        
        return $diplomas;
    }

    /**
     * @return Collection<int, UserStatus>
     */
    public function getUserStatuses(): Collection
    {
        return $this->userStatuses;
    }

    public function addUserStatus(UserStatus $userStatus): static
    {
        if (!$this->userStatuses->contains($userStatus)) {
            $this->userStatuses->add($userStatus);
            $userStatus->setUser($this);
        }

        return $this;
    }

    public function removeUserStatus(UserStatus $userStatus): static
    {
        if ($this->userStatuses->removeElement($userStatus)) {
            if ($userStatus->getUser() === $this) {
                $userStatus->setUser(null);
            }
        }

        return $this;
    }
}

