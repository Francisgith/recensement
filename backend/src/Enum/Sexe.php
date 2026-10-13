<?php

declare(strict_types=1);

namespace App\Enum;

enum Sexe: string
{
    case LAHY = 'LAHY';
    case VAVY = 'VAVY';

    public function label(): string
    {
        return match ($this) {
            self::LAHY => 'Homme (Lahy)',
            self::VAVY => 'Femme (Vavy)',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $c): string => $c->value, self::cases());
    }
}
