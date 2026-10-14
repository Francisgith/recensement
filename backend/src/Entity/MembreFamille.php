<?php

declare(strict_types=1);

namespace App\Entity;

use App\Enum\Sexe;
use App\Repository\MembreFamilleRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: MembreFamilleRepository::class)]
#[ORM\Table(name: 'membre_famille')]
#[ORM\HasLifecycleCallbacks]
class MembreFamille
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Groups(['membre:read', 'individu:read'])]
    private ?Uuid $id = null;

    #[ORM\Column(length: 150)]
    #[Groups(['membre:read', 'membre:write', 'individu:read'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 150)]
    private ?string $nom = null;

    #[ORM\Column(type: Types::SMALLINT)]
    #[Groups(['membre:read', 'membre:write', 'individu:read'])]
    #[Assert\NotNull]
    #[Assert\Range(min: 0, max: 130)]
    private ?int $age = null;

    #[ORM\Column(length: 15, enumType: Sexe::class)]
    #[Groups(['membre:read', 'membre:write', 'individu:read'])]
    #[Assert\NotNull]
    private ?Sexe $sexe = null;

    #[ORM\Column(length: 150, nullable: true)]
    #[Groups(['membre:read', 'membre:write', 'individu:read'])]
    #[Assert\Length(max: 150)]
    private ?string $profession = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['membre:read', 'membre:write'])]
    #[Assert\Length(max: 100)]
    private ?string $lien = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['membre:read', 'membre:write'])]
    private ?string $photo = null;

    #[ORM\ManyToOne(targetEntity: Individu::class, inversedBy: 'membres')]
    #[ORM\JoinColumn(name: 'chef_id', referencedColumnName: 'id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['membre:read', 'membre:write'])]
    #[Assert\NotNull]
    private ?Individu $chef = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['membre:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['membre:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
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

    public function getLien(): ?string
    {
        return $this->lien;
    }

    public function setLien(?string $lien): static
    {
        $this->lien = $lien;

        return $this;
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(?string $photo): static
    {
        $this->photo = $photo;

        return $this;
    }

    public function getChef(): ?Individu
    {
        return $this->chef;
    }

    public function setChef(?Individu $chef): static
    {
        $this->chef = $chef;

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
