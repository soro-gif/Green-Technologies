<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\JobApplication;
use App\Models\User;

/**
 * Les candidatures arrivent par le même canal que les messages : même permission.
 */
class JobApplicationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }

    public function view(User $user, JobApplication $application): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }

    public function update(User $user, JobApplication $application): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }

    public function delete(User $user, JobApplication $application): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }
}
