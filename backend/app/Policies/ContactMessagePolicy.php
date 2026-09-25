<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\ContactMessage;
use App\Models\User;

class ContactMessagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }

    public function view(User $user, ContactMessage $message): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }

    public function update(User $user, ContactMessage $message): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }

    public function delete(User $user, ContactMessage $message): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }
}
