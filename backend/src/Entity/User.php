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
    #[Groups(['user:read', 'message:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'message:read'])]
    private ?string $lastName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'message:read'])]
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
    private ?string $phoneNumber = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "Le mot de passe est obligatoire")]
    #[Assert\Length(
        min: 8,
        max: 50,
        minMessage: "Le mot de passe doit comporter au moins {{ limit }} caractères",
        maxMessage: "Le mot de passe ne doit pas dépasser {{ limit }} caractères"
    )]
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
    #[Groups(['user:read', 'message:read'])]
    private Collection $userRoles;

    #[ORM\ManyToMany(targetEntity: Formation::class, mappedBy: 'students')]
    private Collection $formations;

    #[ORM\OneToOne(mappedBy: 'user', targetEntity: \App\Domains\Student\Entity\StudentProfile::class, cascade: ['persist', 'remove'])]
    private ?\App\Domains\Student\Entity\StudentProfile $studentProfile = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $profilePicturePath = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user:read'])]
    private ?Theme $theme = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Diploma::class, orphanRemoval: true)]
    private Collection $diplomas;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Address::class, orphanRemoval: true)]
    private Collection $addresses;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Signature::class, orphanRemoval: true)]
    private Collection $signatures;

    #[ORM\OneToMany(mappedBy: 'creator', targetEntity: Group::class)]
    #[Groups(['user:read'])]
    private Collection $createdGroups;

    #[ORM\ManyToMany(targetEntity: Group::class, mappedBy: 'members')]
    #[Groups(['user:read'])]
    private Collection $groups;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[Groups(['user:read'])]
    private ?Specialization $specialization = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $linkedinUrl = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: UserDiploma::class, orphanRemoval: true)]
    private Collection $userDiplomas;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->userRoles = new ArrayCollection();
        $this->diplomas = new ArrayCollection();
        $this->addresses = new ArrayCollection();
        $this->signatures = new ArrayCollection();
        $this->createdGroups = new ArrayCollection();
        $this->groups = new ArrayCollection();
        $this->userDiplomas = new ArrayCollection();
        $this->formations = new ArrayCollection();
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
        $this->createdAt = $createdAt;

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
     * Get user diplomas, optionally processed with obtained dates
     * 
     * @return Collection<int, Diploma>|array
     */
    public function getDiplomas(): Collection|array
    {
        if (func_num_args() > 0) {
            // When called with arguments, return the processed diplomas array
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
        
        // When called without arguments, return the collection
        return $this->diplomas;
    }

    public function addDiploma(Diploma $diploma): static
    {
        if (!$this->diplomas->contains($diploma)) {
            $this->diplomas->add($diploma);
            $diploma->setUser($this);
        }

        return $this;
    }

    public function removeDiploma(Diploma $diploma): static
    {
        if ($this->diplomas->removeElement($diploma)) {
            // set the owning side to null (unless already changed)
            if ($diploma->getUser() === $this) {
                $diploma->setUser(null);
            }
        }

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
     * @return Collection<int, Signature>
     */
    public function getSignatures(): Collection
    {
        return $this->signatures;
    }

    public function addSignature(Signature $signature): static
    {
        if (!$this->signatures->contains($signature)) {
            $this->signatures->add($signature);
            $signature->setUser($this);
        }

        return $this;
    }

    public function removeSignature(Signature $signature): static
    {
        if ($this->signatures->removeElement($signature)) {
            // set the owning side to null (unless already changed)
            if ($signature->getUser() === $this) {
                $signature->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Group>
     */
    public function getCreatedGroups(): Collection
    {
        return $this->createdGroups;
    }

    public function addCreatedGroup(Group $group): static
    {
        if (!$this->createdGroups->contains($group)) {
            $this->createdGroups->add($group);
            $group->setCreator($this);
        }

        return $this;
    }

    public function removeCreatedGroup(Group $group): static
    {
        if ($this->createdGroups->removeElement($group)) {
            // set the owning side to null (unless already changed)
            if ($group->getCreator() === $this) {
                $group->setCreator(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Group>
     */
    public function getGroups(): Collection
    {
        return $this->groups;
    }

    public function addGroup(Group $group): static
    {
        if (!$this->groups->contains($group)) {
            $this->groups->add($group);
            $group->addMember($this);
        }

        return $this;
    }

    public function removeGroup(Group $group): static
    {
        if ($this->groups->removeElement($group)) {
            $group->removeMember($this);
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

    public function getSpecialization(): ?Specialization
    {
        return $this->specialization;
    }

    public function setSpecialization(?Specialization $specialization): static
    {
        $this->specialization = $specialization;

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
     * @return Collection<int, Formation>
     */
    public function getFormations(): Collection
    {
        return $this->formations;
    }

    public function addFormation(Formation $formation): self
    {
        if (!$this->formations->contains($formation)) {
            $this->formations[] = $formation;
            $formation->addStudent($this); 
        }
        return $this;
    }

    public function removeFormation(Formation $formation): self
    {
        if ($this->formations->removeElement($formation)) {
            $formation->removeStudent($this);
        }
        return $this;
    }

    public function getStudentProfile(): ?\App\Domains\Student\Entity\StudentProfile
    {
        return $this->studentProfile;
    }

    public function setStudentProfile(?\App\Domains\Student\Entity\StudentProfile $studentProfile): self
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

    public function getProfilePicturePath(): ?string
    {
        return $this->profilePicturePath;
    }

    public function setProfilePicturePath(?string $profilePicturePath): self
    {
        $this->profilePicturePath = $profilePicturePath;
        return $this;
    }
}
