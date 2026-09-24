<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case Editor = 'editor';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Administrateur',
            self::Admin => 'Administrateur',
            self::Editor => 'Éditeur',
        };
    }
}
