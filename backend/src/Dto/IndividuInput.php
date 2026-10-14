<?php

declare(strict_types=1);

namespace App\Dto;

use App\Enum\Sexe;
use Symfony\Component\Validator\Constraints as Assert;

class IndividuInput
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

    #[Assert\Length(max: 255)]
    public ?string $adresse = null;

    #[Assert\Length(max: 30)]
    public ?string $telephone = null;

    public ?string $photo = null;
}
