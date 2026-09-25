<?php

namespace App\Enums;

enum Permission: string
{
    case ServicesManage = 'services.manage';
    case ProjectsManage = 'projects.manage';
    case QuotesManage = 'quotes.manage';
    case MessagesManage = 'messages.manage';
    case ArticlesManage = 'articles.manage';
    case UsersManage = 'users.manage';

    public function label(): string
    {
        return match ($this) {
            self::ServicesManage => 'Gestion des services et prestations',
            self::ProjectsManage => 'Gestion des réalisations et projets',
            self::QuotesManage => 'Gestion et suivi des devis',
            self::MessagesManage => 'Gestion des messages de contact',
            self::ArticlesManage => 'Gestion des publications et blog',
            self::UsersManage => 'Gestion des utilisateurs et rôles',
        };
    }
}
