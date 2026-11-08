<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case New = 'new';
    case Reviewing = 'reviewing';
    case Interview = 'interview';
    case Hired = 'hired';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::New => 'Nouvelle',
            self::Reviewing => 'En cours d\'étude',
            self::Interview => 'Entretien',
            self::Hired => 'Retenue',
            self::Rejected => 'Non retenue',
        };
    }
}
