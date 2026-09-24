<?php

namespace App\Enums;

enum MessageStatus: string
{
    case Unread = 'unread';
    case Read = 'read';
    case Replied = 'replied';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Unread => 'Non lu',
            self::Read => 'Lu',
            self::Replied => 'Répondu',
            self::Archived => 'Archivé',
        };
    }
}
