<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission(Permission::ArticlesManage);
    }

    public function view(User $user, Article $article): bool
    {
        return $user->hasPermission(Permission::ArticlesManage);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::ArticlesManage);
    }

    public function update(User $user, Article $article): bool
    {
        return $user->hasPermission(Permission::ArticlesManage);
    }

    public function delete(User $user, Article $article): bool
    {
        return $user->hasPermission(Permission::ArticlesManage);
    }
}
