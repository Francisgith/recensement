<?php

declare(strict_types=1);

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class UserInput
{
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Assert\Length(max: 180)]
    public ?string $email = null;

    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 100)]
    public ?string $nom = null;

    /**
     * @var list<string>|null
     */
    #[Assert\Choice(choices: ['ROLE_ADMIN', 'ROLE_AGENT'], multiple: true)]
    public ?array $roles = null;

    #[Assert\NotBlank(groups: ['create'])]
    #[Assert\Length(min: 8, max: 4096)]
    public ?string $password = null;

    public ?bool $actif = null;
}
