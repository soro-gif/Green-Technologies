<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission(Permission::ProjectsManage);
    }

    public function view(User $user, Project $project): bool
    {
        return $user->hasPermission(Permission::ProjectsManage);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::ProjectsManage);
    }

    public function update(User $user, Project $project): bool
    {
        return $user->hasPermission(Permission::ProjectsManage);
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->hasPermission(Permission::ProjectsManage);
    }
}
