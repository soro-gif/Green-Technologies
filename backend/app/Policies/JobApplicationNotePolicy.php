<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Enums\UserRole;
use App\Models\JobApplicationNote;
use App\Models\User;

/**
 * Une note ne peut être supprimée que par son auteur ou par un super administrateur.
 */
class JobApplicationNotePolicy
{
    public function delete(User $user, JobApplicationNote $note): bool
    {
        if (! $user->hasPermission(Permission::MessagesManage)) {
            return false;
        }

        return $user->hasRole(UserRole::SuperAdmin) || $note->user_id === $user->id;
    }
}
