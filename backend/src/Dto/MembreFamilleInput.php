<?php

declare(strict_types=1);

namespace App\Dto;

use App\Enum\Sexe;
use Symfony\Component\Validator\Constraints as Assert;

class MembreFamilleInput
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 150)]
    public ?string $nom = null;

    #[Assert\NotNull]
    #[Assert\Range(min: 0, max: 130)]
    public ?int $age = null;

    #[Assert\NotNull]
    public ?Sexe $sexe = null;

    #[Assert\Length(max: 150)]
    public ?string $profession = null;

    #[Assert\Length(max: 100)]
    public ?string $lien = null;

    public ?string $photo = null;

    #[Assert\NotBlank]
    #[Assert\Uuid]
    public ?string $chef = null;
}
