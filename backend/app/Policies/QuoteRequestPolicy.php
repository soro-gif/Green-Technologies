<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\QuoteRequest;
use App\Models\User;

class QuoteRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission(Permission::QuotesManage);
    }

    public function view(User $user, QuoteRequest $quote): bool
    {
        return $user->hasPermission(Permission::QuotesManage);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::QuotesManage);
    }

    public function update(User $user, QuoteRequest $quote): bool
    {
        return $user->hasPermission(Permission::QuotesManage);
    }

    public function delete(User $user, QuoteRequest $quote): bool
    {
        return $user->hasPermission(Permission::QuotesManage);
    }
}
