<?php

namespace App\Enums;

enum QuoteStatus: string
{
    case Pending = 'pending';
    case InReview = 'in_review';
    case Quoted = 'quoted';
    case Accepted = 'accepted';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::InReview => 'En cours d\'étude',
            self::Quoted => 'Devis transmis',
            self::Accepted => 'Accepté',
            self::Rejected => 'Refusé',
        };
    }
}
