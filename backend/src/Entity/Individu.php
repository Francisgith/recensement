<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\Sexe;
use App\Repository\IndividuRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: IndividuRepository::class)]
#[ORM\Table(name: 'individu')]
#[ORM\HasLifecycleCallbacks]
class Individu
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Groups(['individu:read', 'membre:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 150)]
    #[Groups(['individu:read', 'individu:write', 'membre:read'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 150)]
    private ?string $nom = null;

    #[ORM\Column(type: Types::SMALLINT)]
    #[Groups(['individu:read', 'individu:write'])]
    #[Assert\NotNull]
    #[Assert\Range(min: 0, max: 130)]
    private ?int $age = null;

    #[ORM\Column(length: 15, enumType: Sexe::class)]
    #[Groups(['individu:read', 'individu:write'])]
    #[Assert\NotNull]
    private ?Sexe $sexe = null;

    #[ORM\Column(length: 150, nullable: true)]
    #[Groups(['individu:read', 'individu:write'])]
    #[Assert\Length(max: 150)]
    private ?string $profession = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['individu:read', 'individu:write'])]
    #[Assert\Length(max: 255)]
    private ?string $adresse = null;

    #[ORM\Column(length: 30, nullable: true)]
    #[Groups(['individu:read', 'individu:write'])]
    #[Assert\Length(max: 30)]
    private ?string $telephone = null;

    /**
     * @var Collection<int, MembreFamille>
     */
    #[ORM\OneToMany(targetEntity: MembreFamille::class, mappedBy: 'chef', cascade: ['remove'], orphanRemoval: true)]
    private Collection $membres;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['individu:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['individu:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->membres = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function touchUpdatedAt(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = trim($nom);

        return $this;
    }

    public function getAge(): ?int
    {
        return $this->age;
    }

    public function setAge(int $age): static
    {
        $this->age = $age;

        return $this;
    }

    public function getSexe(): ?Sexe
    {
        return $this->sexe;
    }

    public function setSexe(Sexe $sexe): static
    {
        $this->sexe = $sexe;

        return $this;
    }

    public function getProfession(): ?string
    {
        return $this->profession;
    }

    public function setProfession(?string $profession): static
    {
        $this->profession = $profession;

        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): static
    {
        $this->adresse = $adresse;

        return $this;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(?string $telephone): static
    {
        $this->telephone = $telephone;

        return $this;
    }

    /**
     * @return Collection<int, MembreFamille>
     */
    public function getMembres(): Collection
    {
        return $this->membres;
    }

    public function addMembre(MembreFamille $membre): static
    {
        if (!$this->membres->contains($membre)) {
            $this->membres->add($membre);
            $membre->setChef($this);
        }

        return $this;
    }

    public function removeMembre(MembreFamille $membre): static
    {
        if ($this->membres->removeElement($membre) && $membre->getChef() === $this) {
            $membre->setChef(null);
        }

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
