<?php

namespace App\Enums;

enum ContractType: string
{
    case Cdi = 'cdi';
    case Cdd = 'cdd';
    case Stage = 'stage';
    case Alternance = 'alternance';
    case Freelance = 'freelance';

    public function label(): string
    {
        return match ($this) {
            self::Cdi => 'CDI',
            self::Cdd => 'CDD',
            self::Stage => 'Stage',
            self::Alternance => 'Alternance',
            self::Freelance => 'Prestataire / freelance',
        };
    }
}
