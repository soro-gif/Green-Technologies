<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\JobOffer;
use App\Models\User;

/**
 * Les offres sont gérées par l'équipe qui traite les candidatures : même permission.
 */
class JobOfferPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }

    public function update(User $user, JobOffer $offer): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }

    public function delete(User $user, JobOffer $offer): bool
    {
        return $user->hasPermission(Permission::MessagesManage);
    }
}
